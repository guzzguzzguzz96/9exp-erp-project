"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

const LEVEL_LABEL = {
  1: "Newbie",
  2: "Junior",
  3: "Senior",
  4: "Lead",
  5: "Manager",
  6: "CEO/CTO",
};

export default function DepartmentsClient({ initialItems, canEdit = false }) {
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return initialItems;
    return initialItems.filter((d) => {
      const name = d.name?.toLowerCase() ?? "";
      const code = d.code?.toLowerCase() ?? "";
      const desc = d.description?.toLowerCase() ?? "";
      return name.includes(s) || code.includes(s) || desc.includes(s);
    });
  }, [q, initialItems]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, code, description..."
          className="w-full rounded-xl bg-white/5 text-slate-200 placeholder:text-slate-500 border border-white/10 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
        <Search className="absolute right-3 top-2.5 h-5 w-5 text-slate-500" />
      </div>

      {/* Grid */}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((d) => (
          <li
            key={d._id}
            className="rounded-2xl border border-white/10 bg-[#0F172B] p-4 hover:border-indigo-500/30 transition"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: d.color || "#6366f1" }}
                    aria-hidden
                  />
                  <span className="text-slate-300 text-sm">{d.code}</span>
                </div>
                <h3 className="text-lg font-medium text-slate-100">
                  {d.name}
                </h3>
                {/* จำนวนพนักงาน */}
                <div className="text-xs text-slate-400">
                  {Number(d._empCount ?? 0)}{" "}
                  {Number(d._empCount ?? 0) === 1 ? "person" : "people"}
                </div>
              </div>

              {canEdit && (
                <Link
                  href={`/dashboard/hrm/departments/${d._id}/edit`}
                  className="text-indigo-300 hover:text-indigo-200 text-sm"
                >
                  Edit
                </Link>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(d.allowLevels ?? d.allowedLevels ?? []).map((lv) => (
                <span
                  key={lv}
                  className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-300 ring-1 ring-white/10"
                  title={`Level ${lv}`}
                >
                  {LEVEL_LABEL[lv] ?? lv}
                </span>
              ))}
            </div>

            {d.description ? (
              <p className="mt-3 text-sm text-slate-400 line-clamp-2">
                {d.description}
              </p>
            ) : null}
          </li>
        ))}

        {items.length === 0 && (
          <li className="col-span-full">
            <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-slate-400">
              ไม่พบข้อมูลที่ค้นหา
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}
