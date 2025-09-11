// src/app/components/Sidebar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelRightOpen,
} from "lucide-react";
import { menuConfig } from "@/app/config/menuConfig";

/* ---------- styles ---------- */
const itemBase =
  "flex items-center gap-3 py-2 rounded-lg transition-[background,color] duration-150";
const itemIdle = "text-slate-300 hover:text-indigo-300 hover:bg-white/5";
const itemActive =
  "text-indigo-300 bg-white/10 ring-1 ring-inset ring-white/10";
const sectionTitleCls =
  "px-3 text-xs uppercase tracking-wider text-slate-400/70 mt-6 mb-2";

/* ---------- helpers ---------- */
const OPEN_KEY = "sb:open";
const COLLAPSE_KEY = "sb:collapsed";
const EMPLOYEE_KEY = "emp";

function canSee(roles, role) {
  if (!roles || roles.length === 0) return true;
  if (!role) return false;
  return roles.includes(role);
}

function isActivePath(pathname, href) {
  if (!href) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

function IconRender({ Icon, collapsed, label }) {
  if (!Icon) return null;
  return (
    <span className="pl-3 shrink-0">
      <Icon
        size={18}
        aria-hidden="true"
        title={collapsed ? label : undefined}
      />
    </span>
  );
}

/* ---------- single link ---------- */
function NavLink({ node, active, collapsed }) {
  const Icon = node.icon;
  return (
    <Link
      href={node.href}
      className={`${itemBase} ${active ? itemActive : itemIdle} ${
        collapsed ? "justify-center px-0 mx-2" : ""
      }`}
      title={collapsed ? node.label : undefined}
    >
      <IconRender Icon={Icon} collapsed={collapsed} label={node.label} />
      {!collapsed && <span className="truncate">{node.label}</span>}
    </Link>
  );
}

/* ===========================================================
   Recursive node (รองรับ group → group → link … ได้ไม่จำกัดชั้น)
   =========================================================== */
function RecursiveNode({
  node,
  depth,
  collapsed,
  pathname,
  open,
  setOpen,
  role,
}) {
  const paddingLeft = collapsed ? 0 : Math.min(depth * 12, 32); // px

  // ลิงก์ปกติ
  if (node.type === "link") {
    return (
      <li style={{ paddingLeft }}>
        <NavLink
          node={node}
          active={isActivePath(pathname, node.href)}
          collapsed={collapsed}
        />
      </li>
    );
  }

  // กลุ่มเมนู (มี children)
  if (node.type === "group") {
    // กรองสิทธิ์ให้ลูก ๆ ก่อน
    const children = node.children?.filter((n) => canSee(n.roles, role)) ?? [];

    const opened = !!open[node.key];
    const toggle = () => setOpen((s) => ({ ...s, [node.key]: !opened }));
    const Icon = node.icon;

    return (
      <li className="relative" style={{ paddingLeft }}>
        {/* ปุ่มหัวข้อ group */}
        <button
          onClick={toggle}
          className={`${itemBase} justify-between ${
            opened ? itemActive : itemIdle
          } ${collapsed ? "justify-center px-0 mx-2" : ""} w-full`}
          style={{ paddingLeft }}
          title={collapsed ? node.label : undefined}
        >
          <span className="flex items-center gap-3">
            <IconRender Icon={Icon} collapsed={collapsed} label={node.label} />
            {!collapsed && <span className="truncate">{node.label}</span>}
          </span>
          {!collapsed && (
            <span className="ml-auto">
              {opened ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </span>
          )}
        </button>

        {/* children: โหมด sidebar ปกติ */}
        {!collapsed && opened && children.length > 0 && (
          <ul className="mt-1 space-y-1">
            {children.map((child) => (
              <RecursiveNode
                key={child.key}
                node={child}
                depth={depth + 1}
                collapsed={collapsed}
                pathname={pathname}
                open={open}
                setOpen={setOpen}
                role={role}
              />
            ))}
          </ul>
        )}

        {/* children: โหมด sidebar ยุบเป็นไอคอน → โชว์ flyout ข้าง ๆ */}
        {collapsed && opened && children.length > 0 && (
          <div className="absolute left-full top-0 ml-2 w-64 rounded-xl bg-[#0F172B] border border-white/10 shadow-2xl p-2 z-40">
            {/* หัวข้อ */}
            <p className="px-2 py-1 text-xs text-slate-400/80">{node.label}</p>
            <ul className="space-y-1">
              {children.map((child) => (
                <RecursiveNode
                  key={child.key}
                  node={child}
                  depth={0}
                  collapsed={false}
                  pathname={pathname}
                  open={open}
                  setOpen={setOpen}
                  role={role}
                />
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  }

  return null;
}

/* =========================================================== */

export default function Sidebar() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "employee";
  const pathname = usePathname();

  // สถานะพับ/กางของทุก group เก็บใน object
  const [open, setOpen] = useState({});
  const [collapsed, setCollapsed] = useState(false);

  // restore
  useEffect(() => {
    try {
      const o = localStorage.getItem(OPEN_KEY);
      if (o) {
        const parsed = JSON.parse(o) || {};
        // ถ้ายังไม่เคยมีสถานะของ employee ให้เปิดเป็นค่าเริ่มต้น
        if (!(EMPLOYEE_KEY in parsed)) parsed[EMPLOYEE_KEY] = true;
        setOpen(parsed);
      } else {
        // ครั้งแรก: เปิดเฉพาะ employee
        setOpen({ [EMPLOYEE_KEY]: true });
      }
      const c = localStorage.getItem(COLLAPSE_KEY);
      if (c) setCollapsed(c === "1");
    } catch {}
  }, []);
  // persist
  useEffect(() => {
    try {
      localStorage.setItem(OPEN_KEY, JSON.stringify(open));
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {}
  }, [open, collapsed]);

  // กรองสิทธิ์ระดับบนสุด
  const items = useMemo(() => {
    return menuConfig
      .filter((n) => canSee(n.roles, role))
      .map((n) =>
        n.type === "group" && n.children
          ? { ...n, children: n.children.filter((c) => canSee(c.roles, role)) }
          : n
      );
  }, [role]);

  return (
    <aside
      className={`hidden md:block shrink-0 border-r border-white/10 bg-[#0F172B] transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      <div className="h-dvh sticky top-0 flex flex-col">
        {/* Brand + collapse */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 grid place-items-center">
              <span className="text-indigo-300 font-bold">9</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold tracking-wide text-slate-100">
                HRMS Portal
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="p-2 text-slate-300 hover:text-indigo-300 rounded-lg hover:bg-white/5"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelRightOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {items.map((node) => {
            if (node.type === "link") {
              return (
                <NavLink
                  key={node.key}
                  node={node}
                  active={isActivePath(pathname, node.href)}
                  collapsed={collapsed}
                />
              );
            }

            return (
              <div key={node.key}>
                {!collapsed && <p className={sectionTitleCls}>{node.label}</p>}
                <ul className="space-y-1">
                  {(node.children ?? []).map((child) => (
                    <RecursiveNode
                      key={child.key}
                      node={child}
                      depth={0}
                      collapsed={collapsed}
                      pathname={pathname}
                      open={open}
                      setOpen={setOpen}
                      role={role}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 text-xs text-slate-400">
          © {new Date().getFullYear()} | 9 EXPERT COMPANY LIMITED
        </div>
      </div>
    </aside>
  );
}
