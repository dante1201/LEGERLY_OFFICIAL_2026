import { useEffect, useMemo, useState } from "react";
import {
  getExpenses,
  getEmployees,
  updateExpenseStatus,
} from "../services/api";

export default function Reports({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [expenseData, employeeData] = await Promise.all([
          getExpenses(),
          getEmployees(),
        ]);

        setExpenses(Array.isArray(expenseData) ? expenseData : []);
        setEmployees(Array.isArray(employeeData) ? employeeData : []);
      } catch (err) {
        setError("Failed to load report data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleStatusChange(expenseId, newStatus) {
    try {
      const updated = await updateExpenseStatus(expenseId, newStatus);

      setExpenses((prev) =>
        prev.map((expense) =>
          String(expense._id || expense.id) === String(expenseId)
            ? { ...expense, ...updated }
            : expense
        )
      );
    } catch (error) {
      console.error("Failed to update expense status:", error);
      alert("Failed to update reimbursement status.");
    }
  }

  const employeeMap = useMemo(() => {
    const map = new Map();

    employees.forEach((emp) => {
      const id = String(emp._id || emp.id || emp.employeeId || emp.employee_id || "");
      if (!id) return;

      map.set(id, {
        ...emp,
        displayName:
          emp.full_name ||
          emp.name ||
          [emp.first_name, emp.last_name].filter(Boolean).join(" ") ||
          emp.email ||
          "Unknown Employee",
      });
    });

    return map;
  }, [employees]);

  const normalizedExpenses = useMemo(() => {
    return expenses.map((expense, index) => {
      const amount = Number(
        expense.amount ??
          expense.total ??
          expense.cost ??
          expense.expenseAmount ??
          0
      );

      const rawStatus = String(
        expense.status ??
          expense.reimbursementStatus ??
          expense.paymentStatus ??
          "pending"
      ).toLowerCase();

      const status = normalizeStatus(rawStatus);

      const rawDate =
        expense.date ||
        expense.expenseDate ||
        expense.created_at ||
        expense.createdAt ||
        expense.submittedAt ||
        expense.updatedAt ||
        null;

      const parsedDate = rawDate ? new Date(rawDate) : null;

      const monthKey =
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? `${parsedDate.getFullYear()}-${String(
              parsedDate.getMonth() + 1
            ).padStart(2, "0")}`
          : "Unknown";

      const employeeId = String(
        expense.employeeId ||
          expense.employee_id ||
          expense.employee ||
          expense.userId ||
          expense.user_id ||
          expense.submittedBy ||
          expense.employee?._id ||
          expense.employee?.id ||
          ""
      );

      const directName =
        expense.employeeName ||
        expense.employee_name ||
        expense.submittedByName ||
        expense.employee?.full_name ||
        expense.employee?.name ||
        "";

      const employeeInfo = employeeMap.get(employeeId);

      const employeeName =
        directName ||
        employeeInfo?.displayName ||
        (employeeId ? `Employee ${employeeId.slice(-6)}` : "Unknown Employee");

      return {
        id: expense._id || expense.id || index,
        original: expense,
        amount: Number.isFinite(amount) ? amount : 0,
        status,
        rawStatus,
        rawDate,
        parsedDate,
        monthKey,
        employeeId,
        employeeName,
        category: expense.category || expense.item_type || expense.type || "Uncategorized",
        description: expense.description || expense.vendor || expense.note || "",
      };
    });
  }, [expenses, employeeMap]);

  const availableMonths = useMemo(() => {
    const set = new Set(
      normalizedExpenses
        .map((e) => e.monthKey)
        .filter((m) => m && m !== "Unknown")
    );

    return Array.from(set).sort((a, b) => (a < b ? 1 : -1));
  }, [normalizedExpenses]);

  const filteredExpenses = useMemo(() => {
    return normalizedExpenses.filter((expense) => {
      const monthMatch =
        selectedMonth === "all" ? true : expense.monthKey === selectedMonth;

      const employeeMatch =
        selectedEmployee === "all"
          ? true
          : expense.employeeId === selectedEmployee;

      return monthMatch && employeeMatch;
    });
  }, [normalizedExpenses, selectedMonth, selectedEmployee]);

  const monthlySummary = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const count = filteredExpenses.length;

    const pending = filteredExpenses
      .filter((e) => e.status === "pending")
      .reduce((sum, e) => sum + e.amount, 0);

    const approved = filteredExpenses
      .filter((e) => e.status === "approved")
      .reduce((sum, e) => sum + e.amount, 0);

    const rejected = filteredExpenses
      .filter((e) => e.status === "rejected")
      .reduce((sum, e) => sum + e.amount, 0);

    const paid = filteredExpenses
      .filter((e) => e.status === "paid")
      .reduce((sum, e) => sum + e.amount, 0);

    return { total, count, pending, approved, rejected, paid };
  }, [filteredExpenses]);

  const breakdownByEmployee = useMemo(() => {
    const grouped = new Map();

    filteredExpenses.forEach((expense) => {
      const key = expense.employeeId || expense.employeeName;

      if (!grouped.has(key)) {
        grouped.set(key, {
          employeeId: expense.employeeId,
          employeeName: expense.employeeName,
          total: 0,
          count: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          paid: 0,
        });
      }

      const row = grouped.get(key);
      row.total += expense.amount;
      row.count += 1;

      if (expense.status === "pending") row.pending += expense.amount;
      if (expense.status === "approved") row.approved += expense.amount;
      if (expense.status === "rejected") row.rejected += expense.amount;
      if (expense.status === "paid") row.paid += expense.amount;
    });

    return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  const reimbursementBreakdown = useMemo(() => {
    const statuses = [
      { key: "pending", label: "Pending" },
      { key: "approved", label: "Approved" },
      { key: "rejected", label: "Rejected" },
      { key: "paid", label: "Paid" },
    ];

    return statuses.map(({ key, label }) => {
      const items = filteredExpenses.filter((e) => e.status === key);
      const total = items.reduce((sum, e) => sum + e.amount, 0);

      return {
        key,
        label,
        count: items.length,
        total,
      };
    });
  }, [filteredExpenses]);

  if (!user || user.role !== "admin") {
    return (
      <div style={{ padding: 24 }}>
        <h1>Reports</h1>
        <p>You do not have access to this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Reports</h1>
        <p>Loading reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Reports</h1>
        <div
          style={{
            background: "#FEF2F2",
            color: "#991B1B",
            border: "1px solid #FECACA",
            padding: 12,
            borderRadius: 8,
            maxWidth: 600,
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 6 }}>Reports</h1>
      <p style={{ marginTop: 0, color: "#555", marginBottom: 24 }}>
        Monthly expense summary, employee breakdown, and reimbursement tracking.
      </p>

      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: 13,
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            Filter by Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 8,
              border: "1px solid #D1D5DB",
              minWidth: 180,
            }}
          >
            <option value="all">All Months</option>
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: 13,
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            Filter by Employee
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 8,
              border: "1px solid #D1D5DB",
              minWidth: 220,
            }}
          >
            <option value="all">All Employees</option>
            {employees.map((emp) => {
              const value = String(
                emp._id || emp.id || emp.employeeId || emp.employee_id || ""
              );

              const label =
                emp.full_name ||
                emp.name ||
                [emp.first_name, emp.last_name].filter(Boolean).join(" ") ||
                emp.email ||
                "Unknown Employee";

              if (!value) return null;

              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          title="Monthly Expense Summary"
          value={formatCurrency(monthlySummary.total)}
        />
        <StatCard
          title="Total Expense Entries"
          value={String(monthlySummary.count)}
        />
        <StatCard
          title="Pending Reimbursements"
          value={formatCurrency(monthlySummary.pending)}
        />
        <StatCard
          title="Approved Reimbursements"
          value={formatCurrency(monthlySummary.approved)}
        />
        <StatCard
          title="Rejected Reimbursements"
          value={formatCurrency(monthlySummary.rejected)}
        />
        <StatCard
          title="Paid Reimbursements"
          value={formatCurrency(monthlySummary.paid)}
        />
      </div>

      <div
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          overflowX: "auto",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Expenses by Employee</h2>
        <p style={{ color: "#666", marginTop: 0 }}>
          Breakdown of employee expenses for the selected filters.
        </p>

        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              <Th>Employee</Th>
              <Th align="right">Total Expenses</Th>
              <Th align="right">Entries</Th>
              <Th align="right">Pending</Th>
              <Th align="right">Approved</Th>
              <Th align="right">Rejected</Th>
              <Th align="right">Paid</Th>
            </tr>
          </thead>
          <tbody>
            {breakdownByEmployee.length === 0 ? (
              <tr>
                <Td colSpan={7}>No expense data found for the selected filters.</Td>
              </tr>
            ) : (
              breakdownByEmployee.map((row) => (
                <tr key={row.employeeId || row.employeeName}>
                  <Td>{row.employeeName}</Td>
                  <Td align="right">{formatCurrency(row.total)}</Td>
                  <Td align="right">{row.count}</Td>
                  <Td align="right">{formatCurrency(row.pending)}</Td>
                  <Td align="right">{formatCurrency(row.approved)}</Td>
                  <Td align="right">{formatCurrency(row.rejected)}</Td>
                  <Td align="right">{formatCurrency(row.paid)}</Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          overflowX: "auto",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Reimbursements</h2>
        <p style={{ color: "#666", marginTop: 0 }}>
          Current status of reimbursements: pending, approved, rejected, and paid.
        </p>

        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              <Th>Status</Th>
              <Th align="right">Count</Th>
              <Th align="right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {reimbursementBreakdown.map((row) => (
              <tr key={row.key}>
                <Td>{row.label}</Td>
                <Td align="right">{row.count}</Td>
                <Td align="right">{formatCurrency(row.total)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: 20,
          overflowX: "auto",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Recent Expense Entries</h2>
        <p style={{ color: "#666", marginTop: 0 }}>
          Detailed expenses included in this report.
        </p>

        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1080 }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              <Th>Date</Th>
              <Th>Employee</Th>
              <Th>Description</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th align="right">Amount</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <Td colSpan={7}>No expenses found.</Td>
              </tr>
            ) : (
              filteredExpenses
                .slice()
                .sort((a, b) => {
                  const aTime = a.parsedDate ? a.parsedDate.getTime() : 0;
                  const bTime = b.parsedDate ? b.parsedDate.getTime() : 0;
                  return bTime - aTime;
                })
                .map((expense) => (
                  <tr key={expense.id}>
                    <Td>{formatDate(expense.rawDate)}</Td>
                    <Td>{expense.employeeName}</Td>
                    <Td>{expense.description || "—"}</Td>
                    <Td>{expense.category}</Td>
                    <Td>
                      <StatusBadge status={expense.status} />
                    </Td>
                    <Td align="right">{formatCurrency(expense.amount)}</Td>
                    <Td>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {expense.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(expense.id, "approved")}
                              style={actionButtonStyle("#2563EB")}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(expense.id, "rejected")}
                              style={actionButtonStyle("#DC2626")}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {expense.status === "approved" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(expense.id, "paid")}
                              style={actionButtonStyle("#16A34A")}
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => handleStatusChange(expense.id, "rejected")}
                              style={actionButtonStyle("#DC2626")}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {expense.status === "rejected" && (
                          <button
                            onClick={() => handleStatusChange(expense.id, "pending")}
                            style={actionButtonStyle("#6B7280")}
                          >
                            Reset
                          </button>
                        )}

                        {expense.status === "paid" && (
                          <button
                            onClick={() => handleStatusChange(expense.id, "approved")}
                            style={actionButtonStyle("#7C3AED")}
                          >
                            Undo Paid
                          </button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 18,
      }}
    >
      <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: {
      background: "#FEF3C7",
      color: "#92400E",
      border: "1px solid #FCD34D",
    },
    approved: {
      background: "#DBEAFE",
      color: "#1E40AF",
      border: "1px solid #93C5FD",
    },
    rejected: {
      background: "#FEE2E2",
      color: "#991B1B",
      border: "1px solid #FCA5A5",
    },
    paid: {
      background: "#DCFCE7",
      color: "#166534",
      border: "1px solid #86EFAC",
    },
  };

  const style = styles[status] || {
    background: "#F3F4F6",
    color: "#374151",
    border: "1px solid #D1D5DB",
  };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        textTransform: "capitalize",
        ...style,
      }}
    >
      {status}
    </span>
  );
}

function Th({ children, align = "left" }) {
  return (
    <th
      style={{
        textAlign: align,
        padding: 12,
        borderBottom: "1px solid #E5E7EB",
        fontSize: 13,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, align = "left", colSpan }) {
  return (
    <td
      colSpan={colSpan}
      style={{
        textAlign: align,
        padding: 12,
        borderBottom: "1px solid #E5E7EB",
        fontSize: 14,
      }}
    >
      {children}
    </td>
  );
}

function normalizeStatus(status) {
  if (status.includes("paid")) return "paid";
  if (status.includes("reject")) return "rejected";
  if (status.includes("approve")) return "approved";
  return "pending";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMonthLabel(monthValue) {
  if (!monthValue || monthValue === "Unknown") return "Unknown";

  const [year, month] = monthValue.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function actionButtonStyle(background) {
  return {
    background,
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  };
}