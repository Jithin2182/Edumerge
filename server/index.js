const dotenv = require("dotenv");
const path = require("path");

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = require("./src/config/db");
const app = require("./src/app");

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});