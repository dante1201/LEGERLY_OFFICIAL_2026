import { useEffect, useState } from "react";
import { getExpenses, deleteExpense } from "../services/api";

export default function Dashboard({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [openMemoId, setOpenMemoId] = useState(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    const data = await getExpenses();
    setExpenses(data);
  }

  async function removeExpense(id) {
    await deleteExpense(id);
    loadExpenses();
  }

  function toggleMemo(id) {
    setOpenMemoId(openMemoId === id ? null : id);
  }

  const now = new Date();

  const totalThisYear = expenses
    .filter((e) => new Date(e.date).getFullYear() === now.getFullYear())
    .reduce((sum, e) => sum + Number(e.cost), 0);

  const numberOfExpenses = expenses.length;

  return (
    <div className="page-container">
      <h1 style={{ fontSize: "30px", marginBottom: "5px" }}>Ledger Overview</h1>

      <p style={{ color: "var(--secondary)", opacity: 0.7 }}>
        Track spending trends and analyze your expenses
      </p>

      <table>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Item</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Memo</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((e, index) => (
            <tr key={e._id || index}>
              <td>{e.vendor}</td>
              <td>{e.item_type}</td>
              <td>{e.category || "N/A"}</td>
              <td>${e.cost}</td>
              <td>
                <button
                  className="save-btn"
                  onClick={() => toggleMemo(e._id)}
                >
                  {openMemoId === e._id ? "Hide Memo" : "View Memo"}
                </button>

                {openMemoId === e._id && (
                  <p style={{ marginTop: "10px" }}>
                    {e.memo || "No memo entered."}
                  </p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: "40px" }}>Transactions</h2>

      <div style={{ marginTop: "20px" }}>
        {expenses.map((e) => (
          <div key={e._id} className="expense-card">
            <div className="expense-info">
              <strong className="expense-store">{e.vendor}</strong>

              <span className="tag">{e.item_type}</span>

              <span className="tag">
                {e.category || "No Category"}
              </span>
            </div>

            <div className="expense-right">
              <span className="expense-amount">${e.cost}</span>

              <button
                className="save-btn"
                onClick={() => toggleMemo(e._id)}
              >
                {openMemoId === e._id ? "Hide Memo" : "View Memo"}
              </button>

              {user.role === "admin" && (
                <button
                  className="delete-btn"
                  onClick={() => removeExpense(e._id)}
                >
                  Delete
                </button>
              )}
            </div>

            {openMemoId === e._id && (
              <div style={{ marginTop: "15px", width: "100%" }}>
                <strong>Memo:</strong>
                <p>{e.memo || "No memo entered."}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}