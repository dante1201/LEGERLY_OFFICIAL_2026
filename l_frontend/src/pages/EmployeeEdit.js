import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEmployees, updateEmployee } from "../services/api";

export default function EmployeeEdit() {
  const { id } = useParams();
  const [form, setForm] = useState(null);

  useEffect(() => {
    loadEmployee();
    // eslint-disable-next-line
  }, []);

  async function loadEmployee() {
    const data = await getEmployees();
    const emp = data.find((e) => e._id === id);
    setForm(emp);
  }

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit() {
    await updateEmployee(id, form);
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

        <button className="save-btn" onClick={submit}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
