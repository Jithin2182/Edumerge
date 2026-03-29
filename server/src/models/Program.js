const mongoose = require("mongoose");
const db = require("./initDb");

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    intake: {
      type: Number,
      required: true,
    },

    quotas: {
      KCET: { type: Number, required: true },
      COMEDK: { type: Number, required: true },
      MANAGEMENT: { type: Number, required: true },
    },

    filledSeats: {
      KCET: { type: Number, default: 0 },
      COMEDK: { type: Number, default: 0 },
      MANAGEMENT: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Program = db.model("Program", programSchema);

module.exports = Program;