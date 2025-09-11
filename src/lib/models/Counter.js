import mongoose, { Schema, models } from "mongoose";
import "server-only";

const CounterSchema = new Schema({
  key: { type: String, unique: true },  // เช่น "IT"
  seq: { type: Number, default: 0 },
});
export default models.Counter || mongoose.model("Counter", CounterSchema);
