import Link from "next/link";

import { apiFetch, resolveApiAssetUrl } from "../../../lib/api";

function getTrailerEmbedUrl(trailerUrl?: string | null) {
  if (!trailerUrl) {
    return null;
  }

  try {
    const parsed = new URL(trailerUrl);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return trailerUrl;
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/").filter(Boolean)[1];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export default async function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await apiFetch<any>(`/movies/${id}`);
  const trailerEmbedUrl = getTrailerEmbedUrl(movie.trailerUrl);

  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="detail-layout">
            <div>
              {movie.posterUrl ? (
                <img className="detail-poster" src={resolveApiAssetUrl(movie.posterUrl)} alt={movie.title} />
              ) : (
                <div
                  className="detail-poster"
                  style={{
                    background: "var(--bg-2)",
                    aspectRatio: "2/3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--muted)"
                  }}
                >
                  No poster
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
              <div>
                <div className="badge-row" style={{ marginBottom: 12 }}>
                  <span className="badge primary">
                    {movie.status === "NOW_SHOWING"
                      ? "Now Showing"
                      : movie.status === "UPCOMING"
                        ? "Coming Soon"
                        : "Ended"}
                  </span>
                  {movie.genre ? <span className="badge">{movie.genre}</span> : null}
                  {movie.language ? <span className="badge">{movie.language}</span> : null}
                </div>

                <h1
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(1.6rem,4vw,2.4rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    marginBottom: 12
                  }}
                >
                  {movie.title}
                </h1>

                <p style={{ fontSize: "0.95rem", color: "var(--text-2)", lineHeight: 1.7 }}>
                  {movie.description}
                </p>
              </div>

              <div className="key-value-grid">
                <div className="key-value">
                  <strong>Duration</strong>
                  <span>{movie.durationMinutes} min</span>
                </div>
                <div className="key-value">
                  <strong>Rating</strong>
                  <span>{movie.rating}</span>
                </div>
                <div className="key-value">
                  <strong>Release</strong>
                  <span>
                    {new Date(movie.releaseDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <div className="key-value">
                  <strong>First Class</strong>
                  <span>Nu.{Number(movie.regularPrice)}</span>
                </div>
                <div className="key-value">
                  <strong>Balcony</strong>
                  <span>Nu.{Number(movie.vipPrice)}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href={`/showtimes?movieId=${movie.id}`} className="link-btn">
                  Book Tickets
                </Link>
                {movie.trailerUrl ? (
                  <a href={movie.trailerUrl} target="_blank" className="link-btn secondary" rel="noreferrer">
                    Watch Trailer
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {movie.trailerUrl ? (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="detail-card" style={{ display: "grid", gap: 18 }}>
              <div className="section-intro" style={{ marginBottom: 0 }}>
                <h3>Trailer</h3>
                <p className="muted">Preview the film before you choose your seats.</p>
              </div>

              {trailerEmbedUrl ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingTop: "56.25%",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                    border: "1px solid var(--border)"
                  }}
                >
                  <iframe
                    src={trailerEmbedUrl}
                    title={`${movie.title} trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                  />
                </div>
              ) : (
                <a href={movie.trailerUrl} target="_blank" rel="noreferrer" className="link-btn secondary">
                  Open trailer in a new tab
                </a>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {movie.showtimes?.length > 0 ? (
        <section className="section" style={{ paddingTop: 0, paddingBottom: 64 }}>
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Available Showtimes</h2>
                <p className="section-sub">Choose a theatre and screen to continue to seat selection.</p>
              </div>
            </div>

            <div className="grid stack">
              {movie.showtimes.map((showtime: any) => {
                const dateTime = new Date(showtime.startTime);

                return (
                  <article key={showtime.id} className="showtime-card">
                    <div className="showtime-info">
                      <h3>{showtime.theatre.name}</h3>
                      <p className="muted" style={{ fontSize: "0.82rem" }}>
                        {showtime.screen.name}
                      </p>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-2)", marginTop: 4 }}>
                        {dateTime.toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short"
                        })}
                        {" · "}
                        {dateTime.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true
                        })}
                      </p>
                      <div className="showtime-pricing">
                        <span>
                          <span className="price-label">First Class </span>
                          <span className="price-val">Nu.{showtime.regularPrice}</span>
                        </span>
                        <span>
                          <span className="price-label">Balcony </span>
                          <span className="price-val">Nu.{showtime.vipPrice}</span>
                        </span>
                      </div>
                    </div>

                    <Link className="link-btn" href={`/seat-selection?showtimeId=${showtime.id}`}>
                      Choose Seats
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
