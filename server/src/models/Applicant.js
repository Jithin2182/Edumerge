const mongoose = require("mongoose");
const db = require("./initDb");

const applicantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["General", "OBC", "Scheduled"],
      required: true,
    },

    quota: {
      type: String,
      enum: ["KCET", "COMEDK", "MANAGEMENT"],
      required: true,
    },

    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },

    documentsStatus: {
      type: String,
      enum: ["PENDING", "SUBMITTED", "VERIFIED"],
      default: "PENDING",
    },

    feeStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },

    status: {
      type: String,
      enum: ["PENDING", "ALLOCATED", "CONFIRMED"],
      default: "PENDING",
    },

    admissionNumber: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

const Applicant = db.model("Applicant", applicantSchema);

module.exports = Applicant;