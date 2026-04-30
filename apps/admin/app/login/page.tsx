"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { adminApiFetch, setAdminToken } from "../../lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await adminApiFetch<{ token: string }>("/auth/login", {
        method: "POST",
        body: { email, password }
      });
      setAdminToken(result.token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      void submit();
    }
  };

  return (
    <div className="login-shell">
      <section className="login-story">
        <div className="login-logo">
          <img src="/movi-logo.png" alt="Movi logo" style={{ width: "86%", height: "86%", objectFit: "contain" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, marginTop: 90 }}>
          <div className="eyebrow">Movi admin</div>
          <h1 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", letterSpacing: "-0.055em", marginTop: 12 }}>
            Built for busy cinema nights.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", marginTop: 14, maxWidth: 390 }}>
            Manage showtimes, halls, and counter confirmations from one calm workspace.
          </p>
        </div>
      </section>

      <section className="login-card">
        <div style={{ marginBottom: 22 }}>
          <div className="eyebrow">Secure access</div>
          <h2 style={{ fontSize: "1.55rem", letterSpacing: "-0.04em", marginTop: 6 }}>Sign in to the desk</h2>
          <p className="muted" style={{ marginTop: 5 }}>Super admin and theatre admin access.</p>
          <p className="muted" style={{ marginTop: 7, fontSize: "0.75rem", fontWeight: 800 }}>Powered by CUDIS SoftLab</p>
        </div>

        <div className="form-card" style={{ padding: 0, border: 0, boxShadow: "none", background: "transparent" }}>
          <div className="form-grid">
            <div className="field-group">
              <label className="field-label" htmlFor="email">Email address</label>
              <input
                id="email"
                className="field"
                type="email"
                placeholder="admin@bhutanmovies.bt"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={handleKey}
                autoComplete="email"
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="field"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={handleKey}
                autoComplete="current-password"
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button className="btn" style={{ width: "100%", padding: "11px" }} onClick={submit} disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
