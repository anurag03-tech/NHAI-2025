const express = require("express");
const router = express.Router();
const {
  addComplaint,
  getComplaints,
  getComplaintsByUsername,
  getComplaintsByOperator,
  getMyComplaints, // 🆕 New
  updateComplaintStatus, // 🆕 New
  getComplaintById, // 🆕 New
} = require("../controllers/complaintController");
const { protect, authorize } = require("../middlewares/auth");

// Public: travellers can submit complaints
router.post("/", addComplaint);

// Admin/Operator: view all complaints
router.get("/", protect, authorize("Admin"), getComplaints);

// 🆕 Operator: get complaints for their own toilets
router.get("/my", protect, authorize("Operator"), getMyComplaints);

// 🆕 Operator/Admin: get single complaint by ID
router.get("/:id", protect, authorize("Admin", "Operator"), getComplaintById);

// 🆕 Operator/Admin: update complaint status
router.patch(
  "/:id/status",
  protect,
  authorize("Admin", "Operator"),
  updateComplaintStatus
);

// Public: get complaints by username
router.get("/user/:username", getComplaintsByUsername);

// Admin/Operator: get complaints for toilets by operator
router.get(
  "/operator/:operatorId",
  protect,
  authorize("Admin", "Operator"),
  getComplaintsByOperator
);

module.exports = router;
