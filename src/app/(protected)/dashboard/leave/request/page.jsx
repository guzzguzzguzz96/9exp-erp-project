// app/(protected)/dashboard/leave/request/page.jsx
import dbConnect from "@/lib/mongoose";
import { requireSessionPage } from "@/lib/authz";
import Employee from "@/lib/models/Employee";
import LeaveType from "@/lib/models/LeaveType";
import LeaveQuota from "@/lib/models/LeaveQuota";
import LeaveRequest from "@/lib/models/LeaveRequest";
import LeaveRequestClient from "./LeaveRequestClient";

function toPlain(o) { return JSON.parse(JSON.stringify(o)); }

// ✅ หา Employee แบบ “กว้าง” เหมือนฝั่ง API เดิมของคุณ
async function resolveEmployeeFromSession(session) {
  const me = session?.user || session || {};

  const candidateIds = [
    me.employeeId,      // เผื่อ session เก็บ employeeId
    me._id,             // เผื่อ session.user คือเอกสาร user/employee เลย
    me.id,              // บางโปรเจ็กต์ map เป็น id
    session?.employeeId // เผื่อเก็บไว้บน session root
  ].filter(Boolean);

  const userLinkIds = [
    me.userId, me.user, session?.userId
  ].filter(Boolean);

  const emails = [
    me.email, session?.user?.email, me.workEmail, me.personalEmail
  ].filter(Boolean);

  const or = [];

  // _id ของ Employee โดยตรง
  for (const v of candidateIds) or.push({ _id: v });

  // ความเชื่อมกับ user (บางโปรเจ็กต์ใช้ userId หรือ user)
  for (const v of userLinkIds) { or.push({ userId: v }); or.push({ user: v }); }

  // เผื่อแม็พด้วยอีเมล
  for (const v of emails) { or.push({ workEmail: v }); or.push({ personalEmail: v }); }

  if (or.length === 0) return null;

  const emp = await Employee.findOne({ $or: or }).lean();
  return emp || null;
}

export default async function LeaveRequestPage({ searchParams }) {
  await dbConnect();
  const session = await requireSessionPage();

  const emp = await resolveEmployeeFromSession(session);
  if (!emp?._id) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white/90">Leave Request</h1>
        <p className="mt-4 text-red-300">ไม่พบข้อมูลพนักงานของผู้ใช้ที่ล็อกอิน</p>
      </div>
    );
  }

  const year = Number(searchParams?.year) || new Date().getFullYear();

  // ประเภทการลา
  const types = toPlain(
    await LeaveType.find().sort({ order: 1, name: 1 }).lean()
  );

  // โควต้าปีนี้ของ “พนักงานคนนี้”
  const rawQuotas = await LeaveQuota.find({
    employeeId: emp._id,
    year
  }).lean();

  const quotaMap = new Map(
    rawQuotas.map(q => [q.typeCode, (q.allocated || 0) + (q.carryforward || 0)])
  );

  // ใช้ไปเท่าไร (เฉพาะ approved ภายในปี)
  const approved = await LeaveRequest.aggregate([
    {
      $match: {
        employeeId: emp._id,
        status: "approved",
        startDate: { $gte: new Date(`${year}-01-01T00:00:00.000Z`) },
        endDate:   { $lte: new Date(`${year}-12-31T23:59:59.999Z`) },
      }
    },
    { $group: { _id: "$typeCode", days: { $sum: "$durationDays" } } }
  ]);
  const usedMap = Object.fromEntries(approved.map(a => [a._id, a.days || 0]));

  const initial = {
    year,
    me: {
      id: String(emp._id),
      name: [emp.firstName, emp.lastName].filter(Boolean).join(" "),
      position: emp.position || "",
      departmentId: emp.departmentId ? String(emp.departmentId) : null,
    },
    types: toPlain(types),
    quotas: toPlain(
      types.map(t => ({ typeCode: t.code, total: quotaMap.get(t.code) || 0 }))
    ),
    usedMap,
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-white/90">Leave Request</h1>
      <LeaveRequestClient initial={toPlain(initial)} />
    </div>
  );
}
