import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Traffic", "Waste", "Energy", "Emergency", "Complaint"],
      required: true,
    },
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },
    metadata: { type: Object }, // store extra info (location, zone, etc.)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Alert", AlertSchema);
