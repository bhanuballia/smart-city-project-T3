import express from "express";
import User from "../../models/User.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get all users (admin only)
router.get("/", authMiddleware(["Admin"]), async (req, res) => {
  try {
    const users = await User.find().select("name email role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Create user (admin only)
router.post("/", authMiddleware(["Admin"]), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const bcrypt = (await import("bcryptjs")).default;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword, role: role || "User" });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Failed to create user" });
  }
});

// Update user role (admin only)
router.put("/:id", authMiddleware(["Admin"]), async (req, res) => {
  try {
    const { role } = req.body;
    const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(
      "name email role"
    );
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Delete user (admin only)
router.delete("/:id", authMiddleware(["Admin"]), async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
