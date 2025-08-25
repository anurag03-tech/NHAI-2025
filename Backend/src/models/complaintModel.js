const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
  {
    toilet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Toilet",
      required: true,
    },
    username: {
      type: String, // traveller/public username
      required: true,
      maxlength: 50,
    },
    mobile: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, "Please provide a valid Indian mobile number"],
    },
    description: { type: String, required: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    response: { type: String }, // Admin/Operator response
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
