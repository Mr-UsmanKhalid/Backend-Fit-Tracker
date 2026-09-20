const Workout = require("../models/Workout");
const Nutrition = require("../models/Nutrition");
const Progress = require("../models/Progress");


// Helper
const getDateRange = (startDate, endDate) => {
  const start = startDate
    ? new Date(startDate)
    : new Date(new Date().setDate(new Date().getDate() - 30));

  const end = endDate
    ? new Date(endDate)
    : new Date();

  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
};


// WORKOUT REPORT
const getWorkoutReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const { start, end } = getDateRange(
      startDate,
      endDate
    );

    const workouts = await Workout.find({
      user: req.user._id,
      createdAt: {
        $gte: start,
        $lte: end,
      },
    }).sort({
      createdAt: 1,
    });

    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;
    let totalCaloriesBurned = 0;

    const exerciseHistory = {};

    workouts.forEach((workout) => {
      totalCaloriesBurned += Number(workout.caloriesBurned || 0);

      workout.exercises.forEach((exercise) => {
        const sets = Number(exercise.sets || 0);
        const reps = Number(exercise.reps || 0);
        const weight = Number(exercise.weight || 0);

        totalSets += sets;
        totalReps += sets * reps;
        totalVolume += sets * reps * weight;

        if (!exerciseHistory[exercise.name]) {
          exerciseHistory[exercise.name] = {
            name: exercise.name,
            workouts: 0,
            totalSets: 0,
            totalReps: 0,
            maxWeight: 0,
          };
        }

        exerciseHistory[exercise.name].workouts += 1;
        exerciseHistory[exercise.name].totalSets += sets;
        exerciseHistory[exercise.name].totalReps += sets * reps;

        exerciseHistory[exercise.name].maxWeight =
          Math.max(
            exerciseHistory[exercise.name].maxWeight,
            weight
          );
      });
    });

    const categories = {};

    workouts.forEach((workout) => {
      categories[workout.category] =
        (categories[workout.category] || 0) + 1;
    });

    res.status(200).json({
      message: "Workout report generated successfully",

      report: {
        type: "workout",

        period: {
          startDate: start,
          endDate: end,
        },

        summary: {
          totalWorkouts: workouts.length,
          totalSets,
          totalReps,
          totalVolume,
          totalCaloriesBurned,
        },

        categories,

        exerciseHistory: Object.values(
          exerciseHistory
        ),

        workouts,
      },
    });
  } catch (error) {
    console.error("WORKOUT REPORT ERROR:", error);

    res.status(500).json({
      message: "Failed to generate workout report",
      error: error.message,
    });
  }
};


// NUTRITION REPORT
const getNutritionReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const { start, end } = getDateRange(
      startDate,
      endDate
    );

    const meals = await Nutrition.find({
      user: req.user._id,
      date: {
        $gte: start,
        $lte: end,
      },
    }).sort({
      date: 1,
    });

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const dailyData = {};

    meals.forEach((meal) => {
      const dateKey = new Date(meal.date)
        .toISOString()
        .split("T")[0];

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        };
      }

      meal.foods.forEach((food) => {
        const calories = Number(food.calories || 0);
        const protein = Number(food.protein || 0);
        const carbs = Number(food.carbs || 0);
        const fat = Number(food.fat || 0);

        totalCalories += calories;
        totalProtein += protein;
        totalCarbs += carbs;
        totalFat += fat;

        dailyData[dateKey].calories += calories;
        dailyData[dateKey].protein += protein;
        dailyData[dateKey].carbs += carbs;
        dailyData[dateKey].fat += fat;
      });
    });

    res.status(200).json({
      message: "Nutrition report generated successfully",

      report: {
        type: "nutrition",

        period: {
          startDate: start,
          endDate: end,
        },

        summary: {
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat,
          totalMeals: meals.length,
        },

        dailyData: Object.values(dailyData),

        meals,
      },
    });
  } catch (error) {
    console.error("NUTRITION REPORT ERROR:", error);

    res.status(500).json({
      message: "Failed to generate nutrition report",
      error: error.message,
    });
  }
};


