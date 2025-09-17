import express from "express";

const router = express.Router();

// Example: admin incidents route
router.get("/", (req, res) => {
  res.json({ message: "Admin incidents route is working ✅" });
});

export default router;
