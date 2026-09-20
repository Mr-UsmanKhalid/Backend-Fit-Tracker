const Workout = require("../models/Workout");

// ==========================================
// CREATE WORKOUT
// POST /api/workouts
// ==========================================
const createWorkout = async (req, res) => {
  try {
    const {
      name,
      category,
      tags,
      notes,
      caloriesBurned,
      exercises,
    } = req.body;

    // Validate workout name
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Workout name is required",
      });
    }

    // Validate exercises
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        message: "At least one exercise is required",
      });
    }

    // Validate calories burned, if provided
    if (
      caloriesBurned !== undefined &&
      caloriesBurned !== null &&
      (isNaN(caloriesBurned) || Number(caloriesBurned) < 0)
    ) {
      return res.status(400).json({
        message: "Calories burned must be a non-negative number",
      });
    }

    const workout = await Workout.create({
      user: req.user._id,
      name: name.trim(),
      category: category || "strength",
      tags: Array.isArray(tags) ? tags : [],
      notes: notes || "",
      caloriesBurned:
        caloriesBurned === undefined || caloriesBurned === null
          ? undefined
          : Number(caloriesBurned),
      exercises,
    });

    res.status(201).json({
      message: "Workout created successfully",
      workout,
    });
  } catch (error) {
    console.error("CREATE WORKOUT ERROR:", error);

    res.status(500).json({
      message: "Failed to create workout",
      error: error.message,
    });
  }
};


// ==========================================
// GET ALL WORKOUTS
// GET /api/workouts
// ==========================================
const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Workouts fetched successfully",
      count: workouts.length,
      workouts,
    });
  } catch (error) {
    console.error("GET WORKOUTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch workouts",
      error: error.message,
    });
  }
};


// ==========================================
// GET SINGLE WORKOUT
// GET /api/workouts/:id
// ==========================================
const getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({
        message: "Workout not found",
      });
    }

    res.status(200).json({
      message: "Workout fetched successfully",
      workout,
    });
  } catch (error) {
    console.error("GET WORKOUT ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch workout",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE WORKOUT
// PUT /api/workouts/:id
// ==========================================
const updateWorkout = async (req, res) => {
  try {
    const {
      name,
      category,
      tags,
      notes,
      caloriesBurned,
      exercises,
    } = req.body;

    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({
        message: "Workout not found",
      });
    }

    // Update only fields that were provided
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Workout name cannot be empty",
        });
      }

      workout.name = name.trim();
    }

    if (category !== undefined) {
      workout.category = category;
    }

    if (tags !== undefined) {
      workout.tags = Array.isArray(tags) ? tags : [];
    }

    if (notes !== undefined) {
      workout.notes = notes;
    }

    if (caloriesBurned !== undefined) {
      if (caloriesBurned !== null && (isNaN(caloriesBurned) || Number(caloriesBurned) < 0)) {
        return res.status(400).json({
          message: "Calories burned must be a non-negative number",
        });
      }

      workout.caloriesBurned = caloriesBurned === null ? undefined : Number(caloriesBurned);
    }

    if (exercises !== undefined) {
      if (!Array.isArray(exercises) || exercises.length === 0) {
        return res.status(400).json({
          message: "At least one exercise is required",
        });
      }

      workout.exercises = exercises;
    }

    const updatedWorkout = await workout.save();

    res.status(200).json({
      message: "Workout updated successfully",
      workout: updatedWorkout,
    });
  } catch (error) {
    console.error("UPDATE WORKOUT ERROR:", error);

    res.status(500).json({
      message: "Failed to update workout",
      error: error.message,
    });
  }
};


// ==========================================
// DELETE WORKOUT
// DELETE /api/workouts/:id
// ==========================================
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({
        message: "Workout not found",
      });
    }

    await Workout.deleteOne({
      _id: req.params.id,
      user: req.user._id,
    });

    res.status(200).json({
      message: "Workout deleted successfully",
    });
  } catch (error) {
    console.error("DELETE WORKOUT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete workout",
      error: error.message,
    });
  }
};


module.exports = {
  createWorkout,
  getWorkouts,
  getWorkout,
  updateWorkout,
  deleteWorkout,
};