const express = require("express");
const router = express.Router();

const {protect, authorize} = require("./../../middleware/authMiddleware");

// Import route modules
const createProgram = require("./../../controllers/program/createProgram");
const getProgramById = require("./../../controllers/program/getProgramById");
const getPrograms = require("./../../controllers/program/getPrograms");

// Define routes
router.post("/", protect, authorize("ADMIN"), createProgram);
router.get("/:id", protect, getProgramById);
router.get("/", protect, getPrograms);

module.exports = router;