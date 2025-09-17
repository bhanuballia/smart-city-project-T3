import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  age: {
    type: Number,
    required: [true, "Age is required"],
    min: [1, "Age must be at least 1"],
    max: [120, "Age cannot exceed 120"]
  },
  contact: {
    type: String,
    required: [true, "Contact number is required"],
    trim: true,
    match: [/^[0-9]{10}$/, "Please enter a valid 10-digit contact number"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },

  // Address Information
  houseNo: {
    type: String,
    required: [true, "House number is required"],
    trim: true,
    maxlength: [20, "House number cannot exceed 20 characters"]
  },
  street: {
    type: String,
    required: [true, "Street is required"],
    trim: true,
    maxlength: [100, "Street name cannot exceed 100 characters"]
  },
  cityRegion: {
    type: String,
    required: [true, "City region is required"],
    enum: ["Gomti Nagar", "Haazaratganj", "Kaiserbagh"],
    default: "Gomti Nagar"
  },

  // Problem Information
  problemRelated: {
    type: String,
    required: [true, "Problem category is required"],
    enum: ["Water", "Electricity", "Waste", "Other"],
    default: "Water"
  },
  otherProblem: {
    type: String,
    trim: true,
    maxlength: [200, "Other problem description cannot exceed 200 characters"]
  },
  explanation: {
    type: String,
    required: [true, "Problem explanation is required"],
    trim: true,
    maxlength: [1000, "Explanation cannot exceed 1000 characters"]
  },

  // System Fields
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved", "Closed"],
    default: "Pending"
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium"
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  resolution: {
    type: String,
    trim: true,
    maxlength: [500, "Resolution cannot exceed 500 characters"]
  },
  resolvedAt: {
    type: Date,
    default: null
  },

  // Tracking
  complaintNumber: {
    type: String,
    unique: true,
    default: function() {
      return `COMP-${Date.now()}`;
    }
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null // null for anonymous complaints
  }
}, {
  timestamps: true
});

// Generate unique complaint number before saving
complaintSchema.pre('save', async function(next) {
  if (this.isNew && !this.complaintNumber) {
    try {
      // Simple timestamp-based approach for now
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      this.complaintNumber = `COMP-${timestamp}-${random}`;
    } catch (error) {
      console.error('Error generating complaint number:', error);
      // Fallback to simple timestamp
      this.complaintNumber = `COMP-${Date.now()}`;
    }
  }
  next();
});

// Index for better query performance
complaintSchema.index({ complaintNumber: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ cityRegion: 1 });
complaintSchema.index({ problemRelated: 1 });
complaintSchema.index({ createdAt: -1 });

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
