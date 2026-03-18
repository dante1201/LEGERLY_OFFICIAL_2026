import { useState } from "react";
import { createExpense } from "../services/api";

export default function AddExpense({ user }) {
  const [form, setForm] = useState({
    vendor: "",
    item_type: "",
    cost: ""
  });

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit() {
    if (!form.vendor || !form.item_type || !form.cost) {
      alert("All fields are required");
      return;
    }

    await createExpense({
      ...form,
      cost: Number(form.cost),
      user_id: user.id
    });

    window.location.href = "/dashboard";
  }

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: "20px" }}>Add Expense</h1>

      <div className="add-card" style={{ maxWidth: "450px", margin: "0 auto" }}>
        <input
          name="vendor"
          className="form-input"
          placeholder="Vendor Name"
          onChange={change}
        />

        <input
          name="item_type"
          className="form-input"
          placeholder="Item Type"
          onChange={change}
        />

        <input
          name="cost"
          className="form-input"
          placeholder="Cost"
          type="number"
          onChange={change}
        />

        <button className="save-btn" onClick={submit} style={{ width: "100%" }}>
          Save Expense
        </button>
      </div>
    </div>
  );
}
