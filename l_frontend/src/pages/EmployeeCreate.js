import { useState } from "react";
import { createEmployee } from "../services/api";

export default function EmployeeCreate() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    role: "user",
    auth0_id: "",
  });

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit() {
    if (!form.full_name || !form.email || !form.role) {
      alert("Full name, email, and role are required");
      return;
    }

    const result = await createEmployee({
      auth0_id: form.auth0_id || null,
      full_name: form.full_name,
      email: form.email.toLowerCase(),
      role: form.role,
      created_at: new Date(),
    });

    if (!result || result.error) {
      alert(result?.error || "Failed to create employee.");
      console.error("createEmployee failed:", result);
      return;
    }

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

        <select
          name="role"
          className="form-input"
          value={form.role}
          onChange={change}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <input
          name="auth0_id"
          className="form-input"
          placeholder="Auth0 ID (optional)"
          value={form.auth0_id}
          onChange={change}
        />

        <button className="save-btn" onClick={submit}>
          Save Employee
        </button>
      </div>
    </div>
  );
}