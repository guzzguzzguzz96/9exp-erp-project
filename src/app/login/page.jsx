"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();

  // รองรับ error ที่ส่งมาทาง query (?error=CredentialsSignin เป็นต้น)
  const queryError = search.get("error");
  const errorFromQuery = useMemo(() => {
    if (!queryError) return "";
    switch (queryError) {
      case "CredentialsSignin":
        return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      default:
        return "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง";
    }
  }, [queryError]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(errorFromQuery);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,              // ให้เราควบคุมการเปลี่ยนหน้าเอง
      email,
      password,
      // สามารถแนบ remember ไว้แล้วไปอ่านใน authorize ได้
      callbackUrl: "/dashboard",
    });

    setLoading(false);

    if (!res) {
      setErr("เกิดข้อผิดพลาดที่ไม่คาดคิด");
      return;
    }

    if (res.error) {
      // NextAuth จะขึ้นข้อความสั้น ๆ; map เป็นไทยไว้ด้านบนแล้ว
      setErr(errorFromQuery || "เข้าสู่ระบบไม่สำเร็จ");
      return;
    }

    // สำเร็จ → ไป dashboard
    router.push(res.url || "/dashboard");
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-[#0F172B] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/5 p-6 ring-1 ring-inset ring-white/10 shadow-xl backdrop-blur">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-100">Sign in</h1>
          <p className="text-slate-400 text-sm mt-1">
            Internal system — please use your company account.
          </p>
        </div>

        {/* Error */}
        {(err || errorFromQuery) && (
          <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm">
            {err || errorFromQuery}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-slate-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 outline-none ring-1 ring-inset ring-white/10 focus:ring-indigo-400/40"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-white/5 px-4 py-2.5 pr-12 text-slate-100 placeholder:text-slate-400 outline-none ring-1 ring-inset ring-white/10 focus:ring-indigo-400/40"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-slate-300 hover:text-indigo-300"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* ตรงนี้เผื่อไว้ถ้าต้องทำ remember me จริงใน authorize/callback */}
            <label className="inline-flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-400/40"
                // onChange={(e) => setRemember(e.target.checked)}
                disabled
              />
              Remember me (coming soon)
            </label>

            <Link
              href="/forgot-password"
              className="text-sm text-slate-300 hover:text-indigo-300"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 disabled:opacity-60 px-4 py-2.5 text-white font-medium transition"
          >
            <LogIn size={18} />
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Footnote: บอกเรื่องสิทธิ์/role */}
        <p className="mt-6 text-xs text-slate-400">
          Access is role-based (RBAC). หากคุณยังไม่มีสิทธิ์ โปรดติดต่อ HR/IT เพื่อขอเพิ่ม Role
          ตามตารางหน้าที่ในระบบ
        </p>
      </div>
    </div>
  );
}
