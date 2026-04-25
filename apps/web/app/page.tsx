import { MovieCard } from "../components/movie-card";
import { TheatreCard } from "../components/theatre-card";
import { apiFetch } from "../lib/api";

export default async function HomePage() {
  const [nowShowing, upcoming, theatres] = await Promise.all([
    apiFetch<any[]>("/movies?status=NOW_SHOWING"),
    apiFetch<any[]>("/movies?status=UPCOMING"),
    apiFetch<any[]>("/theatres")
  ]);

  const featuredMovie = nowShowing[0];

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="hero-card">
            <div className="hero-grid">
              <span className="eyebrow">Bhutan-first movie reservations</span>
              <h1>Pick a film, choose your theatre, and lock your seats before you travel.</h1>
              <p className="hero-copy">
                A cleaner booking flow for Bhutanese moviegoers with live seat maps, clear pricing,
                instant booking codes, and a simple pay-at-counter experience.
              </p>
              <div className="cta-row">
                <a className="link-btn" href="/movies">Browse Movies</a>
                <a className="link-btn secondary" href="/showtimes">Find Showtimes</a>
              </div>
              <div className="hero-steps">
                {["Choose movie", "Pick theatre", "Select seats", "Get booking code"].map((step, index) => (
                  <div className="step-chip" key={step}>
                    <span>{index + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-spotlight">
              {featuredMovie ? (
                <>
                  <img className="spotlight-poster" src={featuredMovie.posterUrl} alt={featuredMovie.title} />
                  <div className="spotlight-copy">
                    <span className="badge badge-dark">Featured Tonight</span>
                    <h2>{featuredMovie.title}</h2>
                    <p>{featuredMovie.description}</p>
                    <div className="spotlight-stats">
                      <div className="spotlight-stat">
                        <strong>{nowShowing.length}</strong>
                        <span>Now Showing</span>
                      </div>
                      <div className="spotlight-stat">
                        <strong>{upcoming.length}</strong>
                        <span>Upcoming</span>
                      </div>
                      <div className="spotlight-stat">
                        <strong>{theatres.length}</strong>
                        <span>Theatres</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="stat-card">
                  <h3>Platform Ready</h3>
                  <p className="muted">
                    Your storefront is set up. Add movies and showtimes from the admin dashboard to bring it to life.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Now Showing</h2>
              <p className="section-copy muted">Reserve seats today and receive a booking code instantly.</p>
            </div>
            <a className="link-btn ghost" href="/movies">See Full Catalog</a>
          </div>
          <div className="grid movies">
            {nowShowing.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Upcoming Movies</h2>
              <p className="muted">Plan ahead and see what is arriving next across Bhutan.</p>
            </div>
          </div>
          <div className="grid movies">
            {upcoming.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Where To Watch</h2>
              <p className="muted">Compare locations, theatre details, and available showtimes.</p>
            </div>
          </div>
          <div className="grid theatres">
            {theatres.map((theatre) => <TheatreCard key={theatre.id} theatre={theatre} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
