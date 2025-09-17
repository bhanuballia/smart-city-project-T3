import express from "express";
import {
  createAnnouncement,
  getActiveAnnouncements,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementById
} from "../controllers/announcementController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveAnnouncements); // Get active announcements for home page

// Protected routes (Admin only)
router.post("/", authMiddleware(["Admin"]), createAnnouncement);
router.get("/", authMiddleware(["Admin"]), getAllAnnouncements);
router.get("/:id", authMiddleware(["Admin"]), getAnnouncementById);
router.put("/:id", authMiddleware(["Admin"]), updateAnnouncement);
router.delete("/:id", authMiddleware(["Admin"]), deleteAnnouncement);

export default router;
