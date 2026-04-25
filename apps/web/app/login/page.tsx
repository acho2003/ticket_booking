"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch, setStoredToken } from "../../lib/api";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.email || !form.password || (mode === "register" && !form.name)) {
      setError("Please fill in the required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, phone: form.phone, password: form.password };

      const result = await apiFetch<{ token: string }>(endpoint, {
        method: "POST",
        body: payload
      });

      setStoredToken(result.token);
      router.push("/movies");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <section className="page-header">
        <h1 className="page-title">Login or Register</h1>
        <p className="page-subtitle">Create an account to reserve tickets and manage bookings.</p>
      </section>

      <section className="section">
        <div className="auth-card" style={{ maxWidth: 520, margin: "0 auto" }}>
          <div className="auth-tabs">
            <button className={`btn ${mode === "login" ? "" : "ghost"}`} onClick={() => setMode("login")}>
              Login
            </button>
            <button className={`btn ${mode === "register" ? "" : "ghost"}`} onClick={() => setMode("register")}>
              Register
            </button>
          </div>

          <div className="form-grid" style={{ marginTop: 18 }}>
            {mode === "register" ? (
              <input
                className="field"
                placeholder="Full name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            ) : null}
            <input
              className="field"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            {mode === "register" ? (
              <input
                className="field"
                placeholder="Phone"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              />
            ) : null}
            <input
              className="field"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
            {error ? <p className="error-text">{error}</p> : null}
            <button className="btn" onClick={submit} disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
