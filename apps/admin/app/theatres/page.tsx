"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "../../components/page-header";
import { adminApiFetch, getAdminToken } from "../../lib/api";

const FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: "name",          label: "Theatre name",    placeholder: "e.g. Norling Cineplex"   },
  { key: "city",          label: "City",            placeholder: "e.g. Thimphu"            },
  { key: "location",      label: "Location",        placeholder: "Street / area"           },
  { key: "description",   label: "Description",     placeholder: "Brief description"       },
  { key: "contactNumber", label: "Contact number",  placeholder: "+975 …"                  }
];

export default function TheatreManagementPage() {
  const token = getAdminToken();
  const [theatres, setTheatres] = useState<any[]>([]);
  const [form, setForm]         = useState({ name: "", city: "", location: "", description: "", contactNumber: "" });
  const [message, setMessage]   = useState("");
  const [error, setError]       = useState("");

  const load = async () => {
    const result = await adminApiFetch<any[]>("/theatres");
    setTheatres(result);
  };
  useEffect(() => { void load().catch((e) => setError(String(e))); }, []);

  const createTheatre = async () => {
    setMessage(""); setError("");
    try {
      await adminApiFetch("/admin/theatres", { method: "POST", token, body: form });
      setMessage("Theatre created.");
      setForm({ name: "", city: "", location: "", description: "", contactNumber: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create theatre");
    }
  };

  return (
    <div className="grid">
      <PageHeader title="Theatres" subtitle="Create theatres and manage their core information." />

      <div className="grid two-col">
        {/* Form */}
        <article className="form-card">
          <div className="section-intro">
            <span className="pill primary">New venue</span>
            <h3>Add Theatre</h3>
          </div>
          <div className="form-grid">
            {FIELDS.map(({ key, label, placeholder }) => (
              <div key={key} className="field-group">
                <label className="field-label" htmlFor={key}>{label}</label>
                <input
                  id={key}
                  className="field"
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((c) => ({ ...c, [key]: e.target.value }))}
                />
              </div>
            ))}
            {message && <p className="success">{message}</p>}
            {error   && <p className="error">{error}</p>}
            <button className="btn" onClick={createTheatre}>Create Theatre</button>
          </div>
        </article>

        {/* Table */}
        <article className="table-card">
          <div className="section-intro">
            <h3>Current Theatres</h3>
            <p className="muted">{theatres.length} venue{theatres.length !== 1 ? "s" : ""} listed</p>
          </div>
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
              {theatres.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", paddingTop: 24 }}>No theatres yet.</td></tr>
              )}
              {theatres.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td>{t.city}</td>
                  <td>{t.location}</td>
                  <td>{t.contactNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>
    </div>
  );
}