// PROGRESS REPORT
// Replaces the old, broken "goal" report — this app tracks Workouts,
// Nutrition, and Progress (no Goal model exists), so reporting on
// Progress is the real third pillar.
const getProgressReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const { start, end } = getDateRange(
      startDate,
      endDate
    );

    const entries = await Progress.find({
      user: req.user._id,
      date: {
        $gte: start,
        $lte: end,
      },
    }).sort({
      date: 1,
    });

    const first = entries[0] || null;
    const latest = entries[entries.length - 1] || null;

    const weightChange =
      first?.weight != null && latest?.weight != null
        ? Number((latest.weight - first.weight).toFixed(1))
        : null;

    // Per-measurement change: last logged value minus first logged value
    // for each key, only counting entries where both exist.
    const measurementChange = {};
    entries.forEach((entry) => {
      Object.entries(entry.measurements || {}).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        if (!measurementChange[key]) {
          measurementChange[key] = { first: value, latest: value };
        } else {
          measurementChange[key].latest = value;
        }
      });
    });

    const measurements = Object.fromEntries(
      Object.entries(measurementChange).map(([key, { first: f, latest: l }]) => [
        key,
        Number((l - f).toFixed(1)),
      ])
    );

    // Personal records: highest logged value per performance field in range
    const personalRecords = {};
    entries.forEach((entry) => {
      Object.entries(entry.performance || {}).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        personalRecords[key] = Math.max(personalRecords[key] || 0, value);
      });
    });

    res.status(200).json({
      message: "Progress report generated successfully",

      report: {
        type: "progress",

        period: {
          startDate: start,
          endDate: end,
        },

        summary: {
          totalCheckIns: entries.length,
          startingWeight: first?.weight ?? null,
          currentWeight: latest?.weight ?? null,
          weightChange,
          weightUnit: latest?.weightUnit || first?.weightUnit || "kg",
          measurementChange: measurements,
          personalRecords,
        },

        entries,
      },
    });
  } catch (error) {
    console.error("PROGRESS REPORT ERROR:", error);

    res.status(500).json({
      message: "Failed to generate progress report",
      error: error.message,
    });
  }
};


// COMPLETE REPORT
const getCompleteReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const { start, end } = getDateRange(
      startDate,
      endDate
    );

    const [
      workouts,
      meals,
      progressEntries,
    ] = await Promise.all([
      Workout.find({
        user: req.user._id,
        createdAt: {
          $gte: start,
          $lte: end,
        },
      }).sort({ createdAt: 1 }),

      Nutrition.find({
        user: req.user._id,
        date: {
          $gte: start,
          $lte: end,
        },
      }).sort({ date: 1 }),

      Progress.find({
        user: req.user._id,
        date: {
          $gte: start,
          $lte: end,
        },
      }).sort({ date: 1 }),
    ]);

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    meals.forEach((meal) => {
      meal.foods.forEach((food) => {
        calories += Number(food.calories || 0);
        protein += Number(food.protein || 0);
        carbs += Number(food.carbs || 0);
        fat += Number(food.fat || 0);
      });
    });

    const firstProgress = progressEntries[0] || null;
    const latestProgress = progressEntries[progressEntries.length - 1] || null;
    const weightChange =
      firstProgress?.weight != null && latestProgress?.weight != null
        ? Number((latestProgress.weight - firstProgress.weight).toFixed(1))
        : null;

    res.status(200).json({
      message: "Complete report generated successfully",

      report: {
        type: "complete",

        period: {
          startDate: start,
          endDate: end,
        },

        workouts: {
          total: workouts.length,
          caloriesBurned: workouts.reduce(
            (sum, w) => sum + Number(w.caloriesBurned || 0),
            0
          ),
          data: workouts,
        },

        nutrition: {
          totalMeals: meals.length,
          calories,
          protein,
          carbs,
          fat,
          data: meals,
        },

        progress: {
          totalCheckIns: progressEntries.length,
          startingWeight: firstProgress?.weight ?? null,
          currentWeight: latestProgress?.weight ?? null,
          weightChange,
          data: progressEntries,
        },
      },
    });
  } catch (error) {
    console.error("COMPLETE REPORT ERROR:", error);

    res.status(500).json({
      message: "Failed to generate complete report",
      error: error.message,
    });
  }
};


module.exports = {
  getWorkoutReport,
  getNutritionReport,
  getProgressReport,
  getCompleteReport,
};