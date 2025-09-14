import Link from "next/link";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import Department from "@/lib/models/Department";
import Employee from "@/lib/models/Employee";
import { requireSessionPage } from "@/lib/authz";
import DepartmentEditForm from "./DepartmentEditForm";

export const dynamic = "force-dynamic";

export default async function EditDepartmentPage({ params }) {
  await requireSessionPage();
  await dbConnect();

  const dept = await Department.findById(params.id).lean();
  if (!dept) return notFound();

  // นับแบบไม่ซ้ำ:
  // - นับคนที่ departmentId = _id
  // - หรือคนที่ยังไม่มี departmentId แต่ department (code) ตรงกับแผนกนี้
  const employeeCount = await Employee.countDocuments({
    $or: [
      { departmentId: dept._id },
      {
        $and: [
          { $or: [{ departmentId: { $exists: false } }, { departmentId: null }] },
          { department: dept.code },
        ],
      },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-100">Edit Department</h1>
        <Link
          href="/dashboard/hrm/departments"
          className="rounded-xl bg-white/10 px-4 py-2 ring-1 ring-white/10 text-slate-200 hover:bg-white/15"
        >
          ← Back
        </Link>
      </div>

      {/* <div className="text-sm text-slate-400">
        Employees in this department: <b className="text-slate-200">{employeeCount}</b>
      </div> */}

      <DepartmentEditForm
        initial={JSON.parse(JSON.stringify(dept))}
        employeeCount={employeeCount}
      />
    </div>
  );
}
