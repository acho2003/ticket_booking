"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { adminApiFetch, setAdminToken } from "../../lib/api";
import { PageHeader } from "../../components/page-header";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await adminApiFetch<{ token: string }>("/auth/login", {
        method: "POST",
        body: { email, password }
      });
      setAdminToken(result.token);
      router.push("/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Admin Login" subtitle="Use a super admin or theatre admin account to access the dashboard." />
      <div className="form-card" style={{ maxWidth: 460 }}>
        <div className="form-grid">
          <input className="field" type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <input className="field" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {error ? <p className="error">{error}</p> : null}
          <button className="btn" onClick={submit} disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
        </div>
      </div>
    </div>
  );
}
