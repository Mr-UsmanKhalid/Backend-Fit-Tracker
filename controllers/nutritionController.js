const Nutrition = require("../models/Nutrition");

// ==========================================
// CREATE NUTRITION / MEAL
// POST /api/nutrition
// ==========================================

const createNutrition = async (req, res) => {
  try {
    const {
      date,
      mealType,
      foods,
      notes,
    } = req.body;

    // Validate foods
    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      return res.status(400).json({
        message: "At least one food item is required",
      });
    }

    const nutrition = await Nutrition.create({
      user: req.user._id,
      date: date || new Date(),
      mealType: mealType || "breakfast",
      foods,
      notes: notes || "",
    });

    res.status(201).json({
      message: "Nutrition entry created successfully",
      nutrition,
    });
  } catch (error) {
    console.error("CREATE NUTRITION ERROR:", error);

    res.status(500).json({
      message: "Failed to create nutrition entry",
      error: error.message,
    });
  }
};


// ==========================================
// GET ALL NUTRITION ENTRIES
// GET /api/nutrition
// ==========================================

const getNutrition = async (req, res) => {
  try {
    const {
      date,
      startDate,
      endDate,
      mealType,
    } = req.query;

    const filter = {
      user: req.user._id,
    };

    // Exact date
    if (date) {
      const selectedDate = new Date(date);

      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);

      filter.date = {
        $gte: selectedDate,
        $lt: nextDate,
      };
    }

    // Date range
    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);

        filter.date.$lt = end;
      }
    }

    // Meal type filter
    if (mealType) {
      filter.mealType = mealType;
    }

    const nutrition = await Nutrition.find(filter).sort({
      date: -1,
      createdAt: -1,
    });

    res.status(200).json({
      message: "Nutrition entries fetched successfully",
      count: nutrition.length,
      nutrition,
    });
  } catch (error) {
    console.error("GET NUTRITION ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch nutrition entries",
      error: error.message,
    });
  }
};


// ==========================================
// GET SINGLE NUTRITION ENTRY
// GET /api/nutrition/:id
// ==========================================

const getNutritionEntry = async (req, res) => {
  try {
    const nutrition = await Nutrition.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!nutrition) {
      return res.status(404).json({
        message: "Nutrition entry not found",
      });
    }

    res.status(200).json({
      message: "Nutrition entry fetched successfully",
      nutrition,
    });
  } catch (error) {
    console.error("GET NUTRITION ENTRY ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch nutrition entry",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE NUTRITION ENTRY
// PUT /api/nutrition/:id
// ==========================================

const updateNutrition = async (req, res) => {
  try {
    const {
      date,
      mealType,
      foods,
      notes,
    } = req.body;

    const nutrition = await Nutrition.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!nutrition) {
      return res.status(404).json({
        message: "Nutrition entry not found",
      });
    }

    // Update date
    if (date !== undefined) {
      nutrition.date = date;
    }

    // Update meal type
    if (mealType !== undefined) {
      nutrition.mealType = mealType;
    }

    // Update foods
    if (foods !== undefined) {
      if (!Array.isArray(foods) || foods.length === 0) {
        return res.status(400).json({
          message: "At least one food item is required",
        });
      }

      nutrition.foods = foods;
    }

    // Update notes
    if (notes !== undefined) {
      nutrition.notes = notes;
    }

    const updatedNutrition = await nutrition.save();

    res.status(200).json({
      message: "Nutrition entry updated successfully",
      nutrition: updatedNutrition,
    });
  } catch (error) {
    console.error("UPDATE NUTRITION ERROR:", error);

    res.status(500).json({
      message: "Failed to update nutrition entry",
      error: error.message,
    });
  }
};


// ==========================================
// DELETE NUTRITION ENTRY
// DELETE /api/nutrition/:id
// ==========================================

const deleteNutrition = async (req, res) => {
  try {
    const nutrition = await Nutrition.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!nutrition) {
      return res.status(404).json({
        message: "Nutrition entry not found",
      });
    }

    await Nutrition.deleteOne({
      _id: req.params.id,
      user: req.user._id,
    });

    res.status(200).json({
      message: "Nutrition entry deleted successfully",
    });
  } catch (error) {
    console.error("DELETE NUTRITION ERROR:", error);

    res.status(500).json({
      message: "Failed to delete nutrition entry",
      error: error.message,
    });
  }
};


// ==========================================
// GET DAILY NUTRITION SUMMARY
// GET /api/nutrition/summary/daily?date=2026-09-13
// ==========================================

const getDailySummary = async (req, res) => {
  try {
    const date = req.query.date
      ? new Date(req.query.date)
      : new Date();

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const nutrition = await Nutrition.find({
      user: req.user._id,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    nutrition.forEach((meal) => {
      meal.foods.forEach((food) => {
        calories += food.calories || 0;
        protein += food.protein || 0;
        carbs += food.carbs || 0;
        fat += food.fat || 0;
      });
    });

    res.status(200).json({
      message: "Daily nutrition summary fetched successfully",
      summary: {
        date: startDate,
        calories,
        protein,
        carbs,
        fat,
        meals: nutrition.length,
      },
    });
  } catch (error) {
    console.error("DAILY SUMMARY ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch daily nutrition summary",
      error: error.message,
    });
  }
};


module.exports = {
  createNutrition,
  getNutrition,
  getNutritionEntry,
  updateNutrition,
  deleteNutrition,
  getDailySummary,
};