import Announcement from "../models/Announcement.js";

// Create new announcement (Admin only)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, type, priority, location, expiresAt } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        error: "Title and message are required"
      });
    }

    const announcement = new Announcement({
      title,
      message,
      type,
      priority,
      location,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user.id
    });

    await announcement.save();

    // Emit real-time updates
    if (req.io) {
      req.io.emit("announcement:new", announcement);
    }

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcement
    });

  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({
      error: "Failed to create announcement",
      details: error.message
    });
  }
};

// Get all active announcements (public)
export const getActiveAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    })
    .populate("createdBy", "name")
    .sort({ priority: -1, createdAt: -1 })
    .select("-__v");

    res.json({
      success: true,
      data: announcements
    });

  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({
      error: "Failed to fetch announcements",
      details: error.message
    });
  }
};

// Get all announcements (Admin only)
export const getAllAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, priority, isActive } = req.query;

    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const announcements = await Announcement.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v");

    const total = await Announcement.countDocuments(filter);

    res.json({
      success: true,
      data: announcements,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({
      error: "Failed to fetch announcements",
      details: error.message
    });
  }
};

// Update announcement (Admin only)
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, type, priority, location, isActive, expiresAt } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        error: "Announcement not found"
      });
    }

    // Update fields
    if (title) announcement.title = title;
    if (message) announcement.message = message;
    if (type) announcement.type = type;
    if (priority) announcement.priority = priority;
    if (location !== undefined) announcement.location = location;
    if (isActive !== undefined) announcement.isActive = isActive;
    if (expiresAt !== undefined) announcement.expiresAt = expiresAt ? new Date(expiresAt) : null;

    await announcement.save();

    // Emit real-time updates
    if (req.io) {
      req.io.emit("announcement:updated", announcement);
    }

    res.json({
      success: true,
      message: "Announcement updated successfully",
      data: announcement
    });

  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({
      error: "Failed to update announcement",
      details: error.message
    });
  }
};

// Delete announcement (Admin only)
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      return res.status(404).json({
        error: "Announcement not found"
      });
    }

    // Emit real-time updates
    if (req.io) {
      req.io.emit("announcement:deleted", id);
    }

    res.json({
      success: true,
      message: "Announcement deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({
      error: "Failed to delete announcement",
      details: error.message
    });
  }
};

// Get announcement by ID
export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id)
      .populate("createdBy", "name email")
      .select("-__v");

    if (!announcement) {
      return res.status(404).json({
        error: "Announcement not found"
      });
    }

    res.json({
      success: true,
      data: announcement
    });

  } catch (error) {
    console.error("Error fetching announcement:", error);
    res.status(500).json({
      error: "Failed to fetch announcement",
      details: error.message
    });
  }
};
