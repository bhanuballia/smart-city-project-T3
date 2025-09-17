import mongoose from "mongoose";

const EnergySchema = new mongoose.Schema(
  {
    sector: { type: String, required: true }, // e.g., Residential, Commercial
    usage: { type: Number, required: true },  // kWh
    status: { type: String, default: "Normal" }, // Normal, High Load, Critical
  },
  { timestamps: true }
);

export default mongoose.model("Energy", EnergySchema);
