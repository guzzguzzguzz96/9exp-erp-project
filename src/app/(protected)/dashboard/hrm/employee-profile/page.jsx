import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import dbConnect from "@/lib/mongoose";
import Employee from "@/lib/models/Employee";
import { authOptions } from "@/lib/authOptions";
import CopyBtn from "./CopyBtn"; // client helper สำหรับคัดลอกเบอร์/อีเมล

export const dynamic = "force-dynamic";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      })
    : "-";

const Card = ({ title, children, right }) => (
  <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-slate-200 font-medium">{title}</h3>
      {right}
    </div>
    {children}
  </section>
);

const escapeReg = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default async function EmployeeProfilePage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await dbConnect();

  const targetId = searchParams?.id;
  let e = null;

  if (targetId) {
    e = await Employee.findById(targetId).lean();
  } else {
    if (session.user.id) {
      e = await Employee.findOne({ userId: session.user.id }).lean();
    }

    if (!e && session.user.email) {
      e = await Employee.findOne({
        email: {
          $regex: new RegExp(`^${escapeReg(session.user.email)}$`, "i"),
        },
      }).lean();
    }
  }

  if (!e) {
    if (["superadmin", "hr"].includes(session.user.role)) {
      redirect("/dashboard/hrm/employee/create");
    }
    notFound();
  }
  const role = session.user?.role ?? "employee";
  const isSelf = e.email?.toLowerCase() === session.user.email?.toLowerCase();
  const canSeeAny = ["superadmin", "hr"].includes(role);

  if (
    !canSeeAny &&
    e.email?.toLowerCase() !== session.user.email?.toLowerCase()
  ) {
    redirect("/403");
  }

  const canEdit = ["superadmin", "hr"].includes(role);

  function normalizeAvatar(u) {
    if (!u) return "/avatar-default.png"; // รูป fallback ใน public
    if (u.startsWith("http") || u.startsWith("data:")) return u; // ลิงก์ภายนอก/ base64
    return u.startsWith("/") ? u : `/${u}`; // ทำให้เป็น absolute path ภายใต้ public
  }

  const avatar = normalizeAvatar(e.photoUrl); // ✅ ประกาศให้ชัดเจนก่อน return

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Breadcrumb + Back */}
      <div className="flex items-center justify-between">
        <nav className="text-sm text-slate-400">
          <Link href="/dashboard" className="hover:text-slate-200">
            Home
          </Link>
          <span className="mx-2">›</span>
          <Link href="/dashboard/hrm/employee" className="hover:text-slate-200">
            Employee
          </Link>
          <span className="mx-2">›</span>
          <span className="text-slate-200">Profile</span>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/hrm/employee"
            className="rounded-xl ring-1 ring-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-slate-200"
          >
            ← Back
          </Link>
          {canEdit && (
            <Link
              href={`/dashboard/hrm/employee/edit?id=${e._id}`}
              className="rounded-xl bg-indigo-600/90 hover:bg-indigo-600 px-3 py-2 text-white ring-1 ring-white/10"
            >
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Header Profile */}
      <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
        <div className="flex items-start gap-5">
          <div className="relative h-24 w-24 rounded-2xl overflow-hidden ring-1 ring-white/10">
            <Image
              src={avatar}
              alt={e.firstName}
              fill
              sizes="96px"
              // unoptimized // <- ถ้าเป็นลิงก์ภายนอกแต่ยังไม่ตั้งค่า next.config.js
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-100">
                {e.firstName} {e.lastName}
              </h1>
              {e.nickName && (
                <span className="text-xs rounded-lg bg-white/10 px-2 py-1 text-slate-300">
                  ({e.nickName})
                </span>
              )}
            </div>
            <p className="mt-1 text-slate-300">{e.position || "-"}</p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-white/10 px-2 py-1 text-slate-300 ring-1 ring-white/10">
                Dept: <b className="ml-1">{e.department || "-"}</b>
              </span>
              <span className="rounded-md bg-white/10 px-2 py-1 text-slate-300 ring-1 ring-white/10">
                Emp ID: <b className="ml-1">{e.empAutoId || "-"}</b>
              </span>
              <span className="rounded-md bg-white/10 px-2 py-1 text-slate-300 ring-1 ring-white/10">
                Join: <b className="ml-1">{fmtDate(e.dateOfJoin)}</b>
              </span>
              <span className="rounded-md bg-white/10 px-2 py-1 text-slate-300 ring-1 ring-white/10">
                Gender: <b className="ml-1">{e.gender || "-"}</b>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT column */}
        <div className="xl:col-span-2 space-y-6">
          <Card title="Personal Information">
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <Info label="Phone" value={e.phone} copyable />
              <Info label="Email" value={e.email} copyable />
              <Info label="Birthday" value={fmtDate(e.birthday)} />
              <Info label="Address" value={e.address || "-"} span />
            </dl>
          </Card>

          <Card title="Employment">
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <Info label="Department" value={e.department || "-"} />
              <Info label="Position" value={e.position || "-"} />
              <Info label="Employee ID" value={e.empAutoId || "-"} />
              <Info label="Date of Join" value={fmtDate(e.dateOfJoin)} />
            </dl>
          </Card>

          <Card title="Emergency Contact">
            {e.emergency?.primary || e.emergency?.secondary ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <EmergencyBlock title="Primary" data={e.emergency?.primary} />
                <EmergencyBlock
                  title="Secondary"
                  data={e.emergency?.secondary}
                />
              </div>
            ) : (
              <p className="text-slate-400 text-sm">
                ยังไม่มีข้อมูลผู้ติดต่อฉุกเฉิน
              </p>
            )}
          </Card>
        </div>

        {/* RIGHT column */}
        <div className="space-y-6">
          <Card
            title="Private Information"
            right={
              !canEdit && (
                <span className="text-xs text-slate-400">
                  Visible to HR/Admin only
                </span>
              )
            }
          >
            {(isSelf || ["superadmin","hr"].includes(role)) ? (
              <>
                <dl className="grid gap-3 text-sm">
                  <Info
                    label="Account holder name"
                    value={e.privateInfo?.bookbank?.accountHolder || "-"}
                  />
                  <Info
                    label="Account name / No."
                    value={e.privateInfo?.bookbank?.accountNumber || "-"}
                  />
                  <Info
                    label="Bank name"
                    value={e.privateInfo?.bookbank?.bankName || "-"}
                  />
                  <Info
                    label="Branch name"
                    value={e.privateInfo?.bookbank?.branchName || "-"}
                  />
                </dl>
                <p className="mt-3 text-xs text-slate-400">
                  ข้อมูลนี้เห็นได้เฉพาะ Super Admin และ HR
                </p>
              </>
            ) : (
              <p className="text-slate-400 text-sm">
                คุณไม่มีสิทธิ์เข้าถึงข้อมูลส่วนนี้
              </p>
            )}
          </Card>

          <Card title="Quick actions">
            <div className="flex flex-col gap-2">
              {canEdit ? (
                <>
                  <Link
                    href={`/dashboard/hrm/employee/edit?id=${e._id}`}
                    className="rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-white/10 px-3 py-2 text-sm text-slate-200"
                  >
                    แก้ไขข้อมูลพนักงาน
                  </Link>
                  <Link
                    href={`/dashboard/hrm/employee/reset-password?id=${e._id}`}
                    className="rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-white/10 px-3 py-2 text-sm text-slate-200"
                  >
                    ตั้งรหัสผ่านใหม่
                  </Link>
                  <Link
                    href={`/dashboard/hrm/employee/deactivate?id=${e._id}`}
                    className="rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-white/10 px-3 py-2 text-sm text-red-300"
                  >
                    ระงับการใช้งาน
                  </Link>
                </>
              ) : (
                <p className="text-slate-400 text-sm">ไม่มี action ที่ใช้ได้</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- small view helpers (server-safe) ---------- */
function Info({ label, value, span = false, copyable = false }) {
  const v = value ?? "-";
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <dt className="text-slate-400 text-xs">{label}</dt>
      <dd className="mt-1 text-slate-200 flex items-center gap-2">
        <span className="truncate">{v}</span>
        {copyable && typeof value === "string" && <CopyBtn text={value} />}
      </dd>
    </div>
  );
}

function EmergencyBlock({ title, data }) {
  if (!data)
    return (
      <div className="rounded-xl ring-1 ring-white/10 bg-white/5 p-4 text-slate-400 text-sm">
        No data
      </div>
    );
  return (
    <div className="rounded-xl ring-1 ring-white/10 bg-white/5 p-4">
      <h4 className="text-slate-200 font-medium mb-3">{title}</h4>
      <dl className="grid gap-2 text-sm">
        <Info label="Name" value={data.name || "-"} />
        <Info label="Relationship" value={data.relationship || "-"} />
        <Info label="Phone" value={data.phone || "-"} />
        <Info label="Email" value={data.email || "-"} />
        <Info label="Address" value={data.address || "-"} />
      </dl>
    </div>
  );
}
