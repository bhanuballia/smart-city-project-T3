import mongoose from "mongoose";

const airSchema = new mongoose.Schema({
  city: { type: String, required: true },
  AQI: { type: Number, required: true },
  category: { type: String, enum: ["Good", "Moderate", "Unhealthy", "Hazardous"], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Air", airSchema);
