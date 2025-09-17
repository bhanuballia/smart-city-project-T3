import express from "express";
import Incident from "../models/Incident.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Alert from "../models/Alert.js";

const router = express.Router();

// Get incidents
router.get("/", authMiddleware(["Admin", "Operator"]), async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Report incident
router.post("/", authMiddleware(["Admin", "Operator"]), async (req, res) => {
  try {
    const { type, description, location, severity } = req.body;
    const incident = new Incident({
      type,
      description,
      location,
      severity,
      reportedBy: req.user?.id || null,
    });

    await incident.save();

    req.io.emit("incident:new", incident);

    // 🔹 Also generate alert
    const alert = new Alert({
      type: "Emergency",
      message: `🚨 ${severity} incident reported: ${type} - ${description}`,
      severity: severity,
      metadata: incident,
      createdBy: req.user?.id || null,
    });
    await alert.save();
    req.io.emit("alert:new", alert);

    res.status(201).json(incident);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update incident (resolve etc.)
router.put("/:id", authMiddleware(["Admin", "Operator"]), async (req, res) => {
  try {
    const updated = await Incident.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Incident not found" });
    req.io.emit("incident:update", updated);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete incident
router.delete("/:id", authMiddleware(["Admin", "Operator"]), async (req, res) => {
  try {
    const deleted = await Incident.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Incident not found" });
    req.io.emit("incident:delete", req.params.id);
    res.json({ message: "Incident deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;