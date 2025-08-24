const express = require("express");
const router = express.Router();
const {
  login,
  createModerator,
  logout,
  getCurrentUser,
  getAllModerators,
} = require("../controllers/authController");
const { protect, authorize } = require("../middlewares/auth");

// Login
router.post("/login", login);

// Profile
router.get("/me", protect, getCurrentUser);

// Logout
router.post("/logout", protect, logout);

// Create Moderator (Admin only)
router.post("/create-moderator", protect, authorize("Admin"), createModerator);
// Get all moderators (Admin only)
router.get("/moderators", protect, authorize("Admin"), getAllModerators);

module.exports = router;
