const express = require("express");
const router = express.Router();
const {
  login,
  createOperator,
  logout,
  getCurrentUser,
  getAllOperators,
} = require("../controllers/authController");
const { protect, authorize } = require("../middlewares/auth");

// Login
router.post("/login", login);

// Profile
router.get("/me", protect, getCurrentUser);

// Logout
router.post("/logout", protect, logout);

// Create Operator (Admin only)
router.post("/create-operator", protect, authorize("Admin"), createOperator);
// Get all operators (Admin only)
router.get("/operators", protect, authorize("Admin"), getAllOperators);

module.exports = router;
