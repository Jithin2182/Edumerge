const express = require("express");
const router = express.Router();

// all API routes

router.use("/auth", require("./auth"));
router.use("/programs", require("./programs"));
router.use("/applicants", require("./applicants"));
router.use("/dashboard", require("./dashboard"));

module.exports = router;