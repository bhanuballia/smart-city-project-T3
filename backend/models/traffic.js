import mongoose from "mongoose";

const TrafficSchema = new mongoose.Schema(
  {
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    intensity: { type: Number, required: true }, // e.g. 0–100
    status: {
      type: String,
      enum: ["Light", "Moderate", "Heavy", "Critical"],
      default: "Light",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Traffic", TrafficSchema);
