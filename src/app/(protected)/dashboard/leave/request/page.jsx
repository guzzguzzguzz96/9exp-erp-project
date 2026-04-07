"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  FileText,
  Send,
  Thermometer,
  Palmtree,
  UserRound,
  Baby,
  CircleEllipsis,
  Upload,
  Loader2,
} from "lucide-react";

/* ── design tokens ─────────────────────────────────── */
const NAVY = "#0D1B2A";
const BLUE = "#005CFF";
const LIME = "#D4F73F";
const ICE = "#F8FAFD";
const SLATE = "#808A95";
const CARD = {
  background: "#FFFFFF",
  border: "1px solid rgba(0,92,255,0.10)",
  borderRadius: "16px",
  boxShadow: "0 2px 8px rgba(13,27,42,0.06)",
};

const TYPE_OPTIONS = [
  { value: "sick", label: "Sick Leave", Icon: Thermometer },
  { value: "annual", label: "Annual Leave", Icon: Palmtree },
  { value: "personal", label: "Personal Leave", Icon: UserRound },
  { value: "maternity", label: "Maternity Leave", Icon: Baby },
  { value: "paternity", label: "Paternity Leave", Icon: Baby },
  { value: "other", label: "Other", Icon: CircleEllipsis },
];

const BALANCE_META = [
  { key: "sick", label: "Sick Leave", Icon: Thermometer, color: "#EF4444" },
  { key: "annual", label: "Annual Leave", Icon: Palmtree, color: BLUE },
  { key: "personal", label: "Personal Leave", Icon: UserRound, color: "#8B5CF6" },
];

function countWorkingDays(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (e < s) return 0;
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export default function LeaveRequestPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(null);
  const [loadingBal, setLoadingBal] = useState(true);

  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const totalDays = useMemo(
    () => countWorkingDays(startDate, endDate),
    [startDate, endDate]
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/leave/balance?year=${new Date().getFullYear()}`);
        const j = await res.json();
        if (j.ok) setBalance(j.balance);
      } catch {} finally { setLoadingBal(false); }
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!leaveType || !startDate || !endDate || !reason.trim()) return;
    if (totalDays <= 0) return;

    setSubmitting(true);
    try {
      const body = { leaveType, startDate, endDate, reason: reason.trim() };
      if (file) body.attachmentUrl = file;

      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || "Error");
      router.push("/dashboard/leave/history");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }} className="space-y-6">
      {/* ── Header ───────────────────────────── */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `rgba(0,92,255,0.08)`, color: BLUE }}
        >
          <CalendarDays size={22} strokeWidth={1.8} />
        </div>
        <div>
          <h1 style={{ color: NAVY, fontSize: 22, fontWeight: 700 }}>Leave Request</h1>
          <p style={{ color: SLATE, fontSize: 13 }}>Submit a new leave request</p>
        </div>
      </div>

      {/* ── Balance Cards ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {BALANCE_META.map((m) => {
          const data = balance?.[m.key];
          return (
            <div key={m.key} style={CARD} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${m.color}14`, color: m.color }}
                >
                  <m.Icon size={16} strokeWidth={2} />
                </div>
                <span style={{ color: NAVY, fontSize: 13, fontWeight: 600 }}>{m.label}</span>
              </div>
              {loadingBal ? (
                <div style={{ color: SLATE, fontSize: 13 }}>Loading...</div>
              ) : (
                <>
                  <div style={{ fontSize: 28, fontWeight: 700, color: NAVY, lineHeight: 1 }}>
                    {data?.remaining ?? "-"}
                    <span style={{ fontSize: 13, fontWeight: 400, color: SLATE, marginLeft: 4 }}>days left</span>
                  </div>
                  <div style={{ color: SLATE, fontSize: 12, marginTop: 4 }}>
                    {data?.used ?? 0} used of {data?.total ?? 0}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Form ─────────────────────────────── */}
      <form onSubmit={handleSubmit} style={CARD} className="p-6 space-y-5">
        {/* Leave Type */}
        <div>
          <label style={{ color: NAVY, fontSize: 13, fontWeight: 600 }} className="mb-1.5 block">
            Leave Type
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(0,92,255,0.15)",
              fontSize: 14,
              color: NAVY,
              background: ICE,
              outline: "none",
            }}
          >
            <option value="">-- Select leave type --</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={{ color: NAVY, fontSize: 13, fontWeight: 600 }} className="mb-1.5 block">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(0,92,255,0.15)",
                fontSize: 14,
                color: NAVY,
                background: ICE,
              }}
            />
          </div>
          <div>
            <label style={{ color: NAVY, fontSize: 13, fontWeight: 600 }} className="mb-1.5 block">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(0,92,255,0.15)",
                fontSize: 14,
                color: NAVY,
                background: ICE,
              }}
            />
          </div>
        </div>

        {/* Total Days */}
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3"
          style={{ background: totalDays > 0 ? `${BLUE}0A` : "#F1F5F9", border: `1px solid ${totalDays > 0 ? `${BLUE}20` : "#E2E8F0"}` }}
        >
          <CalendarDays size={16} style={{ color: totalDays > 0 ? BLUE : SLATE }} />
          <span style={{ fontSize: 14, color: totalDays > 0 ? BLUE : SLATE, fontWeight: 600 }}>
            {totalDays > 0 ? `${totalDays} working day${totalDays > 1 ? "s" : ""}` : "Select dates to calculate"}
          </span>
          <span style={{ fontSize: 12, color: SLATE, marginLeft: "auto" }}>(excludes weekends)</span>
        </div>

        {/* Reason */}
        <div>
          <label style={{ color: NAVY, fontSize: 13, fontWeight: 600 }} className="mb-1.5 block">
            Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={3}
            placeholder="Please describe the reason for your leave..."
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(0,92,255,0.15)",
              fontSize: 14,
              color: NAVY,
              background: ICE,
              resize: "vertical",
            }}
          />
        </div>

        {/* Attachment */}
        <div>
          <label style={{ color: NAVY, fontSize: 13, fontWeight: 600 }} className="mb-1.5 block">
            Attachment (optional)
          </label>
          <label
            className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-3"
            style={{ border: "1px dashed rgba(0,92,255,0.25)", background: ICE }}
          >
            <Upload size={16} style={{ color: BLUE }} />
            <span style={{ fontSize: 13, color: SLATE }}>
              {file ? file : "Click to upload a file"}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFile(f.name);
              }}
            />
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !leaveType || !startDate || !endDate || !reason.trim() || totalDays <= 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-all duration-200 disabled:opacity-50"
          style={{
            background: BLUE,
            color: "#FFFFFF",
            fontSize: 15,
          }}
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {submitting ? "Submitting..." : "Submit Leave Request"}
        </button>
      </form>
    </div>
  );
}
