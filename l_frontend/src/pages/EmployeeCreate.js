import { useState } from "react";
import { createEmployee } from "../services/api";

export default function EmployeeCreate() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    role: "",
    password: "",
  });

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit() {
    if (!form.full_name || !form.email || !form.role || !form.password) {
      alert("All fields are required");
      return;
    }

    await createEmployee({
      ...form,
      created_at: new Date(),
    });

    window.location.href = "/employees";
  }

  return (
    <div className="add-container">
      <div className="add-card">
        <h1 className="add-title">Create Employee</h1>

        <input
          name="full_name"
          className="form-input"
          placeholder="Full Name"
          value={form.full_name}
          onChange={change}
        />

        <input
          name="email"
          className="form-input"
          placeholder="Email"
          value={form.email}
          onChange={change}
        />

        <input
          name="role"
          className="form-input"
          placeholder="Role"
          value={form.role}
          onChange={change}
        />

        <input
          name="password"
          className="form-input"
          placeholder="Password"
          value={form.password}
          onChange={change}
        />

        <button className="save-btn" onClick={submit}>Save Employee</button>
      </div>
    </div>
  );
}
