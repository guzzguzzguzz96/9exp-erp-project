import dbConnect from "@/lib/mongoose";
import Employee from "@/lib/models/Employee";
import Counter from "@/lib/models/Counter";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { requireRoleAPI } from "@/lib/authz";

export const runtime = "nodejs";

export async function POST(req) {
  const gate = await requireRoleAPI(["hr", "superadmin"]);
  if (gate.res) return gate.res; // คืน 401/403 ทันที

  const { session } = gate; // ใช้ session.user ได้
  await dbConnect();

  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      nickName,
      department,
      position,
      dateOfJoin,
      phone,
      email,
      birthday,
      address,
      gender,
      emergency,
      privateInfo,
      createAccount,
      accountPassword,
      role = "employee",
    } = body;

    if (
      !firstName ||
      !lastName ||
      !department ||
      !position ||
      !dateOfJoin ||
      !email
    ) {
      return Response.json(
        { error: "required fields missing" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 1) สร้างเลข empAutoId ต่อ prefix แบบ atomic
    const prefix = body.prefix; // ส่งมาจากฟอร์ม (คำนวณจาก department)
    if (!prefix)
      return Response.json({ error: "prefix required" }, { status: 400 });

    const counter = await Counter.findOneAndUpdate(
      { key: prefix },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const empAutoId = `${prefix}-${String(counter.seq).padStart(4, "0")}`;

    // 2) ถ้าเลือกสร้างบัญชีล็อกอิน → สร้าง user
    let createdUser = null;
    if (createAccount) {
      const exists = await User.findOne({ email });
      if (exists)
        return Response.json({ error: "Email already used" }, { status: 409 });

      const hash = await bcrypt.hash(
        accountPassword || Math.random().toString(36).slice(-8),
        10
      );
      createdUser = await User.create({
        name: `${firstName} ${lastName}`.trim(),
        email,
        passwordHash: hash,
        role,
      });
    }

    //validate phone and mail
    const phoneOk = /^\d{10}$/.test(phone || "");
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(email || "");

    if (
      !firstName ||
      !lastName ||
      !nickName ||
      !department ||
      !position ||
      !dateOfJoin ||
      !phone ||
      !email ||
      !birthday ||
      !address ||
      !gender
    ) {
      return Response.json(
        { error: "required fields missing" },
        { status: 400 }
      );
    }
    if (!phoneOk)
      return Response.json(
        { error: "invalid phone (10 digits)" },
        { status: 400 }
      );
    if (!emailOk)
      return Response.json({ error: "invalid email" }, { status: 400 });

    // 3) สร้างพนักงาน
    const employee = await Employee.create({
      empAutoId,
      firstName,
      lastName,
      nickName,
      department,
      position,
      dateOfJoin,
      phone,
      email,
      birthday,
      address,
      gender,
      photoUrl: body.photoUrl || undefined,
      emergency: emergency || undefined,
      privateInfo: privateInfo || undefined,
      userId: createdUser?._id || undefined,
    });

    return Response.json({
      ok: true,
      empAutoId,
      employeeId: employee._id,
      userId: createdUser?._id || null,
    });
  } catch (e) {
    console.error("[EMPLOYEE_CREATE]", e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
