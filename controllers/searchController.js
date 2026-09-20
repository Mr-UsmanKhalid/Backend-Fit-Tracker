const Workout = require("../models/Workout");
const Nutrition = require("../models/Nutrition");
const User = require("../models/userModel");


const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};


// GLOBAL SEARCH
const search = async (req, res) => {
  try {
    const {
      q = "",
      type = "all",
      category,
      mealType,
      limit = 20,
    } = req.query;

    const searchText = q.trim();

    if (!searchText) {
      return res.status(200).json({
        message: "Search completed",
        results: {
          workouts: [],
          nutrition: [],
          users: [],
        },
        total: 0,
      });
    }

    const regex = new RegExp(
      escapeRegex(searchText),
      "i"
    );

    const maxLimit = Math.min(
      Math.max(Number(limit) || 20, 1),
      50
    );

    const results = {
      workouts: [],
      nutrition: [],
      users: [],
    };


    // SEARCH WORKOUTS
    if (type === "all" || type === "workouts") {
      const workoutFilter = {
        user: req.user._id,

        $or: [
          {
            name: regex,
          },
          {
            category: regex,
          },
          {
            tags: regex,
          },
          {
            "exercises.name": regex,
          },
        ],
      };

      if (category) {
        workoutFilter.category = category;
      }

      results.workouts = await Workout.find(
        workoutFilter
      )
        .sort({ createdAt: -1 })
        .limit(maxLimit);
    }


    // SEARCH NUTRITION
    if (type === "all" || type === "nutrition") {
      const nutritionFilter = {
        user: req.user._id,

        $or: [
          {
            mealType: regex,
          },
          {
            "foods.name": regex,
          },
          {
            notes: regex,
          },
        ],
      };

      if (mealType) {
        nutritionFilter.mealType = mealType;
      }

      results.nutrition = await Nutrition.find(
        nutritionFilter
      )
        .sort({ date: -1 })
        .limit(maxLimit);
    }


    // SEARCH USERS
    if (type === "all" || type === "users") {
      results.users = await User.find({
        $or: [
          {
            username: regex,
          },
          {
            name: regex,
          },
        ],
      })
        .select(
          "_id username name profilePicture"
        )
        .limit(maxLimit);
    }


    const total =
      results.workouts.length +
      results.nutrition.length +
      results.users.length;


    res.status(200).json({
      message: "Search completed successfully",

      query: searchText,

      filters: {
        type,
        category: category || null,
        mealType: mealType || null,
      },

      results,

      total,
    });
  } catch (error) {
    console.error("SEARCH ERROR:", error);

    res.status(500).json({
      message: "Search failed",
      error: error.message,
    });
  }
};


module.exports = {
  search,
};