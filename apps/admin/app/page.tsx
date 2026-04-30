"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "../components/page-header";
import { adminApiFetch, getAdminToken } from "../lib/api";

const PRIMARY_ACTIONS = [
  {
    href: "/bookings",
    label: "Serve a customer",
    description: "Search their booking code, collect cash, and confirm the ticket without leaving the counter.",
    tone: "primary"
  },
  {
    href: "/showtimes",
    label: "Open today's show",
    description: "Pick the movie, screen, time, and prices for the cinema day.",
    tone: "primary"
  },
  {
    href: "/seats",
    label: "Tune the hall",
    description: "Adjust rows, aisles, blocked seats, First Class, and Balcony sections.",
    tone: "neutral"
  },
  {
    href: "/movies",
    label: "Prepare a title",
    description: "Add the poster, trailer, runtime, and prices before the show goes live.",
    tone: "neutral"
  }
];

const SETUP_FLOW = [
  { href: "/theatres", label: "1. Theatre", detail: "Add cinema location" },
  { href: "/screens", label: "2. Screen", detail: "Create halls inside theatre" },
  { href: "/seats", label: "3. Seats", detail: "Build the real hall layout" },
  { href: "/movies", label: "4. Movie", detail: "Add poster, trailer, and pricing" },
  { href: "/showtimes", label: "5. Showtime", detail: "Open booking for the day" }
];

const SECONDARY_ACTIONS = [
  { href: "/pricing", label: "Update pricing", detail: "Change movie defaults or showtime overrides." },
  { href: "/reports", label: "View reports", detail: "Track bookings, status, and revenue." },
  { href: "/admin-users", label: "Manage admins", detail: "Assign theatre admins and control access." }
];

export default function DashboardPage() {
  const [overview, setOverview] = useState<any | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = getAdminToken();
        const data = await adminApiFetch("/admin/dashboard/overview", { token });
        setOverview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load overview");
      }
    };
    void load();
  }, []);

  const stats = [
    { label: "Movies", value: overview?.movies ?? "-", hint: "Total titles", href: "/movies" },
    { label: "Theatres", value: overview?.theatres ?? "-", hint: "Venues", href: "/theatres" },
    { label: "Showtimes", value: overview?.showtimes ?? "-", hint: "Scheduled", href: "/showtimes" },
    { label: "Bookings", value: overview?.bookings ?? "-", hint: "All time", href: "/bookings" }
  ];

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Good evening, operator."
        subtitle="A calmer workspace for the few things that matter most: open the show, help the counter, and keep each hall accurate."
      />

      {error ? <p className="error">{error}</p> : null}

      <section className="hero-panel">
        <div>
          <span className="pill primary">Today&apos;s board</span>
          <h2>Start with the job, not the menu.</h2>
          <p>
            Movi admin is arranged around real cinema work: counter checks first, then show setup, hall layout, and movie readiness.
          </p>
        </div>
        <div className="hero-action-grid">
          {PRIMARY_ACTIONS.map((action) => (
            <a key={action.href} className={`task-card ${action.tone === "primary" ? "featured" : ""}`} href={action.href}>
              <span>{action.label}</span>
              <small>{action.description}</small>
            </a>
          ))}
        </div>
      </section>

      <div className="grid stats-grid">
        {stats.map(({ label, value, hint, href }) => (
          <a key={label} className="stat-card stat-card-link" href={href}>
            <div className="stat-card-label">{label}</div>
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-hint">{hint}</div>
          </a>
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="report-card">
          <div className="section-intro">
            <span className="pill primary">Setup flow</span>
            <h3>From empty hall to open bookings</h3>
          </div>
          <div className="workflow-list">
            {SETUP_FLOW.map((step) => (
              <a key={step.href} href={step.href} className="workflow-step">
                <strong>{step.label}</strong>
                <span>{step.detail}</span>
              </a>
            ))}
          </div>
        </article>

        <article className="report-card">
          <div className="section-intro">
            <span className="pill primary">Operations</span>
            <h3>After sales are live</h3>
          </div>
          <div className="simple-action-list">
            {SECONDARY_ACTIONS.map((action) => (
              <a key={action.href} href={action.href} className="simple-action">
                <div>
                  <strong>{action.label}</strong>
                  <span>{action.detail}</span>
                </div>
                <span aria-hidden="true">-&gt;</span>
              </a>
            ))}
          </div>
        </article>

        <article className="report-card highlight">
          <div className="section-intro">
            <span className="pill primary">Counter mode</span>
            <h3>Fast when someone is waiting</h3>
          </div>
          <p className="muted" style={{ marginBottom: 16 }}>
            Keep this flow simple: search code, confirm payment at the counter, then send the customer to the hall.
          </p>
          <a className="btn" href="/bookings">Check booking code</a>
        </article>
      </div>
    </div>
  );
}
