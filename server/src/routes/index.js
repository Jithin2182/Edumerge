const express = require("express");
const router = express.Router();

// all API routes

router.use("/auth", require("./auth"));

module.exports = router;