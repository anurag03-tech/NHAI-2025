const mongoose = require("mongoose");

const PenaltySchema = new mongoose.Schema(
  {
    moderator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // must be Moderator role
      required: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin who issued penalty
      required: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 500,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid",
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Penalty", PenaltySchema);
