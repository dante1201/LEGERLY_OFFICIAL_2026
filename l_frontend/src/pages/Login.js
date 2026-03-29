import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function Login() {
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0();

  if (isLoading) {
    return (
      <div className="login-page">
        <div className="login-box">
          <h1 className="login-title">Ledgerly</h1>
          <p className="login-subtitle">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1 className="login-title">Ledgerly</h1>
        <p className="login-subtitle">Sign in to manage your budget.</p>

        {error && (
          <p style={{ color: "red", marginBottom: "10px" }}>
            {error.message || "Login failed. Please try again."}
          </p>
        )}

        <button
          className="login-btn"
          onClick={() => loginWithRedirect()}
        >
          Login with Auth0
        </button>
      </div>
    </div>
  );
}