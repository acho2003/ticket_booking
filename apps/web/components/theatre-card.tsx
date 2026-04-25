import type { TheatreSummary } from "@bhutan/shared";

export function TheatreCard({ theatre }: { theatre: TheatreSummary }) {
  return (
    <article className="theatre-card">
      <div className="badge-row">
        <span className="badge">{theatre.city}</span>
        <span className="badge">Pay at Counter</span>
      </div>
      <h3>{theatre.name}</h3>
      <p>{theatre.location}</p>
      <p className="muted">{theatre.description}</p>
      <div className="cta-row">
        <a className="link-btn" href={`/showtimes?theatreId=${theatre.id}`}>
          View Showtimes
        </a>
      </div>
    </article>
  );
}
