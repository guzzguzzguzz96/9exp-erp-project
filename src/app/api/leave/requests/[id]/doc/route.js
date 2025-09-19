import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import LeaveRequest from "@/lib/models/LeaveRequest";
import Employee from "@/lib/models/Employee";

export const dynamic = "force-dynamic";

// helper: format date range th-TH
function fmtD(d) {
  try {
    return new Date(d).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function statusBadge(status) {
  const map = {
    pending_hod: { text: "pending_hod", bg: "#F59E0B" }, // amber-500
    pending_hr:  { text: "pending_hr",  bg: "#EAB308" }, // yellow-500
    approved:    { text: "approved",    bg: "#10B981" }, // emerald-500
    rejected:    { text: "rejected",    bg: "#EF4444" }, // red-500
  };
  const it = map[status] || { text: status || "-", bg: "#64748B" }; // slate-500
  return `<span style="display:inline-block;padding:4px 10px;border-radius:999px;color:#fff;background:${it.bg};font-size:12px">${it.text}</span>`;
}

export async function GET(req, ctx) {
  await dbConnect();

  // 💡 Next.js 15: params ต้อง await
  const { id } = await ctx.params;

  const doc = await LeaveRequest.findById(id).lean();
  if (!doc) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const emp = await Employee.findById(doc.employeeId)
    .select("firstName lastName position department")
    .lean();

  const origin = req.nextUrl.origin;
  // 🖼 เปลี่ยนชื่อไฟล์โลโก้ได้ตามที่คุณวางใน /public
  const logoUrl = `${origin}/logo-9expert.png`;

  const empName = [emp?.firstName, emp?.lastName].filter(Boolean).join(" ") || "-";
  const position = emp?.position || "-";
  const dept = emp?.department || "-";
  const typeCode = doc?.typeCode || "-";
  const reason = doc?.reason || "-";
  const notes = doc?.notes || "-";
  const start = fmtD(doc?.startDate);
  const end = fmtD(doc?.endDate);
  const days = doc?.durationDays ?? "-";
  const createdAt = fmtD(doc?.createdAt);
  const badge = statusBadge(doc?.status);

  const sigDataUrl = doc?.signatures?.[0]?.dataUrl || "";

  const html = /* html */ `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>HRMS • Leave Request</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body { margin:0; padding:32px; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Thai", "Noto Sans", "Helvetica Neue", Arial, "Apple Color Emoji","Segoe UI Emoji"; background:#f8fafc; color:#0f172a; }
    .container { max-width: 980px; margin:0 auto; }
    .card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; }
    .row { display:grid; grid-template-columns: 220px 1fr; border-top:1px solid #e2e8f0; }
    .row:first-child { border-top:0; }
    .cell-h { background:#f8fafc; padding:12px 16px; font-weight:600; color:#1f2937; }
    .cell { padding:12px 16px; color:#334155; }

    .header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
    .brand { display:flex; align-items:center; gap:16px; }
    .brand img { height:40px; }
    .brand h1 { font-size:20px; margin:0; color:#0f172a; }

    .meta { font-size:12px; color:#64748b; margin:8px 0 24px; }
    .two { display:grid; grid-template-columns: 1fr 380px; gap:16px; align-items:stretch; }
    .sig-box { height:180px; border:1px dashed #cbd5e1; border-radius:12px; background:#f8fafc; display:flex; align-items:center; justify-content:center; }
    .sig-img { max-height:160px; max-width:100%; }
    .sig-name { text-align:center; margin-top:8px; color:#475569; }

    .section-title { font-weight:700; font-size:14px; color:#0f172a; margin:0 0 8px; }
    .footer { display:flex; justify-content:space-between; margin-top:16px; color:#94a3b8; font-size:12px; }

    .btn { appearance:none; border:1px solid #c7d2fe; background:#4f46e5; color:#fff; padding:8px 12px; border-radius:10px; font-size:13px; cursor:pointer; }
    .btn:active { transform: translateY(1px); }
    .btn.secondary { background:#fff; color:#1f2937; border-color:#e2e8f0; }
    .pill { font-size:12px; color:#475569; background:#eef2ff; border:1px solid #c7d2fe; border-radius:999px; padding:2px 10px; }

    @media print {
      .no-print { display:none !important; }
      body { background:#fff; padding:0; }
      .container { max-width:none; margin:0; }
      .card { border:0; border-radius:0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <img src="${logoUrl}" alt="Company Logo" onerror="this.style.display='none'"/>
        <h1>HRMS • Leave Request</h1>
      </div>
      <div class="no-print" style="display:flex; gap:8px;">
        <button class="btn secondary" onclick="location.reload()">รีเฟรช</button>
        <button class="btn" onclick="window.print()">ดาวน์โหลด PDF</button>
      </div>
    </div>

    <div class="meta">
      เลขที่เอกสาร: <span class="pill">${id}</span>
    </div>

    <div class="card">
      <!-- ข้อมูลคำขอ -->
      <div class="row"><div class="cell-h">พนักงาน</div><div class="cell">${empName}</div></div>
      <div class="row"><div class="cell-h">ประเภทลา</div><div class="cell">${typeCode}</div></div>
      <div class="row"><div class="cell-h">ตำแหน่ง</div><div class="cell">${position}</div></div>
      <div class="row"><div class="cell-h">แผนก</div><div class="cell">${dept}</div></div>
      <div class="row"><div class="cell-h">ช่วงวันลา</div><div class="cell">${start} – ${end}</div></div>
      <div class="row"><div class="cell-h">จำนวนวัน</div><div class="cell">${days}</div></div>
      <div class="row"><div class="cell-h">เหตุผล</div><div class="cell">${reason}</div></div>
      <div class="row"><div class="cell-h">บันทึกเพิ่มเติม</div><div class="cell">${notes}</div></div>
      <div class="row"><div class="cell-h">สถานะ</div><div class="cell">${badge}</div></div>
      <div class="row"><div class="cell-h">สร้างเมื่อ</div><div class="cell">${createdAt}</div></div>
    </div>

    <div class="two" style="margin-top:16px;">
      <!-- ลายเซ็น -->
      <div class="card" style="padding:16px;">
        <div class="section-title">ผู้ยื่นคำขอ</div>
        <div class="sig-box">
          ${
            sigDataUrl
              ? `<img class="sig-img" src="${sigDataUrl}" alt="signature" />`
              : `<span style="color:#94a3b8">ไม่มีลายเซ็น</span>`
          }
        </div>
        <div class="sig-name">${empName}</div>
      </div>

      <!-- ช่องลงนามอนุมัติ -->
      <div class="card" style="padding:16px;">
        <div class="section-title">สำหรับการอนุมัติ</div>
        <div class="row"><div class="cell-h">หัวหน้า (HoD)</div><div class="cell">—</div></div>
        <div class="row"><div class="cell-h">HR</div><div class="cell">—</div></div>
      </div>
    </div>

    <div class="footer">
      <div>เอกสารชุดนี้สร้างจากระบบ HRMS</div>
      <div>เปิดผ่าน <span class="pill">/api/leave/requests/[id]/doc</span></div>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
