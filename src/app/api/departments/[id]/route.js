import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongoose";
import Department from "@/lib/models/Department";
import Employee from "@/lib/models/Employee";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? "employee";
  if (!["superadmin", "hr"].includes(role)) {
    return { ok: false, res: NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true };
}

export async function PUT(req, { params }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  await dbConnect();
  try {
    const body = await req.json();
    const payload = {
      name: body.name,
      code: body.code,
      color: body.color,
      empIdPrefix: body.empIdPrefix ?? "",
      description: body.description ?? "",
      allowedLevels: Array.isArray(body.allowedLevels) ? body.allowedLevels : [],
      positions: Array.isArray(body.positions) ? body.positions : [],
      updatedAt: new Date(),
    };
    await Department.findByIdAndUpdate(params.id, payload);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, message: e?.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  await dbConnect();
  try {
    const n = await Employee.countDocuments({ departmentId: params.id });
    if (n > 0) {
      return NextResponse.json(
        { ok: false, message: `Cannot delete: ${n} employee(s) still in this department.` },
        { status: 409 }
      );
    }
    await Department.findByIdAndDelete(params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, message: e?.message || "Server error" }, { status: 500 });
  }
}
