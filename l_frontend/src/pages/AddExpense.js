import { useState } from "react";
import { createExpense } from "../services/api";

export default function AddExpense({ user }) {
  const [form, setForm] = useState({
    vendor: "",
    item_type: "",
    cost: ""
  });

  const [loading, setLoading] = useState(false);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit() {
    if (!form.vendor || !form.item_type || !form.cost) {
      alert("All fields are required");
      return;
    }

    if (!user?.id) {
      alert("User ID is missing. Please log out and log back in.");
      return;
    }

    setLoading(true);

    const result = await createExpense({
      ...form,
      cost: Number(form.cost),
      user_id: user.id
    });

    setLoading(false);

    if (!result || result.error) {
      alert(result?.error || "Failed to save expense.");
      console.error("Create expense failed:", result);
      return;
    }

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
          value={form.vendor}
          onChange={change}
        />

        <input
          name="item_type"
          className="form-input"
          placeholder="Item Type"
          value={form.item_type}
          onChange={change}
        />

        <input
          name="cost"
          className="form-input"
          placeholder="Cost"
          type="number"
          value={form.cost}
          onChange={change}
        />

        <button
          className="save-btn"
          onClick={submit}
          style={{ width: "100%" }}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Expense"}
        </button>
      </div>
    </div>
  );
}