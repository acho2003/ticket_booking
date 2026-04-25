"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "../../components/page-header";
import { adminApiFetch, getAdminToken } from "../../lib/api";

export default function ScreenManagementPage() {
  const token = getAdminToken();
  const [theatres, setTheatres] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [theatreId, setTheatreId] = useState("");
  const [form, setForm] = useState({ name: "", totalRows: 10, totalColumns: 12 });
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const result = await adminApiFetch<any[]>("/theatres");
      setTheatres(result);
      if (result[0]) {
        setTheatreId(result[0].id);
      }
    };

    void load().catch((requestError) => {
      setError(requestError instanceof Error ? requestError.message : "Failed to load theatres");
    });
  }, []);

  useEffect(() => {
    if (!theatreId || !token) {
      return;
    }

    void adminApiFetch<any[]>(`/admin/theatres/${theatreId}/screens`, { token })
      .then(setScreens)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Failed to load screens"));
  }, [theatreId, token]);

  const createScreen = async () => {
    try {
      await adminApiFetch(`/admin/theatres/${theatreId}/screens`, {
        method: "POST",
        token,
        body: {
          ...form,
          totalRows: Number(form.totalRows),
          totalColumns: Number(form.totalColumns)
        }
      });
      const updated = await adminApiFetch<any[]>(`/admin/theatres/${theatreId}/screens`, { token });
      setScreens(updated);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create screen");
    }
  };

  return (
    <div className="grid">
      <PageHeader title="Screen Management" subtitle="Add screens inside a theatre and view the generated layouts." />
      <section className="grid two-column">
        <div className="form-card">
          <h3>Create Screen</h3>
          <div className="form-grid">
            <select className="select" value={theatreId} onChange={(event) => setTheatreId(event.target.value)}>
              {theatres.map((theatre) => (
                <option key={theatre.id} value={theatre.id}>{theatre.name}</option>
              ))}
            </select>
            <input className="field" placeholder="Screen name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <input className="field" type="number" placeholder="Rows" value={form.totalRows} onChange={(event) => setForm((current) => ({ ...current, totalRows: Number(event.target.value) }))} />
            <input className="field" type="number" placeholder="Columns" value={form.totalColumns} onChange={(event) => setForm((current) => ({ ...current, totalColumns: Number(event.target.value) }))} />
            {error ? <p className="error">{error}</p> : null}
            <button className="btn" onClick={createScreen}>Create Screen</button>
          </div>
        </div>
        <div className="table-card">
          <h3>Available Screens</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Rows</th>
                <th>Columns</th>
                <th>Seats</th>
              </tr>
            </thead>
            <tbody>
              {screens.map((screen) => (
                <tr key={screen.id}>
                  <td>{screen.name}</td>
                  <td>{screen.totalRows}</td>
                  <td>{screen.totalColumns}</td>
                  <td>{screen.seats?.length ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
