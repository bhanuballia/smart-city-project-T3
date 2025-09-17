import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["Fire", "Flood", "Accident", "Other"],
    },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["Active", "Resolved"],
      default: "Active",
    },
    reportedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Incident", incidentSchema);
