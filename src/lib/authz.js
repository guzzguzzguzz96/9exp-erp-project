import { getServerSession } from "next-auth";
// ถ้าคุณเก็บ options ไว้ที่ "@/lib/authOptions" ให้ import จากที่นี่
import { authOptions } from "@/lib/authOptions";
// ถ้าคุณเก็บไว้ใน route แทน ให้ใช้:
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

// ใช้ใน "เพจ/เลย์เอาต์" (Server Component) — ถ้าไม่ผ่านให้ redirect
export async function requireSessionPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return session;
}

export async function requireRolePage(roles = []) {
  const session = await requireSessionPage();
  if (roles.length && !roles.includes(session.user.role)) {
    redirect("/403");
  }
  return session;
}

// ใช้ใน "API Route" — ถ้าไม่ผ่านให้คืน JSON 401/403
export async function requireSessionAPI() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}

export async function requireRoleAPI(roles = []) {
  const gate = await requireSessionAPI();
  if (gate.res) return gate; // 401 แล้ว
  const { session } = gate;
  if (roles.length && !roles.includes(session.user.role)) {
    return { res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}
