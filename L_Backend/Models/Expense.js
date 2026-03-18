const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  vendor: { type: String, required: true },
  item_type: { type: String, required: true },
  cost: { type: Number, required: true },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "paid"],
    default: "pending",
  },

  approved_at: { type: Date, default: null },
  rejected_at: { type: Date, default: null },
  paid_at: { type: Date, default: null },

  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Expense", ExpenseSchema);