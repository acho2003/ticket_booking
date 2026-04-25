import Link from "next/link";

import { apiFetch } from "../../../lib/api";

export default async function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await apiFetch<any>(`/movies/${id}`);

  return (
    <main className="container">
      <section className="page-header">
        <h1 className="page-title">{movie.title}</h1>
        <p className="page-subtitle">{movie.description}</p>
      </section>

      <section className="section detail-layout">
        <div className="detail-card">
          <img className="detail-poster" src={movie.posterUrl} alt={movie.title} />
        </div>
        <div className="detail-card">
          <div className="badge-row">
            <span className="badge">{movie.status.replace("_", " ")}</span>
            <span className="badge">{movie.genre}</span>
            <span className="badge">{movie.language}</span>
          </div>
          <div className="key-value-grid">
            <div className="key-value">
              <strong>Duration</strong>
              <div>{movie.durationMinutes} minutes</div>
            </div>
            <div className="key-value">
              <strong>Rating</strong>
              <div>{movie.rating}</div>
            </div>
            <div className="key-value">
              <strong>Release Date</strong>
              <div>{new Date(movie.releaseDate).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="cta-row" style={{ marginTop: 18 }}>
            <Link href={`/showtimes?movieId=${movie.id}`} className="link-btn">
              Select Showtime
            </Link>
            {movie.trailerUrl ? (
              <a href={movie.trailerUrl} target="_blank" className="link-btn secondary" rel="noreferrer">
                Watch Trailer
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Available Showtimes</h2>
            <p className="muted">Choose a theatre and continue to seat selection.</p>
          </div>
        </div>
        <div className="grid">
          {movie.showtimes.map((showtime: any) => (
            <article className="showtime-card" key={showtime.id}>
              <h3>{showtime.theatre.name}</h3>
              <p className="muted">{showtime.screen.name}</p>
              <p>{new Date(showtime.startTime).toLocaleString()}</p>
              <p>Regular: Nu. {showtime.regularPrice} · VIP: Nu. {showtime.vipPrice}</p>
              <Link className="link-btn" href={`/seat-selection?showtimeId=${showtime.id}`}>
                Choose Seats
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
