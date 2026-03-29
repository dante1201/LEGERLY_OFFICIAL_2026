import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { syncEmployee } from "./services/api";

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
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

  console.log("Auth0 user:", user);
  console.log("role claim:", user?.["https://ledgerly-app/role"]);
  console.log("roles claim:", user?.["https://ledgerly-app/roles"]);
  console.log("email:", user?.email);

  const adminEmails = [
    "new@gmail.com",
  ];

  const auth0Role = user?.["https://ledgerly-app/role"];
  const auth0Roles = user?.["https://ledgerly-app/roles"] || [];

  const isAdminByClaim =
    auth0Role === "admin" || auth0Roles.includes("admin");

  const isAdminByEmail =
    adminEmails.includes((user?.email || "").toLowerCase());

  const appUser = isAuthenticated
    ? {
        id: user?.sub || user?.email || "",
        email: user?.email || "",
        name: user?.name || "",
        role: isAdminByClaim || isAdminByEmail ? "admin" : "user",
      }
    : null;

  useEffect(() => {
    async function doSync() {
      if (!isAuthenticated || !user) return;

      const result = await syncEmployee(user);
      console.log("Employee sync result:", result);
    }

    doSync();
  }, [isAuthenticated, user]);

  function handleLogout() {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }

  function ProtectedRoute({ children }) {
    if (isLoading) return <div style={{ padding: "20px" }}>Loading...</div>;
    if (!isAuthenticated) return <Login />;
    return children;
  }

  function AdminRoute({ children }) {
    if (isLoading) return <div style={{ padding: "20px" }}>Loading...</div>;
    if (!isAuthenticated) return <Login />;
    if (appUser?.role !== "admin") return <Navigate to="/dashboard" replace />;
    return children;
  }

  if (isLoading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
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

        {isAuthenticated && appUser && (
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            Signed in as <strong>{appUser.email}</strong>
          </div>
        )}

        {!isAuthenticated && (
          <button
            onClick={() => loginWithRedirect()}
            style={{
              background: "white",
              borderRadius: "999px",
              padding: "8px 16px",
              color: "#111827",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13
            }}
          >
            Login
          </button>
        )}
      </header>

      {isAuthenticated && appUser && (
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

            {appUser.role === "admin" && (
              <>
                <Link className="nav-button" to="/reports">Reports</Link>
                <Link className="nav-button" to="/analytics">Analytics</Link>
                <Link className="nav-button" to="/employees">Employees</Link>
              </>
            )}

            <Link className="nav-button" to="/settings">Settings</Link>
            <Link className="nav-button" to="/help">Help</Link>
          </div>

          <button
            onClick={handleLogout}
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
        <Route path="/" element={<Home user={appUser} />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/employees"
          element={
            <AdminRoute>
              <EmployeeList user={appUser} />
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
          element={
            <ProtectedRoute>
              <Dashboard user={appUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile user={appUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings user={appUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <Help user={appUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <AdminRoute>
              <Reports user={appUser} />
            </AdminRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <AdminRoute>
              <Analytics user={appUser} />
            </AdminRoute>
          }
        />

        <Route
          path="/add-expense"
          element={
            <ProtectedRoute>
              <AddExpense user={appUser} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;