import Link from "next/link";

import { apiFetch } from "../../lib/api";

type SearchParams = Promise<{ movieId?: string; theatreId?: string; date?: string }>;

export default async function ShowtimesPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = await searchParams;
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => Boolean(value)) as Array<[string, string]>
  ).toString();

  const [showtimes, movies, theatres] = await Promise.all([
    apiFetch<any[]>(`/showtimes${query ? `?${query}` : ""}`),
    apiFetch<any[]>("/movies"),
    apiFetch<any[]>("/theatres")
  ]);

  return (
    <main className="container">
      <section className="page-header">
        <h1 className="page-title">Showtimes</h1>
        <p className="page-subtitle">Filter by movie, theatre, or date and jump directly into seat selection.</p>
      </section>

      <section className="section">
        <form className="form-card" method="GET">
          <div className="form-grid">
            <select className="select" name="movieId" defaultValue={filters.movieId ?? ""}>
              <option value="">All Movies</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>{movie.title}</option>
              ))}
            </select>
            <select className="select" name="theatreId" defaultValue={filters.theatreId ?? ""}>
              <option value="">All Theatres</option>
              {theatres.map((theatre) => (
                <option key={theatre.id} value={theatre.id}>{theatre.name}</option>
              ))}
            </select>
            <input className="field" name="date" type="date" defaultValue={filters.date ?? ""} />
            <button className="btn" type="submit">Apply Filters</button>
          </div>
        </form>
      </section>

      <section className="section">
        <div className="grid">
          {showtimes.map((showtime) => (
            <article className="showtime-card" key={showtime.id}>
              <div className="badge-row">
                <span className="badge">{showtime.movie.title}</span>
                <span className="badge">{showtime.theatre.name}</span>
              </div>
              <h3>{showtime.screen.name}</h3>
              <p className="muted">{new Date(showtime.startTime).toLocaleString()}</p>
              <p>
                Regular Nu. {showtime.regularPrice} · VIP Nu. {showtime.vipPrice} · Couple Nu. {showtime.couplePrice}
              </p>
              <Link href={`/seat-selection?showtimeId=${showtime.id}`} className="link-btn">
                Select Seats
              </Link>
            </article>
          ))}
          {showtimes.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <h3>No showtimes found</h3>
              <p className="muted">Try a different date or theatre.</p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
