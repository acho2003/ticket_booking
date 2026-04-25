"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "../../components/page-header";
import { adminApiFetch, getAdminToken } from "../../lib/api";

export default function AdminUsersPage() {
  const token = getAdminToken();
  const [admins, setAdmins] = useState<any[]>([]);
  const [theatres, setTheatres] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", theatreId: "" });

  const load = async () => {
    try {
      const [adminResult, theatreResult] = await Promise.all([
        adminApiFetch<any[]>("/admin/theatre-admins", { token }),
        adminApiFetch<any[]>("/theatres")
      ]);
      setAdmins(adminResult);
      setTheatres(theatreResult);
      if (!form.theatreId && theatreResult[0]) {
        setForm((current) => ({ ...current, theatreId: theatreResult[0].id }));
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load admin users");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createAdmin = async () => {
    try {
      await adminApiFetch("/admin/theatre-admins", {
        method: "POST",
        token,
        body: form
      });
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create theatre admin");
    }
  };

  return (
    <div className="grid">
      <PageHeader title="Admin Users" subtitle="Assign theatre admins to specific theatres. Super admin access only." />
      <section className="grid two-column">
        <div className="form-card">
          <h3>Create Theatre Admin</h3>
          <div className="form-grid">
            <input className="field" placeholder="Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <input className="field" placeholder="Email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            <input className="field" placeholder="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
            <input className="field" type="password" placeholder="Password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
            <select className="select" value={form.theatreId} onChange={(event) => setForm((current) => ({ ...current, theatreId: event.target.value }))}>
              {theatres.map((theatre) => <option key={theatre.id} value={theatre.id}>{theatre.name}</option>)}
            </select>
            {error ? <p className="error">{error}</p> : null}
            <button className="btn" onClick={createAdmin}>Create Theatre Admin</button>
          </div>
        </div>
        <div className="table-card">
          <h3>Theatre Admin Accounts</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Theatre</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>{admin.theatreAssignments[0]?.theatre?.name ?? "Unassigned"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
