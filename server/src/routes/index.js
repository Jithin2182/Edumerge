const express = require("express");
const router = express.Router();

// all API routes

router.use("/auth", require("./auth"));
router.use("/programs", require("./programs"));

module.exports = router;