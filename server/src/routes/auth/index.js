const express = require("express");
const router = express.Router();

// Import route modules
const register = require("./../../controllers/auth/register");
const login = require("./../../controllers/auth/login");

// Define routes
router.post("/register", register);
router.post("/login", login);

module.exports = router;