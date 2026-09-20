const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema(
  {
    chest: {
      type: Number,
      min: 0,
      default: null,
    },
    waist: {
      type: Number,
      min: 0,
      default: null,
    },
    hips: {
      type: Number,
      min: 0,
      default: null,
    },
    arms: {
      type: Number,
      min: 0,
      default: null,
    },
    thighs: {
      type: Number,
      min: 0,
      default: null,
    },
    neck: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  { _id: false }
);

const performanceSchema = new mongoose.Schema(
  {
    runningTime: {
      type: Number,
      min: 0,
      default: null,
    },
    runningDistance: {
      type: Number,
      min: 0,
      default: null,
    },
    benchPress: {
      type: Number,
      min: 0,
      default: null,
    },
    squat: {
      type: Number,
      min: 0,
      default: null,
    },
    deadlift: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
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

    weight: {
      type: Number,
      min: 0,
      default: null,
    },

    weightUnit: {
      type: String,
      enum: ["kg", "lbs"],
      default: "kg",
    },

    measurementUnit: {
      type: String,
      enum: ["cm", "in"],
      default: "cm",
    },

    measurements: {
      type: measurementSchema,
      default: () => ({}),
    },

    performance: {
      type: performanceSchema,
      default: () => ({}),
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

module.exports = mongoose.model("Progress", progressSchema);