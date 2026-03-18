import { useEffect, useMemo, useState } from "react";
import { getExpenses, getEmployees } from "../services/api";

export default function Analytics({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMonth, setSelectedMonth] = useState("all");

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
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
        amount: Number.isFinite(amount) ? amount : 0,
        status,
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
      return selectedMonth === "all" ? true : expense.monthKey === selectedMonth;
    });
  }, [normalizedExpenses, selectedMonth]);

  const topLevelStats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const count = filteredExpenses.length;

    const avg = count ? total / count : 0;

    const pendingCount = filteredExpenses.filter((e) => e.status === "pending").length;
    const approvedCount = filteredExpenses.filter((e) => e.status === "approved").length;
    const rejectedCount = filteredExpenses.filter((e) => e.status === "rejected").length;
    const paidCount = filteredExpenses.filter((e) => e.status === "paid").length;

    return {
      total,
      count,
      avg,
      pendingCount,
      approvedCount,
      rejectedCount,
      paidCount,
    };
  }, [filteredExpenses]);

  const monthlyTrend = useMemo(() => {
    const grouped = new Map();

    normalizedExpenses.forEach((expense) => {
      if (expense.monthKey === "Unknown") return;

      if (!grouped.has(expense.monthKey)) {
        grouped.set(expense.monthKey, 0);
      }

      grouped.set(expense.monthKey, grouped.get(expense.monthKey) + expense.amount);
    });

    return Array.from(grouped.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => (a.month > b.month ? 1 : -1));
  }, [normalizedExpenses]);

  const categoryBreakdown = useMemo(() => {
    const grouped = new Map();

    filteredExpenses.forEach((expense) => {
      const key = expense.category || "Uncategorized";

      if (!grouped.has(key)) {
        grouped.set(key, {
          category: key,
          total: 0,
          count: 0,
        });
      }

      const row = grouped.get(key);
      row.total += expense.amount;
      row.count += 1;
    });

    return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  const employeeLeaderboard = useMemo(() => {
    const grouped = new Map();

    filteredExpenses.forEach((expense) => {
      const key = expense.employeeId || expense.employeeName;

      if (!grouped.has(key)) {
        grouped.set(key, {
          employeeName: expense.employeeName,
          total: 0,
          count: 0,
        });
      }

      const row = grouped.get(key);
      row.total += expense.amount;
      row.count += 1;
    });

    return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  const reimbursementStats = useMemo(() => {
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

  const maxTrendValue = useMemo(() => {
    if (!monthlyTrend.length) return 0;
    return Math.max(...monthlyTrend.map((item) => item.total));
  }, [monthlyTrend]);

  if (!user || user.role !== "admin") {
    return (
      <div style={{ padding: 24 }}>
        <h1>Analytics</h1>
        <p>You do not have access to this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Analytics</h1>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Analytics</h1>
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
      <h1 style={{ marginBottom: 6 }}>Analytics</h1>
      <p style={{ marginTop: 0, color: "#555", marginBottom: 24 }}>
        Expense intelligence, category trends, employee ranking, and reimbursement performance.
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
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricCard title="Total Expenses" value={formatCurrency(topLevelStats.total)} />
        <MetricCard title="Total Entries" value={String(topLevelStats.count)} />
        <MetricCard title="Average Expense" value={formatCurrency(topLevelStats.avg)} />
        <MetricCard title="Pending Count" value={String(topLevelStats.pendingCount)} />
        <MetricCard title="Approved Count" value={String(topLevelStats.approvedCount)} />
        <MetricCard title="Paid Count" value={String(topLevelStats.paidCount)} />
      </div>

      <div
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Monthly Expense Trend</h2>
        <p style={{ color: "#666", marginTop: 0 }}>
          Visual comparison of expense totals by month.
        </p>

        {!monthlyTrend.length ? (
          <p>No trend data available.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {monthlyTrend.map((item) => (
              <div key={item.month}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                    fontSize: 14,
                  }}
                >
                  <span>{formatMonthLabel(item.month)}</span>
                  <strong>{formatCurrency(item.total)}</strong>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 12,
                    background: "#E5E7EB",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: maxTrendValue ? `${(item.total / maxTrendValue) * 100}%` : "0%",
                      height: "100%",
                      background: "var(--primary)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            padding: 20,
            overflowX: "auto",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Top Spending Categories</h2>
          <p style={{ color: "#666", marginTop: 0 }}>
            Category breakdown for selected expenses.
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                <Th>Category</Th>
                <Th align="right">Entries</Th>
                <Th align="right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.length === 0 ? (
                <tr>
                  <Td colSpan={3}>No category data found.</Td>
                </tr>
              ) : (
                categoryBreakdown.map((row) => (
                  <tr key={row.category}>
                    <Td>{row.category}</Td>
                    <Td align="right">{row.count}</Td>
                    <Td align="right">{formatCurrency(row.total)}</Td>
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
            overflowX: "auto",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Employee Leaderboard</h2>
          <p style={{ color: "#666", marginTop: 0 }}>
            Employees ranked by total submitted expenses.
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                <Th>Employee</Th>
                <Th align="right">Entries</Th>
                <Th align="right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {employeeLeaderboard.length === 0 ? (
                <tr>
                  <Td colSpan={3}>No employee data found.</Td>
                </tr>
              ) : (
                employeeLeaderboard.map((row, index) => (
                  <tr key={`${row.employeeName}-${index}`}>
                    <Td>{row.employeeName}</Td>
                    <Td align="right">{row.count}</Td>
                    <Td align="right">{formatCurrency(row.total)}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
        <h2 style={{ marginTop: 0 }}>Reimbursement Performance</h2>
        <p style={{ color: "#666", marginTop: 0 }}>
          Current counts and totals by reimbursement status.
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
            {reimbursementStats.map((row) => (
              <tr key={row.key}>
                <Td>
                  <StatusBadge status={row.key} />
                </Td>
                <Td align="right">{row.count}</Td>
                <Td align="right">{formatCurrency(row.total)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ title, value }) {
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

function formatMonthLabel(monthValue) {
  if (!monthValue || monthValue === "Unknown") return "Unknown";

  const [year, month] = monthValue.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}