const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId }
,
 Created_at: { type: Date, default: Date.now }
,
  email: { type: String, required: true },
  full_name: { type: String, required: true },
  org_id: { type: String },
  password: { type: String, required: true },
  role: { type: String, required: true },
  updated: { type: String }
});

module.exports = mongoose.model("Employee", EmployeeSchema);
