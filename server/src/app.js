const express = require("express");
const cors = require("cors");

const app = express();

//cors
app.use(cors());

// Middleware
app.use(express.json());

// Preload models
require("./models/User");
require("./models/Program");
require("./models/Applicant");

// Load routes
const routes = require("./routes");

// Base Route
app.get("/", (req, res) => {
  res.send(`Welcome to the API`);
});

// Use routes
app.use("/api", routes);

module.exports = app;