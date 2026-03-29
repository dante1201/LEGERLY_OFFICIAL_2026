import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEmployees, updateEmployee } from "../services/api";

export default function EmployeeEdit() {
  const { id } = useParams();
  const [form, setForm] = useState(null);

  useEffect(() => {
    loadEmployee();
  }, [id]);

  async function loadEmployee() {
    const data = await getEmployees();
    const emp = data.find((e) => e._id === id);
    setForm(emp || null);
  }

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit() {
    const result = await updateEmployee(id, {
      full_name: form.full_name,
      email: form.email?.toLowerCase(),
      role: form.role,
      auth0_id: form.auth0_id || null,
    });

    if (!result || result.error) {
      alert(result?.error || "Failed to update employee.");
      console.error("updateEmployee failed:", result);
      return;
    }

    window.location.href = "/employees";
  }

  if (!form) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div className="add-container">
      <div className="add-card">
        <h1 className="add-title">Edit Employee</h1>

        <input
          name="full_name"
          className="form-input"
          placeholder="Full Name"
          value={form.full_name || ""}
          onChange={change}
        />

        <input
          name="email"
          className="form-input"
          placeholder="Email"
          value={form.email || ""}
          onChange={change}
        />

        <select
          name="role"
          className="form-input"
          value={form.role || "user"}
          onChange={change}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <input
          name="auth0_id"
          className="form-input"
          placeholder="Auth0 ID"
          value={form.auth0_id || ""}
          onChange={change}
        />

        <button className="save-btn" onClick={submit}>
          Save Changes
        </button>
      </div>
    </div>
  );
}