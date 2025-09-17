import express from "express";
import Traffic from "../models/Traffic.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all traffic hotspots
router.get("/", authMiddleware(), async (req, res) => {
  try {
    const hotspots = await Traffic.find();
    res.json(hotspots);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch traffic data" });
  }
});

// Create new hotspot
router.post("/", authMiddleware(["Admin", "Operator"]), async (req, res) => {
  try {
    const { location, intensity, status } = req.body;
    const newHotspot = new Traffic({ location, intensity, status });
    await newHotspot.save();

    req.io.emit("traffic:new", newHotspot);
    res.status(201).json(newHotspot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update hotspot
router.put("/:id", authMiddleware(["Admin", "Operator"]), async (req, res) => {
  try {
    const updated = await Traffic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Hotspot not found" });

    req.io.emit("traffic:update", updated);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete hotspot
router.delete("/:id", authMiddleware(["Admin"]), async (req, res) => {
  try {
    const deleted = await Traffic.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Hotspot not found" });

    req.io.emit("traffic:delete", req.params.id);
    res.json({ message: "Hotspot deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
if (updated.status === "Critical") {
  const Alert = (await import("../models/Alert.js")).default;
  const newAlert = new Alert({
    type: "Traffic",
    message: `Critical congestion at (${updated.location.lat}, ${updated.location.lng})`,
    severity: "Critical",
    metadata: updated,
    createdBy: req.user?.id || null,
  });
  await newAlert.save();
  req.io.emit("alert:new", newAlert);
}


});

export default router;
