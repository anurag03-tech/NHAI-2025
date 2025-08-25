const Penalty = require("../models/penaltyModel");

// @desc    Admin issues a penalty to a operator
// @route   POST /api/penalties
// @access  Admin
exports.issuePenalty = async (req, res) => {
  try {
    const penalty = await Penalty.create({
      ...req.body,
      issuedBy: req.user._id,
    });
    res.status(201).json(penalty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Operator pays a penalty
// @route   PUT /api/penalties/:id/pay
// @access  Operator
exports.payPenalty = async (req, res) => {
  try {
    const penalty = await Penalty.findById(req.params.id);
    if (!penalty) return res.status(404).json({ message: "Penalty not found" });

    // Ensure operator is the one paying their own penalty
    if (penalty.operator.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to pay this penalty" });
    }

    penalty.status = "Paid";
    penalty.paidAt = new Date();
    await penalty.save();

    res.json({ message: "Penalty marked as paid", penalty });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all penalties (Admin)
// @route   GET /api/penalties
// @access  Admin
exports.getAllPenalties = async (req, res) => {
  try {
    const penalties = await Penalty.find()
      .populate("operator", "name email")
      .populate("issuedBy", "name email");
    res.json(penalties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get penalties for logged-in operator
// @route   GET /api/penalties/my
// @access  Operator
exports.getMyPenalties = async (req, res) => {
  try {
    const penalties = await Penalty.find({ operator: req.user._id }).populate(
      "issuedBy",
      "name email"
    );
    res.json(penalties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Admin fetch penalties for a specific operator
// @route   GET /api/penalties/operator/:operatorId
// @access  Admin
exports.getPenaltiesByOperator = async (req, res) => {
  try {
    const { operatorId } = req.params;
    const penalties = await Penalty.find({ operator: operatorId })
      .populate("operator", "name email")
      .populate("issuedBy", "name email");
    res.json(penalties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
