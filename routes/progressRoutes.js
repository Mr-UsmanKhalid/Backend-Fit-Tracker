const express = require("express");

const {
  createProgress,
  getProgress,
  getProgressEntry,
  updateProgress,
  deleteProgress,
  getGoal,
  setGoal,
  deleteGoal,
} = require("../controllers/progressController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All progress routes require login
router.use(protect);

// Weight goal
// These MUST stay above "/:id" - otherwise Express treats "goal" as an entry id.
router.get("/goal", getGoal);
router.put("/goal", setGoal);
router.delete("/goal", deleteGoal);

// Create progress
router.post("/", createProgress);

// Get all progress
router.get("/", getProgress);

// Get single progress entry
router.get("/:id", getProgressEntry);

// Update progress
router.put("/:id", updateProgress);

// Delete progress
router.delete("/:id", deleteProgress);

module.exports = router;