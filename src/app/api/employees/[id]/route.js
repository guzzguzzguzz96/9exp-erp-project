import dbConnect from "@/lib/mongoose";
import Employee from "@/lib/models/Employee";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import cloudinary from "@/lib/cloudinary";

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  await dbConnect();

  const id = params.id;
  const emp = await Employee.findById(id).lean();
  if (!emp) return new Response("Not found", { status: 404 });

  const role = session.user.role;
  const isSelf = emp.email?.toLowerCase() === session.user.email?.toLowerCase();

  if (!(isSelf || ["superadmin", "hr"].includes(role))) {
    return new Response("Forbidden", { status: 403 });
  }

  const payload = await req.json();

  // สิทธิ์การแก้ไข
  const selfFields = [
    "firstName",
    "lastName",
    "nickName",
    "phone",
    "address",
    "photoUrl",
    "photoPublicId",
    "emergency",
  ];
  const adminExtra = [
    "department",
    "position",
    "dateOfJoin",
    "email",
    "privateInfo",
  ];

  const allowed = ["superadmin", "hr"].includes(role)
    ? [...selfFields, ...adminExtra]
    : selfFields;

  const update = {};
  for (const k of allowed) {
    if (payload[k] !== undefined) update[k] = payload[k];
  }
  update.updatedAt = new Date();

  if (
    update.photoPublicId &&
    update.photoPublicId !== emp.photoPublicId &&
    emp.photoPublicId
  ) {
    try {
      await cloudinary.uploader.destroy(emp.photoPublicId);
    } catch (e) {
      console.warn("Cloudinary destroy failed:", e?.message);
    }
  }

  await Employee.findByIdAndUpdate(id, update);
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
