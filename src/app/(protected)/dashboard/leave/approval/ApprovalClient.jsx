// app/(protected)/dashboard/leave/approval/ApprovalClient.jsx
"use client";

import { useEffect, useMemo, useState } from "react";

function toDate(d) { try { return new Date(d); } catch { return null; } }
function fmtRange(s, e) {
  const S = toDate(s), E = toDate(e);
  if (!S || !E) return "-";
  return `${S.toLocaleDateString()} - ${E.toLocaleDateString()}`;
}

// สไตล์ปุ่มเพจ
function PageBtn({ active, disabled, children, onClick }) {
  const base = "min-w-8 px-3 py-1.5 rounded-lg ring-1 ring-white/10 text-sm";
  const act  = "bg-indigo-600 text-white";
  const nor  = "bg-white/5 text-slate-200 hover:bg-white/10";
  const dis  = "opacity-50 pointer-events-none";
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${base} ${active ? act : nor} ${disabled ? dis : ""}`}>
      {children}
    </button>
  );
}

export default function ApprovalClient() {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("pending"); // pending | approved | rejected | all

  // --- pagination (client-side) ---
  const pageSize = 10;
  const [page, setPage] = useState(1);

  // โหลดข้อมูลตามสถานะ
  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/leave/approvals/for-me?status=${status}`, { cache: "no-store" });
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const j = isJson ? await res.json().catch(() => ({})) : {};
      if (!res.ok) throw new Error(j?.message || `HTTP ${res.status}`);
      // รองรับทั้งรูป {items:[...]} หรือ array ตรง ๆ
      setList(j.items || j.rows || j || []);
      setPage(1); // reset ไปหน้าแรกทุกครั้งที่ reload
    } catch (e) {
      alert(e.message || "โหลดรายการไม่สำเร็จ");
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [status]);

  // filter keyword (ในหน้า)
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return list;
    return (list || []).filter((r) => {
      // ชื่อพนักงาน: ใช้ employee หรือ employeeId (บาง API populate ไว้ที่ employeeId)
      const emp = r.employee || r.employeeId || {};
      const name = [emp.firstName, emp.lastName].filter(Boolean).join(" ").toLowerCase();
      return (
        name.includes(kw) ||
        (r.typeCode || "").toLowerCase().includes(kw) ||
        (r.reason || "").toLowerCase().includes(kw) ||
        (r.status || "").toLowerCase().includes(kw)
      );
    });
  }, [list, q]);

  // คำนวณชุดข้อมูลเฉพาะหน้าปัจจุบัน
  const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / pageSize));
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // เมื่อเปลี่ยน keyword หรือ list ให้กลับหน้า 1
  useEffect(() => { setPage(1); }, [q, list]);

  async function doApprove(id) {
    if (!confirm("ยืนยันอนุมัติคำขอนี้ใช่ไหม?")) return;
    try {
      const res = await fetch(`/api/leave/requests/${id}/approve`, { method: "POST" });
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const j = isJson ? await res.json().catch(() => ({})) : {};
      if (!res.ok) throw new Error(j?.message || "approve failed");
      await load();
    } catch (e) {
      alert(e.message || "Approve ไม่สำเร็จ");
    }
  }

  async function doReject(id) {
    const reason = prompt("เหตุผลการปฏิเสธ (optional)");
    if (reason === null) return;
    try {
      const res = await fetch(`/api/leave/requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const j = isJson ? await res.json().catch(() => ({})) : {};
      if (!res.ok) throw new Error(j?.message || "reject failed");
      await load();
    } catch (e) {
      alert(e.message || "Reject ไม่สำเร็จ");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหา ชื่อพนักงาน / ประเภท / สถานะ..."
          className="flex-1 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10 text-slate-100"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10 text-slate-100"
          title="กรองสถานะ"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-slate-200 ring-1 ring-white/10 disabled:opacity-60"
        >
          Reload
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden ring-1 ring-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">พนักงาน</th>
              <th className="px-3 py-2 text-left">ประเภท</th>
              <th className="px-3 py-2 text-left">ช่วงวันลา</th>
              <th className="px-3 py-2 text-left">สถานะ</th>
              <th className="px-3 py-2 text-left">เอกสาร</th>
              <th className="px-3 py-2 text-right w-48">การทำรายการ</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-5 text-center text-slate-400">
                  {loading ? "กำลังโหลด..." : "ไม่มีคำขอที่ต้องอนุมัติ"}
                </td>
              </tr>
            )}

            {pageRows.map((req) => {
              // ✅ ชื่อพนักงาน: รองรับทั้ง req.employee และ req.employeeId (populate)
              const emp = req.employee || req.employeeId || {};
              const full = [emp.firstName, emp.lastName].filter(Boolean).join(" ");
              const period = fmtRange(req.startDate, req.endDate);

              return (
                <tr key={req._id} className="border-t border-white/10">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-100">{full || "-"}</div>
                    <div className="text-slate-400">{emp.position || "-"}</div>
                  </td>
                  <td className="px-3 py-2">{req.typeCode || "-"}</td>
                  <td className="px-3 py-2">{period}</td>
                  <td className="px-3 py-2 capitalize">{req.status || "-"}</td>
                  <td className="px-3 py-2">
                    <a
                      href={`/api/leave/requests/${req._id}/doc`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-slate-200"
                    >
                      เปิดเอกสาร
                    </a>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {req.status?.startsWith("pending") ? (
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => doApprove(req._id)}
                          className="rounded-lg bg-emerald-600/85 hover:bg-emerald-600 px-3 py-1.5 text-white"
                        >
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => doReject(req._id)}
                          className="rounded-lg bg-rose-600/85 hover:bg-rose-600 px-3 py-1.5 text-white"
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-slate-400">
            แสดง {Math.min((page - 1) * pageSize + 1, filtered.length)}–{Math.min(page * pageSize, filtered.length)} จากทั้งหมด {filtered.length} รายการ
          </div>
          <div className="flex items-center gap-2">
            <PageBtn disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</PageBtn>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              // แสดงเลขหน้าไม่ยาวเกินไป (แสดงขอบ + รอบ ๆ หน้าปัจจุบัน)
              if (totalPages > 7) {
                const show =
                  p === 1 || p === 2 || p === totalPages || p === totalPages - 1 ||
                  Math.abs(p - page) <= 1;
                if (!show) {
                  // render จุดไข่ปลาเฉพาะรอบ 3 และ totalPages-2
                  if (p === 3 || p === totalPages - 2) return <span key={p} className="px-1 text-slate-500">…</span>;
                  return null;
                }
              }
              return (
                <PageBtn key={p} active={p === page} onClick={() => setPage(p)}>
                  {p}
                </PageBtn>
              );
            })}
            <PageBtn disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</PageBtn>
          </div>
        </div>
      )}
    </div>
  );
}
