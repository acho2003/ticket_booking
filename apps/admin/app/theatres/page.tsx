"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "../../components/page-header";
import { adminApiFetch, getAdminToken } from "../../lib/api";

export default function TheatreManagementPage() {
  const token = getAdminToken();
  const [theatres, setTheatres] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", city: "", location: "", description: "", contactNumber: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const result = await adminApiFetch<any[]>("/theatres");
      setTheatres(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load theatres");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createTheatre = async () => {
    try {
      await adminApiFetch("/admin/theatres", {
        method: "POST",
        token,
        body: form
      });
      setMessage("Theatre created successfully.");
      setError("");
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create theatre");
    }
  };

  return (
    <div className="grid">
      <PageHeader title="Theatre Management" subtitle="Create theatres and manage core theatre information." />
      <section className="grid two-column">
        <div className="form-card">
          <h3>Add Theatre</h3>
          <div className="form-grid">
            {Object.entries(form).map(([key, value]) => (
              <input key={key} className="field" placeholder={key} value={value} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} />
            ))}
            {message ? <p className="success">{message}</p> : null}
            {error ? <p className="error">{error}</p> : null}
            <button className="btn" onClick={createTheatre}>Create Theatre</button>
          </div>
        </div>
        <div className="table-card">
          <h3>Current Theatres</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Location</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {theatres.map((theatre) => (
                <tr key={theatre.id}>
                  <td>{theatre.name}</td>
                  <td>{theatre.city}</td>
                  <td>{theatre.location}</td>
                  <td>{theatre.contactNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
