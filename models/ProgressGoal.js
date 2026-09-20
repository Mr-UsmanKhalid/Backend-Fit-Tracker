const mongoose = require("mongoose");

// One weight goal per user. The goal keeps the unit it was entered in
// (same approach as Progress entries); the frontend converts for display.
const progressGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    goalWeight: {
      type: Number,
      required: true,
      min: [0.1, "Goal weight must be greater than 0"],
    },
    weightUnit: {
      type: String,
      enum: ["kg", "lbs"],
      default: "kg",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProgressGoal", progressGoalSchema);