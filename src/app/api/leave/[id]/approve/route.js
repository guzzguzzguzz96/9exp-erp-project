// src/app/api/leave/[id]/approve/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongoose";
import Leave from "@/lib/models/Leave";
import LeaveBalance from "@/lib/models/LeaveBalance";

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

    const role = session.user.role || "employee";
    if (!["superadmin", "hr", "manager"].includes(role)) {
      return NextResponse.json({ ok: false, message: "ไม่มีสิทธิ์อนุมัติ/ปฏิเสธ" }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });
    }

    const leave = await Leave.findById(id);
    if (!leave) return NextResponse.json({ ok: false, message: "ไม่พบรายการลา" }, { status: 404 });

    if (leave.status !== "pending") {
      return NextResponse.json({ ok: false, message: "รายการนี้ถูกดำเนินการแล้ว" }, { status: 400 });
    }

    const body = await req.json();
    const { action, note } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ ok: false, message: "action ต้องเป็น approve หรือ reject" }, { status: 400 });
    }

    leave.approverId = session.user.id;
    leave.approverNote = note || "";
    leave.approvedAt = new Date();

    if (action === "approve") {
      leave.status = "approved";

      // หักวัน LeaveBalance เฉพาะประเภทที่มี quota
      const countableTypes = ["sick", "annual", "personal"];
      if (countableTypes.includes(leave.leaveType)) {
        const year = new Date(leave.startDate).getFullYear();
        let balance = await LeaveBalance.findOne({
          employeeId: leave.employeeId,
          year,
        });

        if (!balance) {
          balance = await LeaveBalance.create({
            employeeId: leave.employeeId,
            year,
          });
        }

        const remaining = balance[leave.leaveType].total - balance[leave.leaveType].used;
        if (leave.totalDays > remaining) {
          return NextResponse.json(
            { ok: false, message: `วันลาคงเหลือไม่เพียงพอ (เหลือ ${remaining} วัน)` },
            { status: 400 }
          );
        }

        balance[leave.leaveType].used += leave.totalDays;
        await balance.save();
      }
    } else {
      leave.status = "rejected";
    }

    await leave.save();
    return NextResponse.json({ ok: true, leave });
  } catch (err) {
    console.error("POST /api/leave/[id]/approve error:", err);
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
