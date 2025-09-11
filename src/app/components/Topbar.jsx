// "use client"  ❌  (ให้เป็น Server Component เพื่อดึง session ฝั่งเซิร์ฟเวอร์)
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import UserMenu from "./UserMenu";
import dbConnect from "@/lib/mongoose";
import Employee from "@/lib/models/Employee";


const session = await getServerSession(authOptions);
let livePhoto = null;
if (session?.user?.email) {
  await dbConnect();
  const emp = await Employee.findOne({ email: session.user.email }).select("photoUrl").lean();
  livePhoto = emp?.photoUrl || null;
}

export default async function Topbar() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-[#0F172B]/95 backdrop-blur flex items-center gap-4 px-4">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <input
          placeholder="Search here…"
          className="w-full h-10 rounded-xl bg-white/5 px-4 text-slate-100 ring-1 ring-inset ring-white/10 placeholder:text-slate-400 focus:outline-none focus:ring-indigo-400/40"
        />
      </div>

      <div className="ml-auto">
      <UserMenu user={{ ...session.user, photoUrl: livePhoto || session.user.photoUrl }} />
      </div>
    </header>
  );
}
