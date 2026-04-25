"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "../../components/page-header";
import { adminApiFetch, getAdminToken } from "../../lib/api";

export default function ReportsPage() {
  const [report, setReport] = useState<any | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = getAdminToken();
        const result = await adminApiFetch("/admin/reports/bookings", { token });
        setReport(result);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load reports");
      }
    };

    void load();
  }, []);

  return (
    <div className="grid">
      <PageHeader title="Booking Reports" subtitle="Review theatre-wise booking volume and confirmed revenue." />
      {error ? <p className="error">{error}</p> : null}
      <section className="grid stats-grid">
        {[
          ["Total Bookings", report?.totalBookings ?? 0],
          ["Reserved", report?.reservedBookings ?? 0],
          ["Confirmed", report?.confirmedBookings ?? 0],
          ["Cancelled", report?.cancelledBookings ?? 0]
        ].map(([label, value]) => (
          <article className="stat-card" key={label}>
            <h3>{value}</h3>
            <p className="muted">{label}</p>
          </article>
        ))}
      </section>
      <section className="grid">
        {(report?.theatreBreakdown ?? []).map((item: any) => (
          <article className="report-card" key={item.theatre}>
            <h3>{item.theatre}</h3>
            <p>Total bookings: {item.totalBookings}</p>
            <p>Confirmed revenue: Nu. {item.revenue.toFixed(2)}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
