const express = require("express");
const router = express.Router();
const {
  createToilet,
  getMyToilets,
  getAllToiletsWithDetails,
  getToiletById,
} = require("../controllers/locationController");
const { protect, authorize } = require("../middlewares/auth");

router.post("/", protect, authorize("Operator", "Admin"), createToilet);
router.get("/my", protect, authorize("Operator"), getMyToilets);
router.get("/", getAllToiletsWithDetails);
router.get("/:id", getToiletById);

module.exports = router;
