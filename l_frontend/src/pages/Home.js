import { Link } from "react-router-dom";

export default function Home({ user }) {
  return (
    <div className="page-container">
      <h1 style={{ fontSize: "32px", marginBottom: "6px" }}>
        Welcome to Ledgerly
      </h1>

      {user && (
        <div style={{ marginBottom: "25px" }}>
          <p style={{ color: "var(--secondary)", fontSize: "18px" }}>
            Hello, <strong>{user.full_name?.toUpperCase()}</strong>!
          </p>
          <p style={{ color: "rgba(38,70,83,0.7)" }}>
            Role: <strong>{user.role.toUpperCase()}</strong>
          </p>
        </div>
      )}

      {!user && (
        <div style={{ marginTop: "20px" }}>
          <p style={{ fontSize: "18px", color: "var(--secondary)" }}>
            Please <Link to="/login">log in</Link> to access your dashboard.
          </p>
        </div>
      )}

      <div style={{ marginTop: "40px", maxWidth: "650px" }}>
        <p
          style={{
            color: "rgba(38,70,83,0.7)",
            fontSize: "15px",
            lineHeight: 1.6,
          }}
        >
          Ledgerly helps you track your spending effortlessly — organize
          expenses, visualize trends, and stay in control of your finances with
          clarity and simplicity.
        </p>
      </div>
    </div>
  );
}