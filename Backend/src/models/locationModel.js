const mongoose = require("mongoose");

const ToiletSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    highway: { type: String, required: true },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String },
    },
    type: {
      type: [String], // Array of strings
      enum: ["Gents", "Ladies", "Unisex"],
      default: ["Unisex"],
      validate: {
        validator: function (v) {
          return v && v.length > 0; // Ensure at least one type is selected
        },
        message: "At least one toilet type must be specified",
      },
    },
    accessible: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["Open", "Closed", "Under Maintenance"],
      default: "Open",
    },
    images: [
      {
        data: String, // base64 string
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Operator/Admin who added toilet
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Toilet", ToiletSchema);
