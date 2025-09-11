"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Mail, Phone } from "lucide-react";

export default function EmployeeGroupsClient({ groups, order, labels }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(() => new Set()); // dept ที่เปิดอยู่

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return groups;
    const out = {};
    Object.entries(groups).forEach(([dept, list]) => {
      const keep = list.filter(e =>
        [e.name, e.nickName, e.empAutoId, e.position, e.email, e.phone]
          .filter(Boolean)
          .some(v => v.toLowerCase().includes(s))
      );
      if (keep.length) out[dept] = keep;
    });
    return out;
  }, [q, groups]);

  return (
    <>
      <div className="flex items-center gap-3">
        <input
          placeholder="Search name, employee ID, position, email, phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full h-11 rounded-xl bg-white/5 px-4 text-slate-100 ring-1 ring-inset ring-white/10 placeholder:text-slate-400 focus:outline-none focus:ring-indigo-400/40"
        />
      </div>

      <div className="space-y-4">
        {order.filter((k) => filtered[k]?.length).map((dept) => (
          <section key={dept} className="rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10">
            <button
              onClick={() => {
                const n = new Set(open);
                n.has(dept) ? n.delete(dept) : n.add(dept);
                setOpen(n);
              }}
              className="w-full flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm rounded-lg bg-white/10 px-2 py-1 tracking-wide text-slate-300">
                  {dept}
                </span>
                <h2 className="text-lg font-medium text-slate-100">
                  {labels[dept] || dept}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">{filtered[dept].length} people</span>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${open.has(dept) ? "rotate-180" : ""} text-slate-400`}
                />
              </div>
            </button>

            {open.has(dept) && (
              <ul className="divide-y divide-white/10">
                {filtered[dept].map((e) => (
                  <li key={e.id} className="px-4 py-3 hover:bg-white/5/50">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden ring-1 ring-white/10">
                        <Image src={e.photoUrl} alt={e.name} fill sizes="40px" className="object-cover" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-medium text-slate-100 truncate">{e.name}</span>
                          {e.nickName && <span className="text-xs text-slate-400">({e.nickName})</span>}
                          <span className="text-xs rounded-md bg-white/10 px-2 py-0.5 text-slate-300">{e.empAutoId}</span>
                          <span className="text-xs text-slate-400">{e.position}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                          {e.phone && (
                            <span className="inline-flex items-center gap-1 text-slate-400">
                              <Phone size={14} /> {e.phone}
                            </span>
                          )}
                          {e.email && (
                            <span className="inline-flex items-center gap-1 text-slate-400">
                              <Mail size={14} /> {e.email}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/hrm/employee-profile?id=${e.id}`}
                        className="rounded-lg px-3 py-1.5 text-sm text-indigo-300 hover:bg-white/10 ring-1 ring-white/10"
                      >
                        View
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {Object.keys(filtered).length === 0 && (
          <div className="rounded-xl border border-white/10 p-6 text-center text-slate-400">
            No results
          </div>
        )}
      </div>
    </>
  );
}
