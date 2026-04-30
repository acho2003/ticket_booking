import type { TheatreSummary } from "@bhutan/shared";

export function TheatreCard({ theatre }: { theatre: TheatreSummary }) {
  return (
    <article className="theatre-card">
      <div className="badge-row">
        <span className="badge">{theatre.city}</span>
        <span className="badge primary">Pay at Counter</span>
      </div>
      <h3>{theatre.name}</h3>
      <p className="theatre-location">📍 {theatre.location}</p>
      {theatre.description ? (
        <p className="theatre-desc">{theatre.description}</p>
      ) : null}
      {theatre.contactNumber ? (
        <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>☎ {theatre.contactNumber}</p>
      ) : null}
      <div style={{ marginTop: "auto", paddingTop: "10px" }}>
        <a className="link-btn" style={{ width: "100%", justifyContent: "center" }} href={`/showtimes?theatreId=${theatre.id}`}>
          View Showtimes
        </a>
      </div>
    </article>
  );
}
