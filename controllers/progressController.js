const Progress = require("../models/Progress");
const ProgressGoal = require("../models/ProgressGoal");

// Create Progress
const createProgress = async (req, res) => {
  try {
    const {
      date,
      weight,
      weightUnit,
      measurementUnit,
      measurements,
      performance,
      notes,
    } = req.body;

    const progress = await Progress.create({
      user: req.user._id,
      date: date || Date.now(),
      weight,
      weightUnit: weightUnit || "kg",
      measurementUnit: measurementUnit || "cm",
      measurements: measurements || {},
      performance: performance || {},
      notes: notes || "",
    });

    res.status(201).json({
      message: "Progress recorded successfully",
      progress,
    });
  } catch (error) {
    console.error("CREATE PROGRESS ERROR:", error);

    res.status(500).json({
      message: "Failed to record progress",
      error: error.message,
    });
  }
};

// Get All Progress
const getProgress = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {
      user: req.user._id,
    };

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        filter.date.$lte = end;
      }
    }

    const progress = await Progress.find(filter).sort({
      date: 1,
    });

    res.status(200).json({
      message: "Progress fetched successfully",
      count: progress.length,
      progress,
    });
  } catch (error) {
    console.error("GET PROGRESS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch progress",
      error: error.message,
    });
  }
};

// Get Single Progress
const getProgressEntry = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!progress) {
      return res.status(404).json({
        message: "Progress entry not found",
      });
    }

    res.status(200).json({
      message: "Progress entry fetched successfully",
      progress,
    });
  } catch (error) {
    console.error("GET PROGRESS ENTRY ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch progress entry",
      error: error.message,
    });
  }
};

// Update Progress
const updateProgress = async (req, res) => {
  try {
    const {
      date,
      weight,
      weightUnit,
      measurementUnit,
      measurements,
      performance,
      notes,
    } = req.body;

    const progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!progress) {
      return res.status(404).json({
        message: "Progress entry not found",
      });
    }

    if (date !== undefined) {
      progress.date = date;
    }

    if (weight !== undefined) {
      progress.weight = weight;
    }

    if (weightUnit !== undefined) {
      progress.weightUnit = weightUnit;
    }

    if (measurementUnit !== undefined) {
      progress.measurementUnit = measurementUnit;
    }

    if (measurements !== undefined) {
      progress.measurements = measurements;
    }

    if (performance !== undefined) {
      progress.performance = performance;
    }

    if (notes !== undefined) {
      progress.notes = notes;
    }

    const updatedProgress = await progress.save();

    res.status(200).json({
      message: "Progress updated successfully",
      progress: updatedProgress,
    });
  } catch (error) {
    console.error("UPDATE PROGRESS ERROR:", error);

    res.status(500).json({
      message: "Failed to update progress",
      error: error.message,
    });
  }
};

// Delete Progress
const deleteProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!progress) {
      return res.status(404).json({
        message: "Progress entry not found",
      });
    }

    await Progress.deleteOne({
      _id: req.params.id,
      user: req.user._id,
    });

    res.status(200).json({
      message: "Progress deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PROGRESS ERROR:", error);

    res.status(500).json({
      message: "Failed to delete progress",
      error: error.message,
    });
  }
};

// ==============================
// Weight goal (one per user)
// ==============================

// Get weight goal (goal is null if the user hasn't set one)
const getGoal = async (req, res) => {
  try {
    const goal = await ProgressGoal.findOne({ user: req.user._id });

    res.status(200).json({
      message: "Goal fetched successfully",
      goal: goal || null,
    });
  } catch (error) {
    console.error("GET GOAL ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch goal",
      error: error.message,
    });
  }
};

// Set weight goal (creates it, or updates the existing one)
const setGoal = async (req, res) => {
  try {
    const { goalWeight, weightUnit } = req.body;

    const amount = Number(goalWeight);
    if (
      goalWeight === undefined ||
      goalWeight === null ||
      goalWeight === "" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        message: "Goal weight must be a number greater than 0",
      });
    }

    let unit = "kg";
    if (weightUnit !== undefined) {
      if (weightUnit === "kg") {
        unit = "kg";
      } else if (weightUnit === "lb" || weightUnit === "lbs") {
        unit = "lbs";
      } else {
        return res.status(400).json({
          message: "Weight unit must be kg or lbs",
        });
      }
    }

    const goal = await ProgressGoal.findOneAndUpdate(
      { user: req.user._id },
      { goalWeight: amount, weightUnit: unit },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: "Goal saved successfully",
      goal,
    });
  } catch (error) {
    console.error("SET GOAL ERROR:", error);

    res.status(500).json({
      message: "Failed to save goal",
      error: error.message,
    });
  }
};

// Remove weight goal
const deleteGoal = async (req, res) => {
  try {
    await ProgressGoal.deleteOne({ user: req.user._id });

    res.status(200).json({
      message: "Goal removed successfully",
    });
  } catch (error) {
    console.error("DELETE GOAL ERROR:", error);

    res.status(500).json({
      message: "Failed to remove goal",
      error: error.message,
    });
  }
};

module.exports = {
  createProgress,
  getProgress,
  getProgressEntry,
  updateProgress,
  deleteProgress,
  getGoal,
  setGoal,
  deleteGoal,
};