// src/components/Topbar.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongoose";
import Employee from "@/lib/models/Employee";
import UserMenu from "./UserMenu";

const escapeReg = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default async function Topbar() {
  const session = await getServerSession(authOptions);
  const user = session?.user || null;

  await dbConnect();

  // --- หา employee ของผู้ล็อกอิน: employeeId -> userId -> email (i)
  let emp = null;
  if (session?.user?.employeeId) {
    emp = await Employee.findById(session.user.employeeId)
      .select("firstName lastName nickName photoUrl department position")
      .lean();
  }
  if (!emp && user?.id) {
    emp = await Employee.findOne({ userId: user.id })
      .select("firstName lastName nickName photoUrl department position")
      .lean();
  }
  if (!emp && user?.email) {
    emp = await Employee.findOne({
      email: { $regex: new RegExp(`^${escapeReg(user.email)}$`, "i") },
    })
      .select("firstName lastName nickName photoUrl department position")
      .lean();
  }

  const nameFromEmp =
    emp?.firstName || emp?.lastName
      ? `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim()
      : "";

  // กันกรณี user.name หลุดมาเป็น ObjectId 24 ตัว
  const looksLikeObjectId = (s) => /^[0-9a-f]{24}$/i.test(s || "");

  const displayName =
    nameFromEmp ||
    (user?.name && !looksLikeObjectId(user.name) ? user.name : "") ||
    user?.email;

  const mergedUser = {
    ...user,
    name: displayName,
    photoUrl: emp?.photoUrl || user?.photoUrl || user?.image || null,
    department: emp?.department ?? user?.department ?? null,
    position: emp?.position ?? null,
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-[#0F172B]/95 backdrop-blur flex items-center gap-4 px-4">
      <div className="flex-1 max-w-xl">
        <input
          placeholder="Search here…"
          className="w-full h-10 rounded-xl bg-white/5 px-4 text-slate-100 ring-1 ring-inset ring-white/10 placeholder:text-slate-400 focus:outline-none focus:ring-indigo-400/40"
        />
      </div>

      <div className="ml-auto">
        <UserMenu user={mergedUser} />
      </div>
    </header>
  );
}
