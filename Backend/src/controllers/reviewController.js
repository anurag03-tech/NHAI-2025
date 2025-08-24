const Review = require("../models/reviewModel");
const Toilet = require("../models/locationModel");

// @desc    Add review (public user, no login required)
// @route   POST /api/reviews
exports.addReview = async (req, res) => {
  try {
    const { toilet, username, rating, comment, photos } = req.body;

    // check toilet exists
    const toiletExists = await Toilet.findById(toilet);
    if (!toiletExists) {
      return res.status(404).json({ message: "Toilet not found" });
    }

    const review = await Review.create({
      toilet,
      username,
      rating,
      comment,
      photos,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all reviews (Admin only)
// @route   GET /api/reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate(
      "toilet",
      "name highway location createdBy"
    );
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get reviews by moderator’s toilets
// @route   GET /api/reviews/my
// @access  Moderator
exports.getMyReviews = async (req, res) => {
  try {
    // find toilets created by this moderator
    const myToilets = await Toilet.find({ createdBy: req.user._id }).select(
      "_id"
    );

    const reviews = await Review.find({ toilet: { $in: myToilets } }).populate(
      "toilet",
      "name highway location"
    );

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
