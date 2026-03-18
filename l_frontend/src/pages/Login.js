import React, { useEffect, useState } from "react";
import { login } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [joke, setJoke] = useState("");

  useEffect(() => {
    fetch("https://api.chucknorris.io/jokes/random")
      .then(res => res.json())
      .then(data => setJoke(data.value))
      .catch(() => setJoke("Could not load joke 😢"));
  }, []);

  async function submit() {
    const res = await login(email, password);
    if (res.error) setError(res.error);
    else {
      sessionStorage.setItem("user", JSON.stringify(res));
      window.location.href = "/";
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">

        <h1 className="login-title">Ledgerly</h1>
        <p className="login-subtitle">Sign in to manage your offline budget.</p>

        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}

        <input
          className="login-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="login-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={submit}>Login</button>

        {/* Joke Section */}
        <div className="joke-box">
          <p className="joke-title">Ledgerly Break ☕</p>
          <p>{joke}</p>
        </div>

      </div>
    </div>
  );
}
