import { useState } from "react";
import { createExpense } from "../services/api";

export default function AddExpense({ user }) {
  const [form, setForm] = useState({
    vendor: "",
    item_type: "",
    category: "",
    memo: "",
    payment_method: "",
    cost: ""
  });

  const [loading, setLoading] = useState(false);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit() {
    if (
      !form.vendor ||
      !form.item_type ||
      !form.category ||
      !form.payment_method ||
      !form.cost
    ) {
      alert("All required fields must be completed");
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

        <select
          name="category"
          className="form-input"
          value={form.category}
          onChange={change}
        >
          <option value="">Select Category</option>
          <option value="Office Supplies">Office Supplies</option>
          <option value="Food">Food</option>
          <option value="General Expenses">General Expenses</option>
          <option value="Software">Software</option>
          <option value="Equipment">Equipment</option>
          <option value="Travel">Travel</option>
          <option value="Other">Other</option>
        </select>

        <select
          name="payment_method"
          className="form-input"
          value={form.payment_method}
          onChange={change}
        >
          <option value="">Select Payment Method</option>
          <option value="Company Card">Company Card</option>
          <option value="Cash">Cash</option>
          <option value="Personal Card">Personal Card</option>
          <option value="Check">Check</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Other">Other</option>
        </select>

        <textarea
          name="memo"
          className="form-input"
          placeholder="Memo / Notes"
          value={form.memo}
          onChange={change}
          rows="4"
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