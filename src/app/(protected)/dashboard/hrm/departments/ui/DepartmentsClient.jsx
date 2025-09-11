"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, Users, ChevronDown, ChevronRight } from "lucide-react";
import { levelsForDept } from "@/lib/hr/constants";

export default function DepartmentsClient({ items }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(() =>
    Object.fromEntries(items.map((x) => [x.code, false]))
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (d) =>
        d.code.toLowerCase().includes(s) ||
        d.fullName.toLowerCase().includes(s)
    );
  }, [q, items]);

  return (
    <div className="mt-6">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search department code, full name…"
          className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-indigo-400/40
                     text-slate-200 placeholder:text-slate-500 px-10 py-2.5 outline-none"
        />
      </div>

      {/* List */}
      <ul className="space-y-3">
        {filtered.map((d) => {
          const lvDefs = levelsForDept(d.code);
          return (
            <li key={d.code} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setOpen((prev) => ({ ...prev, [d.code]: !prev[d.code] }))}
                className="w-full px-4 py-3 flex items-center gap-3 text-left"
              >
                <span
                  className="shrink-0 h-9 w-9 grid place-items-center rounded-lg text-[12px] font-semibold text-white ring-1 ring-white/10"
                  style={{ background: d.color }}
                >
                  {d.code}
                </span>

                <div className="min-w-0">
                  <p className="text-slate-100 font-medium leading-5 truncate">
                    {d.fullName}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {d.total} member{d.total !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Level chips summary */}
                <div className="ml-auto flex items-center gap-2">
                  {lvDefs.map((lv) => {
                    const count = d.levelCount[lv.value] || 0;
                    return (
                      <span
                        key={lv.value}
                        className={`text-[12px] rounded-lg px-2 py-1 ring-1 ring-inset
                          ${count > 0
                            ? "bg-indigo-500/15 text-indigo-300 ring-indigo-400/20"
                            : "bg-white/5 text-slate-400 ring-white/10"}`}
                        title={lv.label}
                      >
                        {lv.label.split(" ")[0]}: {count}
                      </span>
                    );
                  })}

                  <span className="ml-1 inline-flex items-center gap-1 text-slate-300 text-sm bg-white/5 rounded-lg px-2.5 py-1 ring-1 ring-white/10">
                    <Users size={15} />
                    {d.total}
                  </span>

                  <span className="text-slate-400">
                    {open[d.code] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </span>
                </div>
              </button>

              {/* Members list */}
              {open[d.code] && (
                <div className="px-4 pb-3">
                  {d.members.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-slate-400">
                      No members
                    </div>
                  ) : (
                    <ul className="divide-y divide-white/10">
                      {d.members.map((m) => (
                        <li key={m.id} className="py-3 flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl overflow-hidden ring-1 ring-white/10 bg-white/5">
                            <Image
                              src={m.photo || "/avatar-default.png"}
                              alt={m.name}
                              width={36}
                              height={36}
                              className="h-9 w-9 object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-slate-100 leading-5 truncate">
                              {m.name}{" "}
                              {m.nick ? (
                                <span className="text-slate-400 text-sm">({m.nick})</span>
                              ) : null}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-400">
                              <span className="rounded-md bg-white/5 px-2 py-0.5 ring-1 ring-white/10">
                                Emp ID: {m.empId || "-"}
                              </span>
                              {m.position ? (
                                <span className="rounded-md bg-white/5 px-2 py-0.5 ring-1 ring-white/10">
                                  {m.position}
                                </span>
                              ) : null}
                              <span className="rounded-md px-2 py-0.5 ring-1 ring-inset
                                  bg-indigo-500/15 text-indigo-300 ring-indigo-400/20">
                                {m.levelName}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
