"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch, setStoredToken } from "../../lib/api";

type Mode = "login" | "register";

export default function LoginPage() {
  const router  = useRouter();
  const [mode, setMode]  = useState<Mode>("login");
  const [form, setForm]  = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((c) => ({ ...c, [key]: e.target.value }));

  const submit = async () => {
    if (!form.email || !form.password || (mode === "register" && !form.name)) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload  =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, phone: form.phone, password: form.password };

      const result = await apiFetch<{ token: string }>(endpoint, { method: "POST", body: payload });
      setStoredToken(result.token);
      router.push("/movies");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-outer">
      <div className="container">
        <div className="auth-card">
          <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <p className="muted" style={{ fontSize: "0.875rem", marginTop: 4, marginBottom: 20 }}>
            {mode === "login"
              ? "Sign in to view and manage your bookings."
              : "Register to reserve tickets and track your bookings."}
          </p>

          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setError(""); }}>
              Login
            </button>
            <button className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => { setMode("register"); setError(""); }}>
              Register
            </button>
          </div>

          {/* Form */}
          <div className="form-grid">
            {mode === "register" && (
              <div className="field-group">
                <label className="field-label" htmlFor="name">Full name</label>
                <input id="name" className="field" placeholder="Your name" value={form.name} onChange={update("name")} />
              </div>
            )}

            <div className="field-group">
              <label className="field-label" htmlFor="email">Email address</label>
              <input id="email" className="field" type="email" placeholder="you@example.com" value={form.email} onChange={update("email")} />
            </div>

            {mode === "register" && (
              <div className="field-group">
                <label className="field-label" htmlFor="phone">Phone <span className="muted">(optional)</span></label>
                <input id="phone" className="field" placeholder="+975 ..." value={form.phone} onChange={update("phone")} />
              </div>
            )}

            <div className="field-group">
              <label className="field-label" htmlFor="password">Password</label>
              <input id="password" className="field" type="password" placeholder="••••••••" value={form.password} onChange={update("password")} />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button className="btn lg" style={{ width: "100%", marginTop: 4 }} onClick={submit} disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Login" : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
