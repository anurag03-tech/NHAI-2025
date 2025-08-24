const express = require("express");
const router = express.Router();
const {
  createToilet,
  getMyToilets,
  getAllToiletsWithDetails,
  getToiletById,
} = require("../controllers/locationController");
const { protect, authorize } = require("../middlewares/auth");

router.post("/", protect, authorize("Moderator", "Admin"), createToilet);
router.get("/my", protect, authorize("Moderator"), getMyToilets);
router.get("/", getAllToiletsWithDetails);
router.get("/:id", getToiletById);

module.exports = router;
