const Complaint = require("../models/complaintModel");
const Toilet = require("../models/locationModel");

// @desc    Add a complaint
// @route   POST /api/complaints
// @access  Public (traveller)
exports.addComplaint = async (req, res) => {
  try {
    const { toilet, username, mobile, description } = req.body;

    // 🔍 Check if toilet exists
    const toiletExists = await Toilet.findById(toilet);
    if (!toiletExists) {
      return res.status(404).json({ message: "Toilet not found" });
    }

    const complaint = await Complaint.create({
      toilet,
      username,
      mobile,
      description,
    });

    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all complaints (Admin/Moderator)
// @route   GET /api/complaints
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate("toilet");
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get complaints by username (public check)
// @route   GET /api/complaints/user/:username
exports.getComplaintsByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const complaints = await Complaint.find({ username }).populate("toilet");
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get complaints by Moderator (all toilets they created)
// @route   GET /api/complaints/moderator/:moderatorId
// @access  Admin/Moderator
exports.getComplaintsByModerator = async (req, res) => {
  try {
    const { moderatorId } = req.params;

    // Find toilets created by this moderator
    const toilets = await Toilet.find({ createdBy: moderatorId }).select("_id");

    if (!toilets.length) {
      return res
        .status(404)
        .json({ message: "No toilets found for this moderator" });
    }

    // Get complaints linked to those toilets
    const complaints = await Complaint.find({
      toilet: { $in: toilets.map((t) => t._id) },
    }).populate("toilet");

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🆕 @desc    Get complaints for current moderator's toilets
// @route   GET /api/complaints/my
// @access  Moderator
exports.getMyComplaints = async (req, res) => {
  try {
    const moderatorId = req.user._id;

    // Find toilets created by this moderator
    const toilets = await Toilet.find({ createdBy: moderatorId }).select("_id");

    if (!toilets.length) {
      return res.json([]); // Return empty array instead of error
    }

    // Get complaints linked to those toilets
    const complaints = await Complaint.find({
      toilet: { $in: toilets.map((t) => t._id) },
    })
      .populate("toilet")
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🆕 @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
// @access  Moderator/Admin
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Find the complaint
    const complaint = await Complaint.findById(id).populate("toilet");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Check if moderator owns the toilet (only for moderators)
    if (userRole === "Moderator") {
      if (complaint.toilet.createdBy.toString() !== userId.toString()) {
        return res.status(403).json({
          message: "You can only update complaints for your own toilets",
        });
      }
    }

    // Validate status
    const validStatuses = ["Pending", "In Progress", "Resolved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    // Update complaint
    complaint.status = status;
    if (response) {
      complaint.response = response;
    }

    await complaint.save();

    // Return updated complaint with populated toilet
    const updatedComplaint = await Complaint.findById(id).populate("toilet");

    res.json({
      message: "Complaint status updated successfully",
      complaint: updatedComplaint,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🆕 @desc    Get single complaint details
// @route   GET /api/complaints/:id
// @access  Moderator/Admin
exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const complaint = await Complaint.findById(id).populate("toilet");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Check if moderator owns the toilet (only for moderators)
    if (userRole === "Moderator") {
      if (complaint.toilet.createdBy.toString() !== userId.toString()) {
        return res.status(403).json({
          message: "You can only view complaints for your own toilets",
        });
      }
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
