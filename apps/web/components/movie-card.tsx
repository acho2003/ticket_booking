import Link from "next/link";

import type { MovieSummary } from "@bhutan/shared";

export function MovieCard({ movie }: { movie: MovieSummary }) {
  return (
    <article className="movie-card">
      <div className="movie-visual">
        <img className="movie-poster" src={movie.posterUrl} alt={movie.title} />
        <div className="movie-overlay">
          <span className="badge badge-dark">{movie.status.replace("_", " ")}</span>
          <span className="movie-runtime">{movie.durationMinutes} mins</span>
        </div>
      </div>
      <div className="movie-body">
        <div className="badge-row">
          <span className="badge">{movie.genre}</span>
          <span className="badge">{movie.language}</span>
        </div>
        <h3>{movie.title}</h3>
        <p className="meta-line">
          Rated {movie.rating} | Releases {new Date(movie.releaseDate).toLocaleDateString()}
        </p>
        <p className="muted">{movie.description.slice(0, 110)}...</p>
        <div className="cta-row">
          <Link className="link-btn" href={`/movies/${movie.id}`}>
            View Details
          </Link>
          <Link className="link-btn secondary" href={`/showtimes?movieId=${movie.id}`}>
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}
