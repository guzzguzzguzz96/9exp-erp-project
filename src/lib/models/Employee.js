import mongoose, { Schema, models } from "mongoose";
import "server-only";

const EmergencySchema = new Schema(
  {
    firstName: String,
    lastName: String,
    relationship: String,
    phone: String,
    email: String,
    address: String,
  },
  { _id: false }
);

const BookbankSchema = new Schema(
  {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    branchName: String,
  },
  { _id: false }
);

const EmployeeSchema = new Schema(
  {
    empAutoId: { type: String, unique: true }, // เช่น "IT-0001"
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    nickName: String,
    department: { type: String, required: true, uppercase: true, trim: true },
    level: { type: Number, default: 1, min: 1, max: 6 },
    position: { type: String, required: true },
    dateOfJoin: { type: Date, required: true },
    phone: String,
    email: { type: String, required: true, lowercase: true, trim: true },
    birthday: Date,
    address: String,
    gender: { type: String, enum: ["male", "female", "other"] },

    photoUrl: { type: String, default: "" },
    photoPublicId: { type: String, default: "" },

    emergency: EmergencySchema, // optional
    privateInfo: {
      bookbank: BookbankSchema, // optional
    },

    // ผูกกับ user id ถ้ามีการสร้างบัญชีล็อกอิน
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default models.Employee || mongoose.model("Employee", EmployeeSchema);
