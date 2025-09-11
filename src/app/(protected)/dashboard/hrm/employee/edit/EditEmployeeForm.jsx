"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const normAvatar = (u) => {
  if (!u) return "/avatar-default.png";
  if (u.startsWith("http") || u.startsWith("data:")) return u;
  return u.startsWith("/") ? u : `/${u}`;
};

export default function EditEmployeeForm({
  employee,
  canAdmin,
  canEditPrivate,
}) {
  const { update } = useSession();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(employee.photoUrl || "");
  const [photoPublicId, setPhotoPublicId] = useState(
    employee.photoPublicId || ""
  );
  const [form, setForm] = useState(() => ({
    firstName: employee.firstName || "",
    lastName: employee.lastName || "",
    nickName: employee.nickName || "",
    phone: employee.phone || "",
    address: employee.address || "",
    email: employee.email || "",
    department: employee.department || "",
    position: employee.position || "",
    dateOfJoin: employee.dateOfJoin
      ? new Date(employee.dateOfJoin).toISOString().slice(0, 10)
      : "",
    emergency: {
      primary: {
        name: employee.emergency?.primary?.name || "",
        relationship: employee.emergency?.primary?.relationship || "",
        phone: employee.emergency?.primary?.phone || "",
        email: employee.emergency?.primary?.email || "",
        address: employee.emergency?.primary?.address || "",
      },
      secondary: {
        name: employee.emergency?.secondary?.name || "",
        relationship: employee.emergency?.secondary?.relationship || "",
        phone: employee.emergency?.secondary?.phone || "",
        email: employee.emergency?.secondary?.email || "",
        address: employee.emergency?.secondary?.address || "",
      },
    },
    privateInfo: {
      bookbank: {
        accountHolder: employee.privateInfo?.bookbank?.accountHolder || "",
        accountNumber: employee.privateInfo?.bookbank?.accountNumber || "",
        bankName: employee.privateInfo?.bookbank?.bankName || "",
        branchName: employee.privateInfo?.bookbank?.branchName || "",
      },
    },
  }));

  const canSave = useMemo(() => {
    return form.firstName.trim() && form.lastName.trim() && form.phone.trim();
  }, [form]);

  const onChange = (path, value) => {
    setForm((prev) => {
      const next = structuredClone(prev);
      let p = next;
      const keys = path.split(".");
      const last = keys.pop();
      for (const k of keys) p = p[k] ?? (p[k] = {});
      p[last] = value;
      return next;
    });
  };

  async function handleUpload(file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload/cloudinary", {
      method: "POST",
      body: fd,
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    setPhotoUrl(data.url);
    setPhotoPublicId(data.publicId);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!window.confirm("ยืนยันการบันทึกข้อมูล?")) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        photoUrl,
        photoPublicId,
      };
      // ตัด field ที่ employee แก้ไม่ได้ (เผื่อ client แฮ็ก)
      if (!canAdmin) {
        delete payload.email;
        delete payload.department;
        delete payload.position;
        delete payload.dateOfJoin;
        delete payload.privateInfo;
      }

      const res = await fetch(`/api/employees/${employee._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Update failed", res.status, text);
        alert(`บันทึกล้มเหลว (${res.status})`);
        return;
      }

      await update({
        photoUrl: payload.photoUrl,
        updatedAt: new Date().toISOString(),
      });

      alert("บันทึกเรียบร้อย");
      router.push(`/dashboard/hrm/employee-profile?id=${employee._id}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Avatar + Basic */}
      <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
        <h3 className="text-slate-200 font-medium mb-4">Basic</h3>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-24 w-24 rounded-2xl overflow-hidden ring-1 ring-white/10">
              <Image
                src={normAvatar(photoUrl)}
                alt="avatar"
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <label className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 ring-1 ring-white/10 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleUpload(e.target.files[0])
                }
              />
              Upload
            </label>
          </div>

          {/* Basic fields */}
          <div className="grid sm:grid-cols-2 gap-4 flex-1">
            <div>
              <label className="text-xs text-slate-400">First name</label>
              <input
                className="mt-1 w-full h-10 rounded-lg bg-white/5 px-3 ring-1 ring-white/10 text-slate-100"
                value={form.firstName}
                onChange={(e) => onChange("firstName", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Last name</label>
              <input
                className="mt-1 w-full h-10 rounded-lg bg-white/5 px-3 ring-1 ring-white/10 text-slate-100"
                value={form.lastName}
                onChange={(e) => onChange("lastName", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Nickname</label>
              <input
                className="mt-1 w-full h-10 rounded-lg bg-white/5 px-3 ring-1 ring-white/10 text-slate-100"
                value={form.nickName}
                onChange={(e) => onChange("nickName", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Phone</label>
              <input
                className="mt-1 w-full h-10 rounded-lg bg-white/5 px-3 ring-1 ring-white/10 text-slate-100"
                value={form.phone}
                onChange={(e) => onChange("phone", e.target.value)}
                pattern="^\d{10}$"
                title="กรอกเบอร์ 10 หลัก"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400">Address</label>
              <textarea
                className="mt-1 w-full min-h-[84px] rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 text-slate-100"
                value={form.address}
                onChange={(e) => onChange("address", e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Employment (admin only) */}
      {canAdmin && (
        <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
          <h3 className="text-slate-200 font-medium mb-4">Employment</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400">Email</label>
              <input
                type="email"
                className="mt-1 w-full h-10 rounded-lg bg-white/5 px-3 ring-1 ring-white/10 text-slate-100"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Department</label>
              <input
                className="mt-1 w-full h-10 rounded-lg bg-white/5 px-3 ring-1 ring-white/10 text-slate-100"
                value={form.department}
                onChange={(e) => onChange("department", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Position</label>
              <input
                className="mt-1 w-full h-10 rounded-lg bg-white/5 px-3 ring-1 ring-white/10 text-slate-100"
                value={form.position}
                onChange={(e) => onChange("position", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Date of Join</label>
              <input
                type="date"
                className="mt-1 w-full h-10 rounded-lg bg-white/5 px-3 ring-1 ring-white/10 text-slate-100"
                value={form.dateOfJoin}
                onChange={(e) => onChange("dateOfJoin", e.target.value)}
              />
            </div>
          </div>
        </section>
      )}

      {/* Emergency */}
      <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
        <h3 className="text-slate-200 font-medium mb-4">Emergency Contact</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          {["primary", "secondary"].map((key) => (
            <div key={key} className="space-y-3">
              <h4 className="text-slate-300 text-sm font-medium capitalize">
                {key}
              </h4>
              <div className="grid gap-3">
                <Input
                  label="Name"
                  value={form.emergency[key].name}
                  onChange={(v) => onChange(`emergency.${key}.name`, v)}
                />
                <Input
                  label="Relationship"
                  value={form.emergency[key].relationship}
                  onChange={(v) => onChange(`emergency.${key}.relationship`, v)}
                />
                <Input
                  label="Phone"
                  value={form.emergency[key].phone}
                  onChange={(v) => onChange(`emergency.${key}.phone`, v)}
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.emergency[key].email}
                  onChange={(v) => onChange(`emergency.${key}.email`, v)}
                />
                <TextArea
                  label="Address"
                  value={form.emergency[key].address}
                  onChange={(v) => onChange(`emergency.${key}.address`, v)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Private (visible to employee self; editable only by admin) */}
      <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-200 font-medium">Private Information</h3>
          {!canEditPrivate && (
            <span className="text-xs text-slate-400">
              * read-only สำหรับพนักงาน
            </span>
          )}
        </div>

        <div
          className={`grid sm:grid-cols-2 gap-4 ${
            !canEditPrivate ? "opacity-80" : ""
          }`}
        >
          <Input
            label="Account holder name"
            value={form.privateInfo.bookbank.accountHolder}
            onChange={(v) => onChange("privateInfo.bookbank.accountHolder", v)}
            readOnly={!canEditPrivate}
          />
          <Input
            label="Account name / No."
            value={form.privateInfo.bookbank.accountNumber}
            onChange={(v) => onChange("privateInfo.bookbank.accountNumber", v)}
            readOnly={!canEditPrivate}
          />
          <Input
            label="Bank name"
            value={form.privateInfo.bookbank.bankName}
            onChange={(v) => onChange("privateInfo.bookbank.bankName", v)}
            readOnly={!canEditPrivate}
          />
          <Input
            label="Branch name"
            value={form.privateInfo.bookbank.branchName}
            onChange={(v) => onChange("privateInfo.bookbank.branchName", v)}
            readOnly={!canEditPrivate}
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10 px-4 py-2.5 text-slate-200"
        >
          Cancel
        </button>

        <button
          disabled={!canSave || saving}
          className="rounded-xl bg-indigo-600/90 hover:bg-indigo-600 ring-1 ring-white/10 px-4 py-2.5 text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

/* small input helpers */
function Input({ label, value, onChange, type = "text", readOnly = false }) {
  return (
    <div>
      <label className="text-xs text-slate-400">{label}</label>
      <input
        type={type}
        readOnly={readOnly}
        className={`mt-1 w-full h-10 rounded-lg px-3 ring-1 ring-white/10 text-slate-100 ${
          readOnly ? "bg-white/5" : "bg-white/5 focus:outline-none"
        }`}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
function TextArea({ label, value, onChange, readOnly = false }) {
  return (
    <div>
      <label className="text-xs text-slate-400">{label}</label>
      <textarea
        readOnly={readOnly}
        className={`mt-1 w-full min-h-[84px] rounded-lg px-3 py-2 ring-1 ring-white/10 text-slate-100 ${
          readOnly ? "bg-white/5" : "bg-white/5"
        }`}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
