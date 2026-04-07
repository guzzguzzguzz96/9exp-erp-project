"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  FileText,
  User,
  Building2,
  Loader2,
  Inbox,
  X,
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

const TABS = [
  { key: "pending",  label: "Pending",  Icon: Clock },
  { key: "approved", label: "Approved", Icon: CheckCircle2 },
  { key: "rejected", label: "Rejected", Icon: XCircle },
];

function fmtDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function LeaveApprovePage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [tab, setTab] = useState("pending");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ── modal state ───────────────────────── */
  const [modal, setModal] = useState(null); // { id, action: 'approve'|'reject' }
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ── role gate ─────────────────────────── */
  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session) { router.replace("/login"); return; }
    const role = session.user?.role || "employee";
    if (!["superadmin", "hr", "manager"].includes(role)) {
      router.replace("/403");
    }
  }, [session, authStatus, router]);

  /* ── fetch data ────────────────────────── */
  async function load() {
    setLoading(true);
    try {
      const endpoint = tab === "pending"
        ? "/api/leave/pending"
        : `/api/leave?status=${tab}`;
      const res = await fetch(endpoint);
      const j = await res.json();
      setItems(j.ok ? j.items : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authStatus !== "loading" && session) load();
  }, [tab, session, authStatus]); // eslint-disable-line

  /* ── counts ────────────────────────────── */
  const tabCounts = useMemo(() => {
    return { [tab]: items.length };
  }, [tab, items]);

  /* ── approve/reject ────────────────────── */
  async function handleConfirm() {
    if (!modal) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/leave/${modal.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: modal.action, note }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || "Error");
      setModal(null);
      setNote("");
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (authStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin" style={{ color: BLUE }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }} className="space-y-6">
      {/* ── Header ───────────────────────────── */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "rgba(0,92,255,0.08)", color: BLUE }}
        >
          <ShieldCheck size={22} strokeWidth={1.8} />
        </div>
        <div>
          <h1 style={{ color: NAVY, fontSize: 22, fontWeight: 700 }}>Leave Approvals</h1>
          <p style={{ color: SLATE, fontSize: 13 }}>Review and manage leave requests</p>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────── */}
      <div className="flex gap-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 transition-all duration-200"
              style={{
                background: active ? BLUE : "#FFFFFF",
                color: active ? "#FFFFFF" : NAVY,
                border: active ? "none" : "1px solid rgba(0,92,255,0.10)",
                fontSize: 13,
                fontWeight: 600,
                boxShadow: active ? "0 2px 8px rgba(0,92,255,0.25)" : "0 2px 8px rgba(13,27,42,0.06)",
              }}
            >
              <t.Icon size={15} />
              {t.label}
              {tabCounts[t.key] !== undefined && (
                <span
                  className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5"
                  style={{
                    background: active ? "rgba(255,255,255,0.2)" : "rgba(0,92,255,0.08)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {tabCounts[t.key]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── List ──────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin" style={{ color: BLUE }} />
        </div>
      ) : items.length === 0 ? (
        <div style={CARD} className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox size={48} style={{ color: SLATE, opacity: 0.4 }} />
          <p style={{ color: NAVY, fontSize: 16, fontWeight: 600, marginTop: 12 }}>
            No {tab} requests
          </p>
          <p style={{ color: SLATE, fontSize: 13, marginTop: 4 }}>
            There are no {tab} leave requests at the moment
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const emp = item.employeeId || {};
            const empName = [emp.firstName, emp.lastName].filter(Boolean).join(" ") || "-";
            const badge = STATUS_BADGE[item.status] || STATUS_BADGE.pending;

            return (
              <div key={item._id} style={CARD} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Employee info */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                          style={{ background: "rgba(0,92,255,0.08)", color: BLUE }}
                        >
                          <User size={15} />
                        </div>
                        <div>
                          <span style={{ color: NAVY, fontSize: 14, fontWeight: 600 }}>{empName}</span>
                          <div className="flex items-center gap-2" style={{ color: SLATE, fontSize: 12 }}>
                            {emp.position && <span>{emp.position}</span>}
                            {emp.department && (
                              <>
                                <span style={{ opacity: 0.4 }}>|</span>
                                <span className="flex items-center gap-0.5">
                                  <Building2 size={11} /> {emp.department}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

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

                    {/* Leave details */}
                    <div className="flex flex-wrap items-center gap-4" style={{ color: SLATE, fontSize: 13 }}>
                      <span style={{ color: NAVY, fontWeight: 600 }}>
                        {TYPE_LABELS[item.leaveType] || item.leaveType}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays size={14} />
                        {fmtDate(item.startDate)} - {fmtDate(item.endDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {item.totalDays} day{item.totalDays > 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Reason */}
                    <p style={{ color: SLATE, fontSize: 13 }}>{item.reason}</p>

                    {/* Approver note */}
                    {item.approverNote && (
                      <div
                        className="flex items-start gap-2 rounded-lg px-3 py-2"
                        style={{
                          background: item.status === "rejected" ? "#FEE2E210" : "#D1FAE510",
                          border: `1px solid ${item.status === "rejected" ? "#FEE2E240" : "#D1FAE540"}`,
                        }}
                      >
                        <span style={{ fontSize: 12, color: badge.color }}>{item.approverNote}</span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  {item.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => { setModal({ id: item._id, action: "approve" }); setNote(""); }}
                        className="flex items-center gap-1.5 rounded-lg px-4 py-2 transition-colors"
                        style={{
                          background: "#065F46",
                          color: "#FFFFFF",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle2 size={15} />
                        Approve
                      </button>
                      <button
                        onClick={() => { setModal({ id: item._id, action: "reject" }); setNote(""); }}
                        className="flex items-center gap-1.5 rounded-lg px-4 py-2 transition-colors"
                        style={{
                          background: "#991B1B",
                          color: "#FFFFFF",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Confirmation Modal ────────────────── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(13,27,42,0.6)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              background: "#FFFFFF",
              boxShadow: "0 16px 48px rgba(13,27,42,0.2)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ color: NAVY, fontSize: 18, fontWeight: 700 }}>
                {modal.action === "approve" ? "Approve Leave" : "Reject Leave"}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: ICE, color: SLATE }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ color: SLATE, fontSize: 13, marginBottom: 16 }}>
              {modal.action === "approve"
                ? "Are you sure you want to approve this leave request? The leave balance will be deducted."
                : "Are you sure you want to reject this leave request?"}
            </p>

            <div className="mb-4">
              <label style={{ color: NAVY, fontSize: 13, fontWeight: 600 }} className="mb-1.5 block">
                Note (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Add a note for the employee..."
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

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModal(null)}
                className="rounded-xl px-4 py-2.5"
                style={{
                  border: "1px solid rgba(0,92,255,0.10)",
                  color: NAVY,
                  fontSize: 13,
                  fontWeight: 600,
                  background: "#FFFFFF",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 disabled:opacity-50"
                style={{
                  background: modal.action === "approve" ? "#065F46" : "#991B1B",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {modal.action === "approve" ? "Confirm Approve" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
