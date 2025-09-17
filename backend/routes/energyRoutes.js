import express from "express";
import Energy from "../models/Energy.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Alert from "../models/Alert.js";
import CacheUtils from "../utils/cacheUtils.js";
const router = express.Router();

// Get energy data
router.get("/", authMiddleware(["Admin", "Operator"]), async (req, res) => {
  try {
    const data = await Energy.find().sort({ createdAt: -1 }).limit(50); // Added sort and limit
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new energy record
router.post("/", authMiddleware(["Admin", "Operator"]), async (req, res) => {
  try {
    const newEnergy = new Energy(req.body);
    const savedEnergy = await newEnergy.save();

    // Emit to all clients in real time
    req.io.emit("energy:new", savedEnergy);

    res.status(201).json(savedEnergy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Update energy sector usage
// Update energy sector usage
router.put("/:id", authMiddleware(["Admin", "Operator"]), async (req, res) => {
  try {
    const updated = await Energy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // Emit the updated record to all connected clients
    req.io.emit("energy:new", updated);

    // 🔹 Trigger alert if critical load
    if (updated.status === "Critical") {
      const alert = new Alert({
        type: "Energy",
        message: `⚡ Critical load in ${updated.sector}: ${updated.usage} kWh`,
        severity: "Critical",
        metadata: updated,
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
