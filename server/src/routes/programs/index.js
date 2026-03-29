const express = require("express");
const router = express.Router();

const {protect, authorize} = require("./../../middleware/authMiddleware");

// Import route modules
const createProgram = require("./../../controllers/program/createProgram");
const getProgramById = require("./../../controllers/program/getProgramById");
const getPrograms = require("./../../controllers/program/getPrograms");

// Define routes
router.post("/programs", protect, authorize("ADMIN"), createProgram);
router.get("/programs/:id", protect, getProgramById);
router.get("/programs", protect, getPrograms);

module.exports = router;