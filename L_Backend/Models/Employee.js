const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  auth0_id: { type: String, default: null, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  full_name: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Employee", EmployeeSchema);