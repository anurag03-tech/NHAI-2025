const Toilet = require("../models/locationModel");
const Review = require("../models/reviewModel");
const Complaint = require("../models/complaintModel");
const Penalty = require("../models/penaltyModel");

// @desc    Moderator creates a toilet
// @route   POST /api/toilets
// @access  Moderator/Admin
exports.createToilet = async (req, res) => {
  try {
    const toilet = await Toilet.create({
      ...req.body,
      createdBy: req.user._id, // link to moderator/admin
    });

    res.status(201).json({
      message: "Toilet created successfully",
      toilet,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get toilets for logged-in Moderator (with reviews, complaints & penalties)
// @route   GET /api/toilets/my
// @access  Moderator
exports.getMyToilets = async (req, res) => {
  try {
    const toilets = await Toilet.find({ createdBy: req.user._id }).lean();

    const results = await Promise.all(
      toilets.map(async (toilet) => {
        const reviews = await Review.find({ toilet: toilet._id });
        const complaints = await Complaint.find({ toilet: toilet._id });
        const penalties = await Penalty.find({ moderator: req.user._id });

        return {
          ...toilet,
          reviews,
          complaints,
          penalties,
        };
      })
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Admin: Get all toilets with reviews + complaints
// @route   GET /api/toilets
// @access  Admin
exports.getAllToiletsWithDetails = async (req, res) => {
  try {
    const toilets = await Toilet.find()
      .populate("createdBy", "name email role")
      .lean();

    const results = await Promise.all(
      toilets.map(async (toilet) => {
        const reviews = await Review.find({ toilet: toilet._id });
        const complaints = await Complaint.find({ toilet: toilet._id });
        const penalties = await Penalty.find({ moderator: toilet.createdBy });

        return {
          ...toilet,
          reviews,
          complaints,
          penalties,
        };
      })
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single toilet by ID (with reviews, complaints & penalties)
// @route   GET /api/toilets/:id
// @access  Moderator/Admin
exports.getToiletById = async (req, res) => {
  try {
    const toilet = await Toilet.findById(req.params.id)
      .populate("createdBy", "name email role")
      .lean();

    if (!toilet) {
      return res.status(404).json({ message: "Toilet not found" });
    }

    const reviews = await Review.find({ toilet: toilet._id });

    res.json({
      ...toilet,
      reviews,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
