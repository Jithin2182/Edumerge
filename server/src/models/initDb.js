const mongoose = require("mongoose");

const dbName = process.env.DB_NAME
const db = mongoose.connection.useDb(dbName);

module.exports = db;