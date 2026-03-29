const express = require("express");
const router = express.Router();
const Employee = require("../Models/Employee");

// GET ALL EMPLOYEES
//
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ created_at: -1 });
    res.json(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
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
    console.error("Error creating employee:", err);
    res.status(400).json({ error: "Bad request" });
  }
});

//
// SYNC AUTH0 USER TO EMPLOYEE RECORD
//
router.post("/sync", async (req, res) => {
  try {
    const { auth0_id, email, full_name, role } = req.body;

    if (!auth0_id || !email || !full_name) {
      return res.status(400).json({
        error: "auth0_id, email, and full_name are required"
      });
    }

    let employee = await Employee.findOne({ auth0_id });

    if (!employee) {
      employee = await Employee.findOne({ email: email.toLowerCase() });
    }

    if (!employee) {
      employee = await Employee.create({
        auth0_id,
        email: email.toLowerCase(),
        full_name,
        role: role || "user"
      });
    } else {
      employee.auth0_id = auth0_id;
      employee.email = email.toLowerCase();
      employee.full_name = full_name;

      if (!employee.role) {
        employee.role = role || "user";
      }

      await employee.save();
    }

    res.json(employee);
  } catch (err) {
    console.error("Error syncing employee:", err);
    res.status(500).json({ error: "Failed to sync employee" });
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

    if (!updated) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(400).json({ error: "Bad request" });
  }
});

//
// DELETE EMPLOYEE
//
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(404).json({ error: "Not found" });
  }
});

module.exports = router;