"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "../components/page-header";
import { adminApiFetch, getAdminToken } from "../lib/api";

export default function DashboardPage() {
  const [overview, setOverview] = useState<any | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = getAdminToken();
        const data = await adminApiFetch("/admin/dashboard/overview", { token });
        setOverview(data);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load overview");
      }
    };

    void load();
  }, []);

  return (
    <div className="grid">
      <PageHeader
        title="Dashboard Overview"
        subtitle="Track the current state of movies, theatres, showtimes, and bookings."
      />
      {error ? <p className="error">{error}</p> : null}

      <section className="grid stats-grid">
        {[
          ["Movies", overview?.movies ?? 0],
          ["Theatres", overview?.theatres ?? 0],
          ["Showtimes", overview?.showtimes ?? 0],
          ["Bookings", overview?.bookings ?? 0]
        ].map(([label, value]) => (
          <article key={label} className="stat-card">
            <span className="pill">{label}</span>
            <h3>{value}</h3>
            <p className="muted">Current total</p>
          </article>
        ))}
      </section>

      <section className="grid two-column">
        <article className="report-card">
          <span className="pill">Quick Actions</span>
          <h3>Daily operations</h3>
          <p className="muted">
            Keep the booking flow moving by updating today&apos;s showtimes, checking availability,
            and confirming counter payments.
          </p>
          <div className="quick-links">
            <a className="btn-link" href="/showtimes">Manage Showtimes</a>
            <a className="btn-link" href="/bookings">Confirm Bookings</a>
            <a className="btn-link" href="/seats">Edit Seat Layouts</a>
          </div>
        </article>

        <article className="report-card report-highlight">
          <span className="pill">Platform Snapshot</span>
          <h3>What matters most</h3>
          <ul className="insight-list">
            <li>Make sure active movies are assigned to the correct screens.</li>
            <li>Keep seat layouts accurate before customers start booking.</li>
            <li>Confirm bookings after cash is collected at the counter.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
