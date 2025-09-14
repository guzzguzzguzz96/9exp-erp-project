import mongoose, { Schema } from "mongoose";

const DepartmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    // รหัสย่อของแผนก (ต้องไม่ซ้ำ)
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },

    // >>> ฟิลด์ที่ถูกต้อง
    empIdPrefix: {
      type: String,
      required: true,
      // default สำหรับเอกสารใหม่ ให้ใช้ code โดยอัตโนมัติ
      default: function () {
        // เผื่อมีเอกสารเก่าที่เคยใช้ชื่อผิด 'empldPrefix'
        return this.code || this.empldPrefix;
      },
    },

    // (ตัวช่วยรองรับของเก่า — ถ้าใน DB เคยมีฟิลด์ชื่อผิด ให้ map มาใช้ชั่วคราว)
    // ไม่ต้องดึงออกมาเวลา query ปกติ
    empldPrefix: { type: String, select: false },

    color: { type: String, default: "#6366f1" },
    description: { type: String, default: "" },

    allowLevels: {
      type: [Number],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0 && arr.every((n) => [1, 2, 3, 4, 5, 6].includes(n)),
        message: "allowLevels must be a non-empty array of [1..6]",
      },
    },

    positions: [
      {
        name: { type: String, required: true, trim: true },
        level: { type: Number, required: true, enum: [1, 2, 3, 4, 5, 6] },
        order: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

// กันพลาดกรณีมีข้อมูลเก่า: ถ้า empIdPrefix ยังว่าง ให้ยัดจาก code หรือ empldPrefix
DepartmentSchema.pre("validate", function (next) {
  if (!this.empIdPrefix) this.empIdPrefix = this.code || this.empldPrefix;
  next();
});

DepartmentSchema.index({ code: 1 }, { unique: true });

export default mongoose.models.Department || mongoose.model("Department", DepartmentSchema);
