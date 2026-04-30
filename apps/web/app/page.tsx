import { MovieCard } from "../components/movie-card";
import { TheatreCard } from "../components/theatre-card";
import { apiFetch, resolveApiAssetUrl } from "../lib/api";

export default async function HomePage() {
  const [nowShowing, upcoming, theatres] = await Promise.all([
    apiFetch<any[]>("/movies?status=NOW_SHOWING"),
    apiFetch<any[]>("/movies?status=UPCOMING"),
    apiFetch<any[]>("/theatres")
  ]);

  const featured = nowShowing[0];

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div>
              <div className="hero-eyebrow">Movi - Powered by CUDIS SoftLab</div>
              <h1>Movi.<br />Your seat, your show.</h1>
              <p className="hero-subtitle">
                Browse films showing across Bhutan, pick your seats from a live map,
                get an instant booking code, and pay when you arrive.
              </p>
              <p className="hero-powered">Powered by CUDIS SoftLab</p>
              <div className="cta-row">
                <a className="link-btn lg" href="/movies">Browse Movies</a>
                <a className="link-btn secondary lg" href="/showtimes">Find Showtimes</a>
              </div>
              <div className="steps-row">
                {["Choose a film", "Pick your seats", "Get booking code", "Pay at counter"].map((step, i) => (
                  <div key={step} className="step">
                    <span className="step-num">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {featured ? (
              <div className="featured-card">
                {featured.posterUrl ? (
                  <img className="featured-poster" src={resolveApiAssetUrl(featured.posterUrl)} alt={featured.title} />
                ) : null}
                <div className="featured-body">
                  <div className="badge-row">
                    <span className="badge primary">Featured Tonight</span>
                    {featured.genre ? <span className="badge">{featured.genre}</span> : null}
                  </div>
                  <div className="featured-title">{featured.title}</div>
                  <p className="featured-desc">
                    {featured.description?.slice(0, 120)}
                    {featured.description?.length > 120 ? "..." : ""}
                  </p>
                  <div className="featured-stats">
                    <div className="featured-stat">
                      <strong>{nowShowing.length}</strong>
                      <span>Showing</span>
                    </div>
                    <div className="featured-stat">
                      <strong>{upcoming.length}</strong>
                      <span>Coming</span>
                    </div>
                    <div className="featured-stat">
                      <strong>{theatres.length}</strong>
                      <span>Theatres</span>
                    </div>
                  </div>
                  <a className="link-btn" href={`/showtimes?movieId=${featured.id}`} style={{ marginTop: 4 }}>
                    Book Tickets
                  </a>
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 32, textAlign: "left" }}>
                <h3>Platform is live</h3>
                <p>Add movies and showtimes from the admin dashboard to bring it to life.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {nowShowing.length > 0 ? (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Now Showing</h2>
                <p className="section-sub">Reserve today, pay when you arrive at the theatre.</p>
              </div>
              <a className="link-btn ghost sm" href="/movies">Full catalog &rarr;</a>
            </div>
            <div className="grid movies">
              {nowShowing.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
            </div>
          </div>
        </section>
      ) : null}

      {upcoming.length > 0 ? (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Coming Soon</h2>
                <p className="section-sub">What's arriving next across Bhutan's cinemas.</p>
              </div>
            </div>
            <div className="grid movies">
              {upcoming.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
            </div>
          </div>
        </section>
      ) : null}

      {theatres.length > 0 ? (
        <section className="section" style={{ paddingTop: 0, paddingBottom: 64 }}>
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Where to Watch</h2>
                <p className="section-sub">Compare locations and available showtimes.</p>
              </div>
              <a className="link-btn ghost sm" href="/theatres">All theatres &rarr;</a>
            </div>
            <div className="grid theatres">
              {theatres.map((theatre) => <TheatreCard key={theatre.id} theatre={theatre} />)}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
