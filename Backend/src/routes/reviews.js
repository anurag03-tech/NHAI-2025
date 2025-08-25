const express = require("express");
const router = express.Router();
const {
  addReview,
  getReviews,
  getMyReviews,
} = require("../controllers/reviewController");
const { protect, authorize } = require("../middlewares/auth");

// Public can add review
router.post("/", addReview);

// Admin: get all reviews
router.get("/", protect, authorize("Admin"), getReviews);

// Operator: get reviews on their toilets
router.get("/my", protect, authorize("Operator"), getMyReviews);

module.exports = router;
