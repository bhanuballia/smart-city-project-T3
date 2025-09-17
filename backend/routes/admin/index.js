import express from "express";

const router = express.Router();

// Simple test route
router.get("/", (req, res) => {
  res.json({ message: "Admin root route is working ✅" });
});

export default router;
