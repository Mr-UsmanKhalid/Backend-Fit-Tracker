const mongoose = require("mongoose");

// ==========================================
// FOOD SCHEMA
// ==========================================

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
      default: "serving",
    },

    calories: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    protein: {
      type: Number,
      min: 0,
      default: 0,
    },

    carbs: {
      type: Number,
      min: 0,
      default: 0,
    },

    fat: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    _id: true,
  }
);

// ==========================================
// NUTRITION SCHEMA
// ==========================================

const nutritionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    mealType: {
      type: String,
      required: true,
      enum: [
        "breakfast",
        "lunch",
        "dinner",
        "snack",
      ],
      default: "breakfast",
    },

    foods: {
      type: [foodSchema],
      required: true,
      validate: {
        validator: function (foods) {
          return foods.length > 0;
        },
        message: "At least one food item is required",
      },
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Nutrition", nutritionSchema);