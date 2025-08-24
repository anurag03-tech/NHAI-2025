const express = require("express");
const router = express.Router();
const {
  addComplaint,
  getComplaints,
  getComplaintsByUsername,
  getComplaintsByModerator,
  getMyComplaints, // 🆕 New
  updateComplaintStatus, // 🆕 New
  getComplaintById, // 🆕 New
} = require("../controllers/complaintController");
const { protect, authorize } = require("../middlewares/auth");

// Public: travellers can submit complaints
router.post("/", addComplaint);

// Admin/Moderator: view all complaints
router.get("/", protect, authorize("Admin"), getComplaints);

// 🆕 Moderator: get complaints for their own toilets
router.get("/my", protect, authorize("Moderator"), getMyComplaints);

// 🆕 Moderator/Admin: get single complaint by ID
router.get("/:id", protect, authorize("Admin", "Moderator"), getComplaintById);

// 🆕 Moderator/Admin: update complaint status
router.patch(
  "/:id/status",
  protect,
  authorize("Admin", "Moderator"),
  updateComplaintStatus
);

// Public: get complaints by username
router.get("/user/:username", getComplaintsByUsername);

// Admin/Moderator: get complaints for toilets by moderator
router.get(
  "/moderator/:moderatorId",
  protect,
  authorize("Admin", "Moderator"),
  getComplaintsByModerator
);

module.exports = router;
