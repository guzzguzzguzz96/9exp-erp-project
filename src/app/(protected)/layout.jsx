import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";

export default function ProtectedLayout({ children }) {
  return (
    <div className="min-h-dvh bg-[#0F172B] text-slate-200">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Topbar />
          <main className="px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
