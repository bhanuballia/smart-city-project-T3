import express from "express";
import Air from "../models/Air.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import cacheService from "../services/cacheService.js";
import CacheUtils from "../utils/cacheUtils.js";

const router = express.Router();

// Get all air pollution records with caching
router.get("/", authMiddleware(["Admin", "Operator"]), cacheService.cacheMiddleware(300), async (req, res) => {
  try {
    const data = await Air.find().sort({ createdAt: -1 }).limit(100);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get latest air data (cached)
router.get("/latest", authMiddleware(), async (req, res) => {
  try {
    const data = await CacheUtils.getLatestAirData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get air history (cached)
router.get("/history", authMiddleware(), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const data = await CacheUtils.getAirHistory(limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new air record manually (optional)
router.post("/", authMiddleware(["Admin", "Operator"]), async (req, res) => {
  try {
    const newAir = new Air(req.body);
    const saved = await newAir.save();

    // Invalidate cache
    await CacheUtils.invalidateDataCache('air');

    // Emit socket event
    req.io.emit("air:new", saved);

    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
