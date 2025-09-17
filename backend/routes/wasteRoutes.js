import express from "express";
import Waste from "../models/Waste.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Alert from "../models/Alert.js";

const router = express.Router();

// Get all waste zones
router.get("/", authMiddleware(["Admin", "Operator"]), async (req, res) => {
  try {
    const zones = await Waste.find();
    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update waste status
router.put("/:id", authMiddleware(["Admin", "Operator"]), async (req, res) => {
  try {
    const updated = await Waste.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // 🔹 Emit real-time update
    req.io.emit("waste:update", updated);

    // 🔹 Check for too many pending
    const pendingCount = await Waste.countDocuments({ status: "Pending" });
    if (pendingCount > 10) {
      const alert = new Alert({
        type: "Waste",
        message: `⚠️ High number of pending zones: ${pendingCount}`,
        severity: pendingCount > 20 ? "Critical" : "High",
        metadata: { pendingCount },
        createdBy: req.user?.id || null,
      });
      await alert.save();
      req.io.emit("alert:new", alert);
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
