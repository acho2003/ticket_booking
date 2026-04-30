import Link from "next/link";

import type { MovieSummary } from "@bhutan/shared";

import { resolveApiAssetUrl } from "../lib/api";

export function MovieCard({ movie }: { movie: MovieSummary }) {
  return (
    <article className="movie-card">
      <div className="movie-visual">
        {movie.posterUrl ? (
          <img className="movie-poster" src={resolveApiAssetUrl(movie.posterUrl)} alt={movie.title} />
        ) : (
          <div
            className="movie-poster"
            style={{
              background: "var(--bg-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
              fontSize: "0.85rem"
            }}
          >
            No poster
          </div>
        )}

        <div className="movie-overlay">
          <span className="badge dark">
            {movie.status === "NOW_SHOWING"
              ? "Now Showing"
              : movie.status === "UPCOMING"
                ? "Coming Soon"
                : "Ended"}
          </span>
          <span className="movie-runtime">{movie.durationMinutes}m</span>
        </div>
      </div>

      <div className="movie-body">
        <div className="badge-row">
          {movie.genre ? <span className="badge">{movie.genre}</span> : null}
          {movie.language ? <span className="badge">{movie.language}</span> : null}
        </div>

        <h3>{movie.title}</h3>

        <p className="movie-meta">
          Rated {movie.rating} &middot;{" "}
          {new Date(movie.releaseDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })}
        </p>

        <p className="movie-meta">
          First Class Nu.{Number(movie.regularPrice)} &middot; Balcony Nu.{Number(movie.vipPrice)}
        </p>

        <p className="movie-desc">
          {movie.description.slice(0, 100)}
          {movie.description.length > 100 ? "..." : ""}
        </p>

        <div className="movie-actions">
          <Link className="link-btn secondary" href={`/movies/${movie.id}`}>
            Details
          </Link>
          <Link className="link-btn" href={`/showtimes?movieId=${movie.id}`}>
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}
