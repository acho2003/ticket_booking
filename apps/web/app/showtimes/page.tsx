import Link from "next/link";

import { apiFetch } from "../../lib/api";

type SearchParams = Promise<{ movieId?: string; theatreId?: string; date?: string }>;

export const metadata = {
  title: "Showtimes - Movi",
  description: "Find showtimes by movie, theatre, or date and book your seats."
};

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function canBook(showtime: any) {
  return showtime.canBook !== false && !["CLOSED", "COMPLETED", "CANCELLED"].includes(showtime.bookingStatus);
}

export default async function ShowtimesPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = await searchParams;
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => Boolean(v)) as Array<[string, string]>
  ).toString();

  const [showtimes, movies, theatres] = await Promise.all([
    apiFetch<any[]>(`/showtimes${query ? `?${query}` : ""}`),
    apiFetch<any[]>("/movies"),
    apiFetch<any[]>("/theatres")
  ]);

  const hasFilters = Boolean(filters.movieId || filters.theatreId || filters.date);

  return (
    <main>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <h1 className="page-title">Showtimes</h1>
          <p className="page-subtitle">Filter by movie, theatre, or date — then jump straight into seat selection.</p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="section" style={{ paddingTop: 24, paddingBottom: 0 }}>
        <div className="container">
          <form className="filter-bar" method="GET">
            <div className="field-group" style={{ flex: 1, minWidth: 160 }}>
              <label className="field-label" htmlFor="movieId">Movie</label>
              <select id="movieId" className="select" name="movieId" defaultValue={filters.movieId ?? ""}>
                <option value="">All Movies</option>
                {movies.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
            <div className="field-group" style={{ flex: 1, minWidth: 160 }}>
              <label className="field-label" htmlFor="theatreId">Theatre</label>
              <select id="theatreId" className="select" name="theatreId" defaultValue={filters.theatreId ?? ""}>
                <option value="">All Theatres</option>
                {theatres.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="field-group" style={{ minWidth: 160 }}>
              <label className="field-label" htmlFor="date">Date</label>
              <input id="date" className="field" name="date" type="date" defaultValue={filters.date ?? ""} />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <button className="btn" type="submit">Apply</button>
              {hasFilters && (
                <a className="btn secondary" href="/showtimes">Clear</a>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="section" style={{ paddingBottom: 64 }}>
        <div className="container">
          {showtimes.length > 0 ? (
            <>
              <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: 16 }}>
                {showtimes.length} showtime{showtimes.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid stack">
                {showtimes.map((showtime) => {
                  const dt = new Date(showtime.startTime);
                  return (
                    <article key={showtime.id} className="showtime-card">
                      <div className="showtime-info">
                        <h3>{showtime.movie.title}</h3>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-2)", marginTop: 2 }}>
                          {showtime.theatre.name} · {showtime.screen.name}
                        </p>
                        <p style={{ fontSize: "0.875rem", color: "var(--text-2)", marginTop: 6 }}>
                          {dt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                          {" · "}
                          {dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                        </p>
                        <div className="showtime-pricing">
                          <span><span className="price-label">First Class </span><span className="price-val">Nu.{showtime.regularPrice}</span></span>
                          <span><span className="price-label">Balcony </span><span className="price-val">Nu.{showtime.vipPrice}</span></span>
                        </div>
                        <p style={{ fontSize: "0.82rem", color: canBook(showtime) ? "var(--muted)" : "var(--danger)", marginTop: 8, fontWeight: 700 }}>
                          {canBook(showtime)
                            ? `Booking closes at ${formatTime(showtime.bookingClosesAt)}`
                            : "Booking closed for this show."}
                        </p>
                      </div>
                      {canBook(showtime) ? (
                        <Link href={`/seat-selection?showtimeId=${showtime.id}`} className="link-btn">
                          Select Seats
                        </Link>
                      ) : (
                        <span className="link-btn disabled" aria-disabled="true">
                          Booking Closed
                        </span>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h3>No showtimes found</h3>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
