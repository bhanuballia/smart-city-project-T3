import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cron from "node-cron";

import authRoutes from "./routes/authRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import energyRoutes from "./routes/energyRoutes.js";
import adminRoutes from "./routes/admin/index.js";
import adminUserRoutes from "./routes/admin/users.js";
import adminIncidentRoutes from "./routes/admin/incidents.js";
import trafficRoutes from "./routes/trafficRoutes.js";
import wasteRoutes from "./routes/wasteRoutes.js";
import airRoutes from "./routes/airRoutes.js";
import alertsRoutes from "./routes/alertsRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import optimizationRoutes from "./routes/optimizationRoutes.js";
import Energy from "./models/Energy.js";
import Traffic from "./models/Traffic.js";
import Waste from "./models/Waste.js";
import Air from "./models/Air.js";
import cacheService from "./services/cacheService.js";
import CacheUtils from "./utils/cacheUtils.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// 🔹 Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach io to req so routes/controllers can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/energy", energyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/incidents", adminIncidentRoutes);
app.use("/api/traffic", trafficRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/air", airRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/optimize", optimizationRoutes);

// Dashboard statistics endpoint (Admin and Operator only)
app.get("/api/dashboard/stats", authMiddleware(["Admin", "Operator"]), async (req, res) => {
  try {
    const stats = await CacheUtils.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cache statistics endpoint
app.get("/api/cache/stats", async (req, res) => {
  try {
    const stats = cacheService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cache endpoint (admin only)
app.post("/api/cache/clear", async (req, res) => {
  try {
    await cacheService.clear();
    res.json({ message: "Cache cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Smart City API is running...");
});

// 🔹 MongoDB connect
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Socket.IO connections
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// -----------------------------------------------------------------
// 🔹 MOCK IoT CRON JOBS with CACHING
// -----------------------------------------------------------------
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 🚦 Traffic data every 30 seconds
cron.schedule("*/30 * * * * *", async () => {
  try {
    const statuses = ["Light", "Moderate", "Heavy", "Critical"];
    const trafficData = {
      location: {
        name: "Lucknow",
        lat: 26.8467 + (Math.random() - 0.5) * 0.1,
        lng: 80.9462 + (Math.random() - 0.5) * 0.1,
      },
      intensity: randomInt(10, 100),
      status: statuses[randomInt(0, 3)],
    };
    const newTrafficRecord = new Traffic(trafficData);
    const savedRecord = await newTrafficRecord.save();
    
    // Invalidate traffic cache
    await CacheUtils.invalidateDataCache('traffic');
    
    io.emit("traffic:new", savedRecord);
    console.log("🚦 Sent and saved traffic update:", savedRecord);
  } catch (error) {
    console.error("❌ Failed to create mock traffic data:", error);
  }
});

// 🗑 Waste data every 1 minute
cron.schedule("0 * * * * *", async () => {
  try {
    const zoneNumber = randomInt(1, 5);
    const zoneLocations = [
      { lat: 26.8500, lng: 80.9499 }, // Zone 1
      { lat: 26.8600, lng: 80.9399 }, // Zone 2
      { lat: 26.8400, lng: 80.9599 }, // Zone 3
      { lat: 26.8700, lng: 80.9299 }, // Zone 4
      { lat: 26.8300, lng: 80.9699 }, // Zone 5
    ];

    const wasteData = {
      zone: `Zone-${zoneNumber}`,
      level: randomInt(20, 100),
      status: ["Normal", "Full", "Overflow"][randomInt(0, 2)],
      location: zoneLocations[zoneNumber - 1],
    };
    const newWasteRecord = new Waste(wasteData);
    const savedRecord = await newWasteRecord.save();
    
    // Invalidate waste cache
    await CacheUtils.invalidateDataCache('waste');
    
    io.emit("waste:new", savedRecord);
    console.log("🗑 Sent and saved waste update:", savedRecord);
  } catch (error) {
    console.error("❌ Failed to create mock waste data:", error);
  }
});

// ⚡ Energy data every 2 minutes
cron.schedule("0 */2 * * * *", async () => {
  try {
    const statuses = ["Normal", "High Load", "Critical"];
    const energyData = {
      sector: ["Residential", "Commercial", "Industrial"][randomInt(0, 2)],
      usage: randomInt(100, 1000),
      status: statuses[randomInt(0, 2)],
    };

    const newEnergyRecord = new Energy(energyData);
    const savedRecord = await newEnergyRecord.save();
    
    // Invalidate energy cache
    await CacheUtils.invalidateDataCache('energy');

    io.emit("energy:new", savedRecord);
    console.log("⚡ Sent and saved energy update:", savedRecord);
  } catch (error) {
    console.error("❌ Failed to create mock energy data:", error);
  }
});

// 🌫 Air Pollution data every 1 min
cron.schedule("0 * * * * *", async () => {
  try {
    const cities = ["Lucknow"];
    const airData = {
      city: cities[0],
      AQI: randomInt(50, 400),
      category: ["Good", "Moderate", "Unhealthy", "Hazardous"][randomInt(0, 3)],
      createdAt: new Date(),
    };

    const newAir = new Air(airData);
    const saved = await newAir.save();
    
    // Invalidate air cache
    await CacheUtils.invalidateDataCache('air');

    io.emit("air:new", saved);
    console.log("🌫 Sent + Saved air pollution update:", saved);
  } catch (err) {
    console.error("❌ Error saving air data:", err);
  }
});

// Cache warming job - runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  try {
    console.log("🔄 Warming cache...");
    await Promise.all([
      CacheUtils.getLatestAirData(),
      CacheUtils.getLatestTrafficData(),
      CacheUtils.getLatestWasteData(),
      CacheUtils.getLatestEnergyData(),
      CacheUtils.getDashboardStats()
    ]);
    console.log("✅ Cache warmed successfully");
  } catch (error) {
    console.error("❌ Cache warming failed:", error);
  }
});

// -----------------------------------------------------------------

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));