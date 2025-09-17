import Complaint from "../models/Complaint.js";
import Alert from "../models/Alert.js";

// Create new complaint
export const createComplaint = async (req, res) => {
  try {
    const {
      name,
      age,
      contact,
      email,
      houseNo,
      street,
      cityRegion,
      problemRelated,
      otherProblem,
      explanation
    } = req.body;

    // Validate required fields
    if (!name || !age || !contact || !email || !houseNo || !street || !explanation) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["name", "age", "contact", "email", "houseNo", "street", "explanation"]
      });
    }

    // Validate otherProblem if problemRelated is "Other"
    if (problemRelated === "Other" && !otherProblem) {
      return res.status(400).json({
        error: "Please specify the problem when selecting 'Other'"
      });
    }

    // Create complaint
    const complaint = new Complaint({
      name,
      age,
      contact,
      email,
      houseNo,
      street,
      cityRegion,
      problemRelated,
      otherProblem: problemRelated === "Other" ? otherProblem : undefined,
      explanation,
      submittedBy: req.user?.id || null // null for anonymous complaints
    });

    await complaint.save();

    // Determine priority based on problem type
    let priority = "Medium";
    if (problemRelated === "Electricity") priority = "High";
    if (problemRelated === "Water" && explanation.toLowerCase().includes("emergency")) priority = "High";

    complaint.priority = priority;
    await complaint.save();

    // Create alert for admin/operators
    const alert = new Alert({
      type: "Complaint",
      message: `📝 New complaint #${complaint.complaintNumber}: ${problemRelated} issue in ${cityRegion}`,
      severity: priority,
      metadata: {
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        problemType: problemRelated,
        location: cityRegion
      },
      createdBy: null // System generated
    });

    await alert.save();

    // Emit real-time updates
    if (req.io) {
      req.io.emit("complaint:new", complaint);
      req.io.emit("alert:new", alert);
    }

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint: {
        id: complaint._id,
        complaintNumber: complaint.complaintNumber,
        status: complaint.status,
        priority: complaint.priority
      }
    });

  } catch (error) {
    console.error("Error creating complaint:", error);
    console.error("Error stack:", error.stack);
    
    // More specific error handling
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: "Validation Error",
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(400).json({
        error: "Duplicate complaint number",
        details: "Please try again"
      });
    }
    
    res.status(500).json({
      error: "Failed to submit complaint",
      details: error.message
    });
  }
};

// Get all complaints (admin/operator only)
export const getAllComplaints = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      cityRegion,
      problemRelated,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (cityRegion) filter.cityRegion = cityRegion;
    if (problemRelated) filter.problemRelated = problemRelated;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const complaints = await Complaint.find(filter)
      .populate("submittedBy", "name email")
      .populate("assignedTo", "name email")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v");

    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      data: complaints,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({
      error: "Failed to fetch complaints",
      details: error.message
    });
  }
};

// Get complaint by ID
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id)
      .populate("submittedBy", "name email")
      .populate("assignedTo", "name email")
      .select("-__v");

    if (!complaint) {
      return res.status(404).json({
        error: "Complaint not found"
      });
    }

    res.json({
      success: true,
      data: complaint
    });

  } catch (error) {
    console.error("Error fetching complaint:", error);
    res.status(500).json({
      error: "Failed to fetch complaint",
      details: error.message
    });
  }
};

// Get complaint by complaint number
export const getComplaintByNumber = async (req, res) => {
  try {
    const { complaintNumber } = req.params;

    const complaint = await Complaint.findOne({ complaintNumber })
      .populate("submittedBy", "name email")
      .populate("assignedTo", "name email")
      .select("-__v");

    if (!complaint) {
      return res.status(404).json({
        error: "Complaint not found"
      });
    }

    res.json({
      success: true,
      data: complaint
    });

  } catch (error) {
    console.error("Error fetching complaint:", error);
    res.status(500).json({
      error: "Failed to fetch complaint",
      details: error.message
    });
  }
};

// Update complaint status (admin/operator only)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution, assignedTo } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        error: "Complaint not found"
      });
    }

    // Update fields
    if (status) complaint.status = status;
    if (resolution) complaint.resolution = resolution;
    if (assignedTo) complaint.assignedTo = assignedTo;

    // Set resolvedAt if status is resolved
    if (status === "Resolved" && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    // Create alert for status change
    const alert = new Alert({
      type: "Complaint Update",
      message: `📋 Complaint #${complaint.complaintNumber} status updated to: ${status}`,
      severity: "Medium",
      metadata: {
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        newStatus: status
      },
      createdBy: req.user?.id
    });

    await alert.save();

    // Emit real-time updates
    if (req.io) {
      req.io.emit("complaint:updated", complaint);
      req.io.emit("alert:new", alert);
    }

    res.json({
      success: true,
      message: "Complaint updated successfully",
      data: complaint
    });

  } catch (error) {
    console.error("Error updating complaint:", error);
    res.status(500).json({
      error: "Failed to update complaint",
      details: error.message
    });
  }
};

// Get complaint statistics
export const getComplaintStats = async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
          },
          closed: {
            $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] }
          }
        }
      }
    ]);

    const problemStats = await Complaint.aggregate([
      {
        $group: {
          _id: "$problemRelated",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const regionStats = await Complaint.aggregate([
      {
        $group: {
          _id: "$cityRegion",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          pending: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0
        },
        byProblem: problemStats,
        byRegion: regionStats
      }
    });

  } catch (error) {
    console.error("Error fetching complaint stats:", error);
    res.status(500).json({
      error: "Failed to fetch complaint statistics",
      details: error.message
    });
  }
};

// Delete complaint (admin only)
export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndDelete(id);
    if (!complaint) {
      return res.status(404).json({
        error: "Complaint not found"
      });
    }

    res.json({
      success: true,
      message: "Complaint deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting complaint:", error);
    res.status(500).json({
      error: "Failed to delete complaint",
      details: error.message
    });
  }
};
