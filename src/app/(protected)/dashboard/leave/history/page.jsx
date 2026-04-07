"use client";

import { useEffect, useState, useMemo } from "react";
import {
  CalendarDays,
  History,
  Filter,
  X,
  FileText,
  MessageSquare,
  Loader2,
  Inbox,
} from "lucide-react";

/* ── design tokens ─────────────────────────────────── */
const NAVY = "#0D1B2A";
const BLUE = "#005CFF";
const SLATE = "#808A95";
const ICE = "#F8FAFD";
const CARD = {
  background: "#FFFFFF",
  border: "1px solid rgba(0,92,255,0.10)",
  borderRadius: "16px",
  boxShadow: "0 2px 8px rgba(13,27,42,0.06)",
};

const STATUS_BADGE = {
  pending:   { bg: "#FEF3C7", color: "#92400E" },
  approved:  { bg: "#D1FAE5", color: "#065F46" },
  rejected:  { bg: "#FEE2E2", color: "#991B1B" },
  cancelled: { bg: "#F1F5F9", color: "#475569" },
};

const TYPE_LABELS = {
  sick: "Sick Leave",
  annual: "Annual Leave",
  personal: "Personal Leave",
  maternity: "Maternity Leave",
  paternity: "Paternity Leave",
  other: "Other",
};

function fmtDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function LeaveHistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cancelling, setCancelling] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (year) params.set("year", year);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/leave?${params}`);
      const j = await res.json();
      setItems(j.ok ? j.items : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [year, statusFilter]); // eslint-disable-line

  const filtered = useMemo(() => {
    if (!typeFilter) return items;
    return items.filter((i) => i.leaveType === typeFilter);
  }, [items, typeFilter]);

  async function handleCancel(id) {
    if (!confirm("Are you sure you want to cancel this leave request?")) return;
    setCancelling(id);
    try {
      const res = await fetch(`/api/leave/${id}`, { method: "DELETE" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || "Error");
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }} className="space-y-6">
      {/* ── Header ───────────────────────────── */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "rgba(0,92,255,0.08)", color: BLUE }}
        >
          <History size={22} strokeWidth={1.8} />
        </div>
        <div>
          <h1 style={{ color: NAVY, fontSize: 22, fontWeight: 700 }}>Leave History</h1>
          <p style={{ color: SLATE, fontSize: 13 }}>View and manage your leave requests</p>
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────── */}
      <div style={CARD} className="flex flex-wrap items-center gap-3 p-4">
        <Filter size={16} style={{ color: SLATE }} />

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,92,255,0.15)",
            fontSize: 13,
            color: NAVY,
            background: ICE,
          }}
        >
          {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,92,255,0.15)",
            fontSize: 13,
            color: NAVY,
            background: ICE,
          }}
        >
          <option value="">All Types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,92,255,0.15)",
            fontSize: 13,
            color: NAVY,
            background: ICE,
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {(typeFilter || statusFilter) && (
          <button
            onClick={() => { setTypeFilter(""); setStatusFilter(""); }}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5"
            style={{ color: BLUE, fontSize: 12, fontWeight: 500 }}
          >
            <X size={14} /> Clear filters
          </button>
        )}
      </div>

      {/* ── List ──────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin" style={{ color: BLUE }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={CARD} className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox size={48} style={{ color: SLATE, opacity: 0.4 }} />
          <p style={{ color: NAVY, fontSize: 16, fontWeight: 600, marginTop: 12 }}>No leave records found</p>
          <p style={{ color: SLATE, fontSize: 13, marginTop: 4 }}>
            {statusFilter || typeFilter
              ? "Try adjusting your filters"
              : "You haven't submitted any leave requests yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const badge = STATUS_BADGE[item.status] || STATUS_BADGE.pending;
            return (
              <div key={item._id} style={CARD} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span style={{ color: NAVY, fontSize: 15, fontWeight: 600 }}>
                        {TYPE_LABELS[item.leaveType] || item.leaveType}
                      </span>
                      <span
                        className="inline-flex rounded-full px-2.5 py-0.5"
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4" style={{ color: SLATE, fontSize: 13 }}>
                      <span className="flex items-center gap-1">
                        <CalendarDays size={14} />
                        {fmtDate(item.startDate)} - {fmtDate(item.endDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {item.totalDays} day{item.totalDays > 1 ? "s" : ""}
                      </span>
                    </div>

                    <p style={{ color: SLATE, fontSize: 13, marginTop: 4 }}>{item.reason}</p>

                    {item.approverNote && (
                      <div
                        className="mt-2 flex items-start gap-2 rounded-lg px-3 py-2"
                        style={{
                          background: item.status === "rejected" ? "#FEE2E210" : "#D1FAE510",
                          border: `1px solid ${item.status === "rejected" ? "#FEE2E240" : "#D1FAE540"}`,
                        }}
                      >
                        <MessageSquare size={14} style={{ color: badge.color, marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: badge.color }}>{item.approverNote}</span>
                      </div>
                    )}
                  </div>

                  {item.status === "pending" && (
                    <button
                      onClick={() => handleCancel(item._id)}
                      disabled={cancelling === item._id}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 transition-colors"
                      style={{
                        border: "1px solid #FEE2E2",
                        color: "#991B1B",
                        fontSize: 12,
                        fontWeight: 500,
                        background: "#FEE2E220",
                      }}
                    >
                      {cancelling === item._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <X size={14} />
                      )}
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
