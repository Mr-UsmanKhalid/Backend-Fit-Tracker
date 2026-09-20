const express = require("express");

const {
  createNutrition,
  getNutrition,
  getNutritionEntry,
  updateNutrition,
  deleteNutrition,
  getDailySummary,
} = require("../controllers/nutritionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All nutrition routes require authentication
router.use(protect);

// Create meal
router.post("/", createNutrition);

// Get nutrition entries
router.get("/", getNutrition);

// Get daily summary
router.get("/summary/daily", getDailySummary);

// Get single entry
router.get("/:id", getNutritionEntry);

// Update entry
router.put("/:id", updateNutrition);

// Delete entry
router.delete("/:id", deleteNutrition);

module.exports = router;