import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongoose";
import Employee from "@/lib/models/Employee";
import DepartmentsClient from "./ui/DepartmentsClient";
import {
  DEPARTMENT_CATALOG,
  DEPT_MAP,
  levelName,
  levelsForDept,
} from "@/lib/hr/constants";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const canCreate = ["superadmin", "hr"].includes(role);

  await dbConnect();

  // ดึงรายชื่อพนักงานทั้งหมด (โครงเบาๆพอใช้ render)
  const emps = await Employee.find(
    {},
    "firstName lastName nickName department level position photoUrl empAutoId email"
  )
    .lean();

  // จัดหมวดตาม department
  const byDept = new Map();
  for (const meta of DEPARTMENT_CATALOG) {
    byDept.set(meta.code, {
      code: meta.code,
      fullName: meta.fullName,
      order: meta.order,
      color: meta.color,
      members: [],
      levelCount: Object.fromEntries(levelsForDept(meta.code).map(l => [l.value, 0])),
      total: 0,
    });
  }

  for (const e of emps) {
    const code = e.department?.toUpperCase?.() || "UNKNOWN";
    if (!byDept.has(code)) continue; // ตัดโค้ดที่ไม่อยู่ในแคตตาล็อก (หรือจะ push เพิ่มก็ได้)

    const bucket = byDept.get(code);
    const lv = Math.max(1, Math.min(e.level || 1, 6));

    bucket.members.push({
      id: String(e._id),
      name: `${e.firstName} ${e.lastName}`,
      nick: e.nickName || "",
      position: e.position || "",
      level: lv,
      levelName: levelName(code, lv),
      empId: e.empAutoId || "",
      email: e.email || "",
      photo: e.photoUrl || "/avatar-default.png",
    });

    if (bucket.levelCount[lv] != null) bucket.levelCount[lv] += 1;
    bucket.total += 1;
  }

  // เรียงสมาชิกในแต่ละแผนก: level สูง → ต่ำ
  for (const b of byDept.values()) {
    b.members.sort((a, b2) => b2.level - a.level || a.name.localeCompare(b2.name));
  }

  // เรียงการ์ดตาม order ในคอนฟิก
  const items = Array.from(byDept.values()).sort((a, b) => a.order - b.order);

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-self-start gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white/5 ring-1 ring-white/10 grid place-items-center">
            <Building2 size={20} className="text-indigo-300" />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-100">Departments</h1>
          <p className="text-slate-400">
            แผนกต่าง ๆ และจำนวนพนักงานในแผนก
          </p>
        </div>

        {canCreate && (
          <Link
            href="/dashboard/hrm/departments/create"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 px-4 py-2.5 text-white font-medium ring-1 ring-white/10 shadow-sm"
          >
            <Plus size={18} />
            Create Department
          </Link>
        )}
      </div>

      {/* Client list */}
      <DepartmentsClient items={items} />
    </div>
  );
}
