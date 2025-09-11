// src/app/config/menuConfig.js
import {
  LayoutDashboard,
  UserCircle2,
  Laptop,
  CalendarCheck2,
  Clock4,
  FileSpreadsheet,
  Users,
  Network,
  BriefcaseBusiness,
  LogOut,
  ShieldCheck,
  BarChart3,
  ClipboardList,
  ClipboardCheck,
  CalendarDays,
  Upload,
  Wallet,
  BadgeDollarSign,
  HeartPulse,
  LineChart,
  ListChecks,
  MessageSquareMore,
  ArrowBigUpDash,
  GraduationCap,
  BookmarkCheck,
  Dumbbell,
  Target,
  ClipboardSignature,
  ScanSearch,
  Wrench,
  PackageSearch,
  Boxes,
  Settings,
  UserCog,
  Building2,
  GitBranch,
  Cable,
  FileLock2,
  Home,
  FolderTree,
  FileText,
  Calendar,
  Mail,
} from "lucide-react";

/** ปรับชื่อ role ตรงนี้ให้ตรงกับระบบของคุณ */
export const ROLES = {
  EMPLOYEE: "employee",
  MANAGER: "manager",
  HR: "hr",
  PAYROLL: "payroll",
  ADMIN: "superadmin", // ในโปรเจกต์คุณใช้ superadmin
  EXEC: "executive",
};

const ALL = Object.values(ROLES);
const HR_ADMIN = [ROLES.HR, ROLES.ADMIN];
const ADMIN_ONLY = [ROLES.ADMIN];
const HR_ADMIN_PAYROLL = [ROLES.HR, ROLES.ADMIN, ROLES.PAYROLL];
const MGMT_ROLES = [ROLES.MANAGER, ROLES.EXEC, ROLES.ADMIN];

