import { useState } from "react";

export default function Settings({ user }) {

  const [name, setName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSave = (e) => {
    e.preventDefault();

    alert("Unable to make changes at this time. Please contact the Root Administrator.");
  };

  return (
    <div style={{ padding: 20 }}>

      <h1>Settings</h1>

      <div style={{ maxWidth: 400 }}>

        <label>Full Name</label>
        <input
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Email</label>
        <input
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleSave}
          style={{
            padding: "10px 18px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Save Changes
        </button>

      </div>
    </div>
  );
}