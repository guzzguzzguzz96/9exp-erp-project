// src/app/api/leave/pending/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongoose";
import Leave from "@/lib/models/Leave";

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

    const role = session.user.role || "employee";
    if (!["superadmin", "hr", "manager"].includes(role)) {
      return NextResponse.json({ ok: false, message: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const items = await Leave.find({ status: "pending" })
      .populate("employeeId", "firstName lastName department position empId photoUrl")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("GET /api/leave/pending error:", err);
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
