const express = require("express");

const {
  getWorkoutReport,
  getNutritionReport,
  getProgressReport,
  getCompleteReport,
} = require("../controllers/reportController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/workouts", getWorkoutReport);

router.get("/nutrition", getNutritionReport);

router.get("/progress", getProgressReport);

router.get("/complete", getCompleteReport);

module.exports = router;