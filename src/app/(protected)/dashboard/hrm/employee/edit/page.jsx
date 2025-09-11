import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongoose";
import Employee from "@/lib/models/Employee";
import { notFound, redirect } from "next/navigation";
import EditEmployeeForm from "./EditEmployeeForm";

const escapeReg = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toJSON = (d) => JSON.parse(JSON.stringify(d));

export const dynamic = "force-dynamic";

export default async function EditEmployeePage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await dbConnect();

  // หาผู้ถูกแก้ไข: ถ้ามี id คือแก้ของคนนั้น (เฉพาะ HR/SA)
  // ถ้าไม่มี id = แก้ของตัวเอง
  let doc = null;
  const qid = searchParams?.id;
  if (qid) {
    doc = await Employee.findById(qid).lean();
  } else {
    if (session.user.id) {
      doc = await Employee.findOne({ userId: session.user.id }).lean();
    }
    if (!doc && session.user.email) {
      doc = await Employee.findOne({
        email: { $regex: new RegExp(`^${escapeReg(session.user.email)}$`, "i") },
      }).lean();
    }
  }
  if (!doc) notFound();

  const role = session.user.role;
  const isSelf = doc.email?.toLowerCase() === session.user.email?.toLowerCase();
  const canAdmin = ["superadmin", "hr"].includes(role);
  if (!(isSelf || canAdmin)) redirect("/403");

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-100">Edit Profile</h1>
      </div>

      <EditEmployeeForm
        employee={toJSON(doc)}
        canAdmin={canAdmin}
        // employee ดู Private ได้ แต่แก้ได้เฉพาะ HR/SA
        canEditPrivate={canAdmin}
      />
    </div>
  );
}
