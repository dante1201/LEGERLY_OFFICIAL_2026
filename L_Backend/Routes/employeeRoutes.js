const express = require("express");
const router = express.Router();
const Employee = require("../Models/Employee");

//
// GET ALL EMPLOYEES
//
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

//
// CREATE EMPLOYEE
//
router.post("/", async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.json(employee);
  } catch (err) {
    res.status(400).json({ error: "Bad request" });
  }
});

//
// UPDATE EMPLOYEE
//
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Bad request" });
  }
});

//
// DELETE EMPLOYEE
//
router.delete("/:id", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(404).json({ error: "Not found" });
  }
});

//
// LOGIN (THIS IS WHAT YOUR APP NEEDS)
//
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Employee.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    res.json({
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
