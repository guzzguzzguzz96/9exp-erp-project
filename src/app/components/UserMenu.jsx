"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  ChevronDown, User as UserIcon, MessageSquare, Inbox,
  UserPlus, LogOut
} from "lucide-react";


export default function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const avatar = user?.photoUrl || "/avatar-default.png"; // 👈 ใส่รูป fallback ใน public

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="ml-auto relative h-9 w-9 rounded-full overflow-hidden ring-1 ring-white/10 ">
          <Image src={avatar} alt="avatar" fill sizes="36px" className="object-cover" />
          {/* <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0F172B]" /> */}
        </div>
        <div className="hidden md:flex flex-col items-start leading-tight">
          <span className="text-sm font-medium text-slate-100 truncate max-w-[140px]">
            {user?.name || "User"}
          </span>
          <span className="text-xs text-emerald-400">online</span>
        </div>
        <ChevronDown size={18} className="text-slate-400" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 rounded-xl bg-[#0F172B] ring-1 ring-white/10 shadow-lg p-1 "
        >
          <MenuItem href="/dashboard/hrm/employee-profile" icon={<UserIcon size={16} />} label="Profile" onClick={() => setOpen(false)} />
          <MenuItem href="/dashboard/chat"    icon={<MessageSquare size={16} />} label="Chat"    onClick={() => setOpen(false)} />
          <MenuItem href="/dashboard/inbox"   icon={<Inbox size={16} />} label="Inbox"          onClick={() => setOpen(false)} />
          {/* โชว์เฉพาะ role ที่กำหนด */}
          {["superadmin", "hr"].includes(user?.role) && (
            <MenuItem href="/dashboard/admin/register" icon={<UserPlus size={16} />} label="Add Account" onClick={() => setOpen(false)} />
          )}
          <hr className="my-1 border-white/10" />
          <button
            onClick={() => signOut({ callbackUrl: "/login" , redirect: true })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-slate-300 hover:text-indigo-300 hover:bg-white/5"
            role="menuitem"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({ href, icon, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-indigo-300 hover:bg-white/5"
      role="menuitem"
    >
      {icon} <span>{label}</span>
    </Link>
  );
}
