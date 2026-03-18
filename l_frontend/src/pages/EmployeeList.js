import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEmployees, deleteEmployee } from "../services/api";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    const data = await getEmployees();
    setEmployees(data);
  }

  async function remove(id) {
    await deleteEmployee(id);
    loadEmployees();
  }

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Employees</h1>

        <Link to="/employees/new" className="save-btn" style={{ textDecoration: "none" }}>
          + Add Employee
        </Link>
      </div>

      <div style={{ marginTop: "25px" }}>
        {employees.map(emp => (
          <div key={emp._id} className="employee-card">
            <div className="employee-info">
              <strong style={{ fontSize: "17px", color: "var(--secondary)" }}>
                {emp.full_name}
              </strong>
              <span style={{ fontSize: "14px", opacity: 0.7 }}>{emp.email}</span>
              <span className="tag" style={{ marginTop: "4px" }}>
                {emp.role.toUpperCase()}
              </span>
            </div>

            <div className="employee-actions">
              <Link
                to={`/employees/edit/${emp._id}`}
                className="action-btn"
                style={{ textDecoration: "none" }}
              >
                Edit
              </Link>

              <button className="delete-btn" onClick={() => remove(emp._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
