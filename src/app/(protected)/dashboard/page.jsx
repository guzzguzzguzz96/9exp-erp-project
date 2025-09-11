// src/app/(protected)/dashboard/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { hasRole } from "@/lib/rbac";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // เช่นต้องการให้ dashboard เข้าถึงได้ทุก role → ไม่ต้องเช็ค
  // ถ้าหน้านี้เฉพาะบาง role:
  // if (!hasRole(session.user.role, ["superadmin", "hr", "manager"])) redirect("/403");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10 p-6">
        <h1 className="text-2xl font-semibold text-slate-100">
          Hello! {session.user.name} ({session.user.role})
        </h1>
        <p className="text-slate-400 mt-1">Welcome back to the HRM dashboard.</p>
      </div>
    </div>
  );
}
