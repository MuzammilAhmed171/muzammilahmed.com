const mongoose = require("mongoose");

/* The single admin account that controls the portfolio.
   The password is never stored in plain text; only a bcrypt hash. */
const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    name: {
      type: String,
      default: "Muzammil Ahmed",
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Admin", AdminSchema);
