import mongoose from "mongoose";

const WasteSchema = new mongoose.Schema(
  {
    zone: { type: String, required: true },
    level: { type: Number, required: true }, // % full
    status: {
      type: String,
      enum: ["Normal", "Full", "Overflow"],
      default: "Normal",
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Waste", WasteSchema);
