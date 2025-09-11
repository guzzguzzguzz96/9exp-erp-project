// src/lib/authOptions.js
import Credentials from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize({ email, password }) {
        // TODO: ตรวจ user จริงจาก DB
        if (email === "admin@company.com" && password === "123456") {
          return { id: "1", name: "Admin", email, role: "superadmin" };
        }
        if (email === "hr@company.com" && password === "123456") {
          return { id: "2", name: "HR User", email, role: "hr" };
        }
        return null; // ไม่ผ่าน
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.uid = user.id; // ✅ id ของ user
        token.role = user.role;
        token.empAutoId = user.empAutoId ?? null;
        token.department = user.department ?? null;
        token.photoUrl = user.photoUrl ?? null;
      }
      
      if (trigger === "update" && session?.photoUrl !== undefined) {
        token.photoUrl = session.photoUrl;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.uid; // ✅ ทำให้ session.user.id ใช้ได้
      session.user.role = token.role;
      session.user.empAutoId = token.empAutoId ?? null;
      session.user.department = token.department ?? null;
      session.user.photoUrl = token.photoUrl ?? null;
      return session;
    },
  },
};
