"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const AstroGLB = dynamic(() => import("@/app/components/AstroGLB"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col bg-[#0F172B] text-slate-100">
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <AstroGLB scale={0.34} heightClass="h-44 md:h-56" />

        <h1 className="mt-4 text-4xl md:text-5xl font-bold text-slate-100">
          Welcome to <span className="text-[#66CBFF]">9Expert HRM</span>
        </h1>

        <p className="mt-4 text-slate-400 max-w-xl">
          Internal Human Resource Management System <br />
          Manage employees, attendance, and more — all in one place.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-medium transition"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-medium transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
