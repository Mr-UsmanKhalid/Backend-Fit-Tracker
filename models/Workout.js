const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    sets: {
      type: Number,
      required: true,
      min: 1,
    },

    reps: {
      type: Number,
      required: true,
      min: 1,
    },

    weight: {
      type: Number,
      min: 0,
      default: 0,
    },

    weightUnit: {
      type: String,
      enum: ["kg", "lbs"],
      default: "kg",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "strength",
        "cardio",
        "hypertrophy",
        "powerlifting",
        "calisthenics",
        "mobility",
        "flexibility",
        "other",
      ],
      default: "strength",
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    exercises: [exerciseSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Workout", workoutSchema);