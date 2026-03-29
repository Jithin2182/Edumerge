const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const db = require("./initDb");

const ROLES = ["ADMIN", "ADMISSION_OFFICER", "MANAGEMENT"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ROLES,
      default: "ADMISSION_OFFICER",
    },
  },
  { timestamps: true }
);


// Hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


const User = db.model("User", userSchema);

module.exports = User;