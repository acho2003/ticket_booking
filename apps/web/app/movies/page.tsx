import { MovieCard } from "../../components/movie-card";
import { apiFetch } from "../../lib/api";

export const metadata = {
  title: "Movies - Movi",
  description: "Browse now-showing, upcoming, and past films with Movi."
};

export default async function MoviesPage() {
  const movies   = await apiFetch<any[]>("/movies");
  const nowShowing = movies.filter((m) => m.status === "NOW_SHOWING");
  const upcoming   = movies.filter((m) => m.status === "UPCOMING");
  const ended      = movies.filter((m) => m.status === "ENDED");

  return (
    <main>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="catalog-banner">
            <div>
              <div className="hero-eyebrow" style={{ marginBottom: 12 }}>🎬 Movie catalog</div>
              <h1 className="page-title">What&apos;s on in Bhutan</h1>
              <p className="page-subtitle">
                Browse show-ready titles, upcoming releases, and recently ended films.
              </p>
            </div>
            <div className="catalog-stats">
              <div className="catalog-stat">
                <strong>{nowShowing.length}</strong>
                <span>Now showing</span>
              </div>
              <div className="catalog-stat">
                <strong>{upcoming.length}</strong>
                <span>Coming soon</span>
              </div>
              <div className="catalog-stat">
                <strong>{movies.length}</strong>
                <span>Total listed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {nowShowing.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Now Showing</h2>
                <p className="section-sub">Reserve today — pay when you arrive at the counter.</p>
              </div>
            </div>
            <div className="grid movies">
              {nowShowing.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
            </div>
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Coming Soon</h2>
                <p className="section-sub">Titles headed to Bhutanese cinemas soon.</p>
              </div>
            </div>
            <div className="grid movies">
              {upcoming.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
            </div>
          </div>
        </section>
      )}

      {ended.length > 0 && (
        <section className="section" style={{ paddingTop: 0, paddingBottom: 64 }}>
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Recently Ended</h2>
                <p className="section-sub">Past titles kept for reference and reporting.</p>
              </div>
            </div>
            <div className="grid movies">
              {ended.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
            </div>
          </div>
        </section>
      )}

      {movies.length === 0 && (
        <section className="section">
          <div className="container">
            <div className="empty-state">
              <h3>No movies yet</h3>
              <p>Add movies from the admin dashboard to populate this page.</p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
