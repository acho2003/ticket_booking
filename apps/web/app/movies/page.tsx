import { MovieCard } from "../../components/movie-card";
import { apiFetch } from "../../lib/api";

export default async function MoviesPage() {
  const movies = await apiFetch<any[]>("/movies");
  const nowShowing = movies.filter((movie) => movie.status === "NOW_SHOWING");
  const upcoming = movies.filter((movie) => movie.status === "UPCOMING");
  const ended = movies.filter((movie) => movie.status === "ENDED");

  return (
    <main className="container">
      <section className="page-header">
        <div className="catalog-banner">
          <div className="stack">
            <span className="eyebrow">Movie catalog</span>
            <h1 className="page-title">Browse what&apos;s playing now and what&apos;s arriving next.</h1>
            <p className="page-subtitle">
              Explore show-ready titles, upcoming releases, and the films recently wrapped across Bhutan&apos;s theatres.
            </p>
          </div>
          <div className="catalog-stats">
            <div className="summary-card">
              <strong>{nowShowing.length}</strong>
              <span>Now showing</span>
            </div>
            <div className="summary-card">
              <strong>{upcoming.length}</strong>
              <span>Coming soon</span>
            </div>
            <div className="summary-card">
              <strong>{movies.length}</strong>
              <span>Total listed</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Now Showing</h2>
            <p className="muted">Reserve these titles today and pay when you arrive at the counter.</p>
          </div>
        </div>
        <div className="grid movies">
          {nowShowing.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {upcoming.length ? (
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Upcoming</h2>
              <p className="muted">Keep an eye on the next titles headed to Bhutanese cinemas.</p>
            </div>
          </div>
          <div className="grid movies">
            {upcoming.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      ) : null}

      {ended.length ? (
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Recently Ended</h2>
              <p className="muted">Past titles stay visible here for reference and future reporting.</p>
            </div>
          </div>
          <div className="grid movies">
            {ended.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
