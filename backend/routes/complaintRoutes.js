import express from "express";
import {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  getComplaintByNumber,
  updateComplaintStatus,
  getComplaintStats,
  deleteComplaint
} from "../controllers/complaintController.js";
import {  authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/", createComplaint); // Submit new complaint
router.get("/track/:complaintNumber", getComplaintByNumber); // Track complaint by number

// Protected routes (require authentication)
router.get("/", authMiddleware(["Admin", "Operator"]), getAllComplaints); // Get all complaints
router.get("/stats", authMiddleware(["Admin", "Operator"]), getComplaintStats); // Get statistics
router.get("/:id", authMiddleware(["Admin", "Operator"]), getComplaintById); // Get complaint by ID
router.put("/:id", authMiddleware(["Admin", "Operator"]), updateComplaintStatus); // Update complaint
router.delete("/:id", authMiddleware(["Admin"]), deleteComplaint); // Delete complaint (admin only)

export default router;
