import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, "Message cannot exceed 500 characters"]
  },
  type: {
    type: String,
    enum: ["General", "Emergency", "Maintenance", "Service", "Event"],
    default: "General"
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium"
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, "Location cannot exceed 100 characters"]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null // null means no expiration
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
announcementSchema.index({ isActive: 1, priority: -1, createdAt: -1 });
announcementSchema.index({ expiresAt: 1 });

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
