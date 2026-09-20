const express = require("express");

const {
  createWorkout,
  getWorkouts,
  getWorkout,
  updateWorkout,
  deleteWorkout,
} = require("../controllers/workoutController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", createWorkout);
router.get("/", getWorkouts);
router.get("/:id", getWorkout);
router.put("/:id", updateWorkout);
router.delete("/:id", deleteWorkout);

module.exports = router;