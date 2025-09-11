import Image from "next/image";
import Link from "next/link";
import dbConnect from "@/lib/mongoose";
import Employee from "@/lib/models/Employee";
import { requireSessionPage } from "@/lib/authz";
import EmployeeGroupsClient from "./EmployeeGroupsClient";

export const dynamic = "force-dynamic";

// label ตามที่ตกลง
const DEPT_LABEL = {
  MD: "Management / Director",
  HR: "Human Resources",
  AC: "Accounting",
  IT: "Information Technology",
  SA: "Training Department",
  MK: "Marketing",
  SD: "Software Development",
  AM: "Academic",
  EX: "Executive Office",
  FM: "Facility Management",
  MD2: "Media Department",
};
const DEPT_ORDER = [
  "MD",
  "HR",
  "AC",
  "IT",
  "SA",
  "MK",
  "SD",
  "AM",
  "EX",
  "FM",
  "MD2",
];

export default async function EmployeeIndexPage() {
  const session = await requireSessionPage();
  const role = session.user.role;
  const canCreate = role !== "employee";
  await dbConnect();

  const docs = await Employee.find(
    {},
    "empAutoId firstName lastName nickName department position phone email photoUrl"
  )
    .sort({ department: 1, lastName: 1, firstName: 1 })
    .lean();

  // group by department
  const groups = {};
  for (const e of docs) {
    const dept = e.department || "UNKNOWN";
    if (!groups[dept]) groups[dept] = [];
    groups[dept].push({
      id: String(e._id),
      empAutoId: e.empAutoId,
      name: `${e.firstName} ${e.lastName}`,
      nickName: e.nickName,
      position: e.position,
      phone: e.phone,
      email: e.email,
      photoUrl: e.photoUrl || "/avatar-default.png",
      department: dept,
    });
  }

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Employees</h1>
          <p className="text-slate-400 text-sm">
            แสดงรายชื่อพนักงาน แบ่งตามแผนก
          </p>
        </div>
        {canCreate && (
          <Link
            href="/dashboard/hrm/employee/create"
            className="rounded-xl bg-indigo-600/90 hover:bg-indigo-600 px-4 py-2.5 text-white font-medium ring-1 ring-white/10"
          >
            + Create Employee
          </Link>
        )}
      </div>

      {/* ส่งข้อมูลให้ client component */}
      <EmployeeGroupsClient
        groups={groups}
        order={DEPT_ORDER}
        labels={DEPT_LABEL}
      />
    </div>
  );
}
