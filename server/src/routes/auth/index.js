const express = require("express");
const router = express.Router();

// Import route modules
const register = require("./../../controllers/auth/register");
const login = require("./../../controllers/auth/login");

// Define routes
router.post("/auth/register", register);
router.post("/auth/login", login);

module.exports = router;