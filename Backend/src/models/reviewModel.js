const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    toilet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Toilet",
      required: true,
    },
    username: {
      type: String,
      required: true,
      maxlength: 50,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 500 },
    photos: [String], // optional base64 images
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);
