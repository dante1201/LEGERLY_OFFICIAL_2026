import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Home from "./pages/Home";
import EmployeeList from "./pages/EmployeeList";
import EmployeeCreate from "./pages/EmployeeCreate";
import EmployeeEdit from "./pages/EmployeeEdit";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AddExpense from "./pages/AddExpense";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");

    if (!savedUser) return;

    try {
      const parsed = JSON.parse(savedUser);
      if (parsed) setUser(parsed);
    } catch (err) {
      sessionStorage.removeItem("user");
    }
  }, []);

  function logout() {
    sessionStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  }

  function AdminRoute({ children }) {
    if (!user) return <Login />;
    if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
    return children;
  }

  return (
    <BrowserRouter>
      <header
        style={{
          background: "var(--primary)",
          color: "white",
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(0,0,0,0.05)"
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: 0.5 }}>
          Ledgerly
        </div>

        {user && (
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            Signed in as <strong>{user.email}</strong>
          </div>
        )}
      </header>

      {user && (
        <nav
          style={{
            padding: "10px 20px",
            background: "var(--bg)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #E0E7EA"
          }}
        >
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Link className="nav-button" to="/">Home</Link>
            <Link className="nav-button" to="/dashboard">Dashboard</Link>
            <Link className="nav-button" to="/add-expense">Expenses</Link>

            {user.role === "admin" && (
  <>
    <Link className="nav-button" to="/reports">Reports</Link>
    <Link className="nav-button" to="/analytics">Analytics</Link>
  </>
)}

            {user.role === "admin" && (
              <Link className="nav-button" to="/employees">Employees</Link>
            )}

            <Link className="nav-button" to="/settings">Settings</Link>
            <Link className="nav-button" to="/help">Help</Link>
          </div>

          <button
            onClick={logout}
            style={{
              background: "#e11d48",
              borderRadius: "999px",
              padding: "8px 16px",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13
            }}
          >
            Logout
          </button>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/employees"
          element={
            <AdminRoute>
              <EmployeeList user={user} />
            </AdminRoute>
          }
        />

        <Route
          path="/employees/new"
          element={
            <AdminRoute>
              <EmployeeCreate />
            </AdminRoute>
          }
        />

        <Route
          path="/employees/edit/:id"
          element={
            <AdminRoute>
              <EmployeeEdit />
            </AdminRoute>
          }
        />

        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Login />}
        />

        <Route
          path="/profile"
          element={user ? <Profile user={user} /> : <Login />}
        />

        <Route
          path="/settings"
          element={user ? <Settings user={user} /> : <Login />}
        />

        <Route
          path="/help"
          element={user ? <Help user={user} /> : <Login />}
        />

        <Route
        path="/reports"
        element={
        <AdminRoute>
          <Reports user={user} />
        </AdminRoute>
      }
    />

        <Route
          path="/analytics"
          element={
            <AdminRoute>
              <Analytics user={user} />
            </AdminRoute>
          }
        />

        <Route
          path="/add-expense"
          element={user ? <AddExpense user={user} /> : <Login />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;