export const menuConfig = [
  {
    key: "main",
    type: "group",
    label: "MAIN",
    children: [
      { key: "dash", type: "link", label: "Dashboards", href: "/dashboard", icon: Home },

      {
        key: "emp",
        type: "group",
        label: "พนักงาน (Employee)",
        icon: Users,
        roles: ALL,
        children: [
          { key: "emp-profile", type: "link", icon: UserCircle2, roles: ALL, label: "โปรไฟล์ของฉัน", href: "/dashboard/hrm/employee-profile" },
          { key: "emp.asset.mine", type: "link", icon: Laptop, roles: ALL, label: "อุปกรณ์ของฉัน", href: "/dashboard/assets/my-devices" },
          { key: "emp.leave.request", type: "link", icon: CalendarCheck2, roles: ALL, label: "ขอ/ตรวจสอบการลา", href: "/dashboard/leave/request" },
          { key: "emp.attendance", type: "link", icon: Clock4, roles: ALL, label: "ดูเวลาทำงาน (Attendance)", href: "/dashboard/attendance/me" },
          { key: "emp.payslip", type: "link", icon: FileSpreadsheet, roles: ALL, label: "สลิปเงินเดือน", href: "/dashboard/payroll/mypayslip" },
        ],
      },
      {
        key: "hr",
        type: "group",
        label: "HR / Admin",
        icon: ShieldCheck,
        roles: HR_ADMIN,
        children: [
          { key: "hr.employee.list", type: "link", icon: Users, roles: HR_ADMIN, label: "ข้อมูลพนักงาน", href: "/dashboard/hrm/employee" },
          { key: "hr.orgchart", type: "link", icon: Network, roles: HR_ADMIN, label: "โครงสร้างองค์กร (Org Chart)", href: "/dashboard/hrm/orgchart" },
          { key: "hr.recruit", type: "link", icon: BriefcaseBusiness, roles: HR_ADMIN, label: "การสรรหา & Onboarding", href: "/dashboard/hr/recruit-onboard" },
          { key: "hr.offboard", type: "link", icon: LogOut, roles: HR_ADMIN, label: "การลาออก & Offboarding", href: "/dashboard/hr/offboard" },
          { key: "hr.policy", type: "link", icon: ShieldCheck, roles: HR_ADMIN, label: "การตั้งค่า HR Policy", href: "/dashboard/hr/policy" },
          { key: "hr.reports", type: "link", icon: BarChart3, roles: HR_ADMIN, label: "รายงานองค์กร", href: "/dashboard/hr/reports" },
        ],
      },
      {
        key: "time",
        type: "group",
        label: "เวลา & การทำงาน",
        icon: Clock4,
        roles: ALL,
        children: [
          { key: "time.checkin", type: "link", icon: ClipboardList, roles: ALL, label: "บันทึกเวลาเข้า–ออก", href: "/dashboard/attendance/checkin" },
          { key: "time.shift", type: "link", icon: ClipboardCheck, roles: ALL, label: "กะงาน (Shift)", href: "/dashboard/attendance/shift" },
          { key: "time.report", type: "link", icon: CalendarDays, roles: ALL, label: "รายงานเวลา/สาย/OT", href: "/dashboard/attendance/reports" },
          { key: "time.export", type: "link", icon: Upload, roles: ALL, label: "Export Attendance", href: "/dashboard/attendance/export" },
        ],
      },
      {
        key: "leave",
        type: "group",
        label: "การลา",
        icon: CalendarCheck2,
        roles: ALL,
        children: [
          { key: "leave.approve", type: "link", icon: CalendarCheck2, roles: ALL, label: "ขออนุมัติการลา", href: "/dashboard/leave/approval" },
          { key: "leave.balance", type: "link", icon: ListChecks, roles: ALL, label: "สิทธิวันลาคงเหลือ", href: "/dashboard/leave/balance" },
          { key: "leave.report", type: "link", icon: BarChart3, roles: ALL, label: "รายงานการลา", href: "/dashboard/leave/reports" },
        ],
      },
      {
        key: "payroll",
        type: "group",
        label: "เงินเดือน & ค่าตอบแทน",
        icon: Wallet,
        roles: ALL,
        children: [
          { key: "payroll.calc", type: "link", icon: Wallet, roles: ALL, label: "คำนวณเงินเดือน", href: "/dashboard/payroll/calc" },
          { key: "payroll.slip", type: "link", icon: FileSpreadsheet, roles: ALL, label: "Slip เงินเดือน", href: "/dashboard/payroll/slips" },
          { key: "payroll.bonus", type: "link", icon: BadgeDollarSign, roles: ALL, label: "โบนัส/เบี้ยเลี้ยง", href: "/dashboard/payroll/bonus" },
          { key: "payroll.benefit", type: "link", icon: HeartPulse, roles: ALL, label: "สวัสดิการ & ประกันสังคม", href: "/dashboard/payroll/benefits" },
        ],
      },
      {
        key: "perf",
        type: "group",
        label: "การประเมินผล",
        icon: LineChart,
        roles: ALL,
        children: [
          { key: "perf.kpi", type: "link", icon: LineChart, roles: ALL, label: "KPI / OKR", href: "/dashboard/performance/kpi" },
          { key: "perf.form", type: "link", icon: ListChecks, roles: ALL, label: "แบบประเมินผล", href: "/dashboard/performance/forms" },
          { key: "perf.feedback", type: "link", icon: MessageSquareMore, roles: ALL, label: "Feedback & 360°", href: "/dashboard/performance/feedback360" },
          { key: "perf.promotion", type: "link", icon: ArrowBigUpDash, roles: ALL, label: "ประวัติเลื่อนตำแหน่ง", href: "/dashboard/performance/promotion" },
        ],
      },
      {
        key: "asset",
        type: "group",
        label: "สินทรัพย์ & อุปกรณ์",
        icon: Boxes,
        roles: ALL,
        children: [
          { key: "asset.list", type: "link", icon: Boxes, roles: ALL, label: "รายการอุปกรณ์ทั้งหมด", href: "/dashboard/assets" },
          { key: "asset.borrow", type: "link", icon: ClipboardSignature, roles: ALL, label: "เบิก-คืนอุปกรณ์", href: "/dashboard/assets/borrow" },
          { key: "asset.maintenance", type: "link", icon: Wrench, roles: ALL, label: "แจ้งซ่อม/บำรุง", href: "/dashboard/assets/maintenance" },
          { key: "asset.audit", type: "link", icon: ScanSearch, roles: ALL, label: "ตรวจนับ (Audit / Scan QR)", href: "/dashboard/assets/audit" },
          { key: "asset.report", type: "link", icon: PackageSearch, roles: ALL, label: "รายงานอุปกรณ์", href: "/dashboard/assets/reports" },
        ],
      },
      {
        key: "exit",
        type: "group",
        label: "การลาออก (Exit)",
        icon: MessageSquareMore,
        roles: ALL,
        children: [
          { key: "exit.interview", type: "link", icon: MessageSquareMore, roles: ALL, label: "Exit Interview", href: "/dashboard/exit/interview" },
          { key: "exit.checklist", type: "link", icon: ListChecks, roles: ALL, label: "Checklist การคืนอุปกรณ์", href: "/dashboard/exit/checklist" },
          { key: "exit.archive", type: "link", icon: FileLock2, roles: ALL, label: "เก็บข้อมูลพนักงานเก่า", href: "/dashboard/exit/archive" },
        ],
      },
      {
        key: "settings",
        type: "group",
        label: "การตั้งค่า (System Settings)",
        icon: UserCog,
        roles: ALL,
        children: [
          { key: "settings.rbac", type: "link", icon: UserCog, roles: ALL, label: "ผู้ใช้ & สิทธิ์ (RBAC)", href: "/dashboard/settings/users" },
          { key: "settings.org", type: "link", icon: Building2, roles: ALL, label: "แผนก/ตำแหน่ง", href: "/dashboard/hrm/departments" },
          { key: "settings.workflow", type: "link", icon: GitBranch, roles: ALL, label: "Workflow อนุมัติ", href: "/dashboard/settings/workflows" },
          { key: "settings.integration", type: "link", icon: Cable, roles: ALL, label: "Integration (Email/SSO/Scanner/…)", href: "/dashboard/settings/integrations" },
          { key: "settings.policylog", type: "link", icon: Settings, roles: ALL, label: "Policy & Audit Log", href: "/dashboard/settings/policy-audit" },
        ],
      },

      // … กลุ่มอื่น ๆ ต่อได้
    ],
  },
];