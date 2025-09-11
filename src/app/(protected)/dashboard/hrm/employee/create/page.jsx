import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import EmployeeCreateForm from "./EmployeeCreateForm";

export default async function EmployeeCreatePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // อนุญาต: superadmin, hr, (manager ได้ไหม? ปรับตามนโยบายได้)
  const allowed = ["superadmin","hr"];
  if (!allowed.includes(session.user.role)) redirect("/403");

  return (
    <div className="px-6 py-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-100">Create Employee</h1>
        <p className="text-slate-400 text-sm mt-1">พนักงานขั้นตอนแรก (First Step)</p>
        <div className="mt-6 rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10 p-6">
          <EmployeeCreateForm />
        </div>
      </div>
    </div>
  );
}
