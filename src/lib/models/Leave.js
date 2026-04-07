import mongoose, { Schema } from "mongoose";

const LeaveSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    userId:     { type: Schema.Types.ObjectId, ref: "User",     required: true },

    leaveType: {
      type: String,
      enum: ["sick", "annual", "personal", "maternity", "paternity", "other"],
      required: true,
    },

    startDate: { type: Date,   required: true },
    endDate:   { type: Date,   required: true },
    totalDays: { type: Number, required: true },
    reason:    { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },

    approverId:   { type: Schema.Types.ObjectId, ref: "User" },
    approverNote: { type: String },
    approvedAt:   { type: Date },

    attachmentUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Leave || mongoose.model("Leave", LeaveSchema);
