import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongoose";
import User from "@/lib/models/User";
import Employee from "@/lib/models/Employee"; // เพื่อเติม empAutoId/department ลง session

export const runtime = "nodejs";

const handler = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};
        if (!email || !password) return null;

        await dbConnect();

        const user = await User.findOne({ email }).lean();
        if (!user) return null;
        if (user.status && user.status !== "active") return null;

        const ok = await bcrypt.compare(password, user.passwordHash || "");
        if (!ok) {
          // เพิ่มตัวนับล้มเหลว (ไม่ต้องรอ await ก็ได้)
          User.updateOne({ _id: user._id }, { $inc: { failedLoginCount: 1 } }).exec();
          return null;
        }

        // อัปเดตเวลาล็อกอินล่าสุด/รีเซ็ตตัวนับ
        User.updateOne(
          { _id: user._id },
          { $set: { lastLoginAt: new Date(), failedLoginCount: 0 } }
        ).exec();

        // เติมข้อมูลพนักงาน (ถ้ามี) จาก email
        const emp = await Employee.findOne({ email }).select("empAutoId department photoUrl").lean();

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          empAutoId: emp?.empAutoId || null,
          department: emp?.department || null,
          photoUrl: emp?.photoUrl ?? null,  
        };
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.empAutoId = user.empAutoId ?? null;
        token.department = user.department ?? null;
        token.photoUrl = user.photoUrl ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.empAutoId = token.empAutoId ?? null;
      session.user.department = token.department ?? null;
      session.user.photoUrl = token.photoUrl ?? null;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
