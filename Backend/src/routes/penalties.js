const express = require("express");
const router = express.Router();
const {
  issuePenalty,
  payPenalty,
  getAllPenalties,
  getMyPenalties,
  getPenaltiesByModerator,
} = require("../controllers/penaltyController");
const { protect, authorize } = require("../middlewares/auth");

// Admin: issue penalty
router.post("/", protect, authorize("Admin"), issuePenalty);

// Moderator: pay penalty
router.put("/:id/pay", protect, authorize("Moderator"), payPenalty);

// Admin: get all penalties
router.get("/", protect, authorize("Admin"), getAllPenalties);

// Moderator: get own penalties
router.get("/my", protect, authorize("Moderator"), getMyPenalties);

// Admin: get penalties of specific moderator
router.get(
  "/moderator/:moderatorId",
  protect,
  authorize("Admin"),
  getPenaltiesByModerator
);

module.exports = router;
