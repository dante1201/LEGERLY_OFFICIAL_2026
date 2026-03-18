const express = require("express");
const router = express.Router();
const Expense = require("../Models/Expense");

// GET ALL EXPENSES
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ created_at: -1 });
    res.json(expenses);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE EXPENSE
router.post("/", async (req, res) => {
  try {
    const newExpense = await Expense.create(req.body);
    res.json(newExpense);
  } catch (err) {
    console.error("Error creating expense:", err);
    res.status(400).json({ error: "Bad request" });
  }
});

// GET ONE EXPENSE
router.get("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(expense);
  } catch (err) {
    console.error("Error fetching expense:", err);
    res.status(404).json({ error: "Not found" });
  }
});

// UPDATE EXPENSE REIMBURSEMENT STATUS
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["pending", "approved", "rejected", "paid"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updateData = { status };

    if (status === "approved") {
      updateData.approved_at = new Date();
      updateData.rejected_at = null;
    }

    if (status === "rejected") {
      updateData.rejected_at = new Date();
      updateData.approved_at = null;
      updateData.paid_at = null;
    }

    if (status === "paid") {
      updateData.paid_at = new Date();
    }

    if (status === "pending") {
      updateData.approved_at = null;
      updateData.rejected_at = null;
      updateData.paid_at = null;
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE EXPENSE
router.delete("/:id", async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);

    if (!deletedExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(404).json({ error: "Not found" });
  }
});

module.exports = router;