import express from "express";
import Alert from "../models/Alert.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Get all alerts (Admin only)
router.get("/", authMiddleware(["Admin"]), async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Create alert (System or Admin)
router.post("/", authMiddleware(["Admin", "Operator"]), async (req, res) => {
  try {
    const { type, message, severity, metadata } = req.body;
    const alert = new Alert({
      type,
      message,
      severity,
      metadata,
      createdBy: req.user?.id || null,
    });
    await alert.save();

    // Emit to all connected clients
    req.io.emit("alert:new", alert);

    res.status(201).json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 Delete alert
router.delete("/:id", authMiddleware(["Admin"]), async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    req.io.emit("alert:delete", req.params.id);
    res.json({ message: "Alert deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
