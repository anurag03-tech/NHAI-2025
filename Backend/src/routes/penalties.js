const express = require("express");
const router = express.Router();
const {
  issuePenalty,
  payPenalty,
  getAllPenalties,
  getMyPenalties,
  getPenaltiesByOperator,
} = require("../controllers/penaltyController");
const { protect, authorize } = require("../middlewares/auth");

// Admin: issue penalty
router.post("/", protect, authorize("Admin"), issuePenalty);

// Operator: pay penalty
router.put("/:id/pay", protect, authorize("Operator"), payPenalty);

// Admin: get all penalties
router.get("/", protect, authorize("Admin"), getAllPenalties);

// Operator: get own penalties
router.get("/my", protect, authorize("Operator"), getMyPenalties);

// Admin: get penalties of specific operator
router.get(
  "/operator/:operatorId",
  protect,
  authorize("Admin"),
  getPenaltiesByOperator
);

module.exports = router;
