"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "../../components/page-header";
import { adminApiFetch, getAdminToken } from "../../lib/api";

type MovieRecord = {
  id: string;
  title: string;
  status: "NOW_SHOWING" | "UPCOMING" | "ENDED";
  regularPrice: number;
  vipPrice: number;
  couplePrice: number;
};

type ShowtimeRecord = {
  id: string;
  startTime: string;
  regularPrice: number;
  vipPrice: number;
  couplePrice: number;
  movie: { id: string; title: string };
  theatre: { name: string };
  screen: { name: string };
};

export default function PricingPage() {
  const token = getAdminToken();
  const [movies, setMovies] = useState<MovieRecord[]>([]);
  const [showtimes, setShowtimes] = useState<ShowtimeRecord[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const [movieResult, showtimeResult] = await Promise.all([
        adminApiFetch<MovieRecord[]>("/movies"),
        adminApiFetch<ShowtimeRecord[]>("/showtimes")
      ]);
      setMovies(movieResult);
      setShowtimes(showtimeResult);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load pricing");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateMoviePrices = async (movieId: string, payload: { regularPrice: number; vipPrice: number; couplePrice: number }) => {
    setMessage("");
    setError("");

    try {
      await adminApiFetch(`/admin/movies/${movieId}`, {
        method: "PATCH",
        token,
        body: payload
      });
      setMessage("Movie pricing updated.");
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to update movie pricing");
    }
  };

  const updateShowtimePrices = async (showtimeId: string, payload: { regularPrice: number; vipPrice: number; couplePrice: number }) => {
    setMessage("");
    setError("");

    try {
      await adminApiFetch(`/admin/showtimes/${showtimeId}`, {
        method: "PATCH",
        token,
        body: payload
      });
      setMessage("Showtime pricing updated.");
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to update showtime pricing");
    }
  };

  return (
    <div className="grid">
      <PageHeader
        title="Ticket Pricing"
        subtitle="Set default pricing per movie, then override individual showtimes only when a specific screening needs different rates."
      />

      {message ? <p className="success">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <div className="table-card">
        <div className="section-intro">
          <span className="pill primary">Movie defaults</span>
          <h3>Pricing per movie</h3>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Movie</th>
              <th>Status</th>
              <th>First Class</th>
              <th>Balcony</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <MoviePricingRow key={movie.id} movie={movie} onSave={updateMoviePrices} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-card">
        <div className="section-intro">
          <span className="pill primary">Showtime overrides</span>
          <h3>Pricing per screening</h3>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Movie</th>
              <th>Showtime</th>
              <th>First Class</th>
              <th>Balcony</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {showtimes.map((showtime) => (
              <ShowtimePricingRow key={showtime.id} showtime={showtime} onSave={updateShowtimePrices} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MoviePricingRow({
  movie,
  onSave
}: {
  movie: MovieRecord;
  onSave: (movieId: string, payload: { regularPrice: number; vipPrice: number; couplePrice: number }) => void;
}) {
  const [regularPrice, setRegularPrice] = useState(Number(movie.regularPrice));
  const [vipPrice, setVipPrice] = useState(Number(movie.vipPrice));

  return (
    <tr>
      <td>{movie.title}</td>
      <td>{movie.status.replace("_", " ")}</td>
      <td><input className="field" type="number" min={0} value={regularPrice} onChange={(event) => setRegularPrice(Number(event.target.value))} /></td>
      <td><input className="field" type="number" min={0} value={vipPrice} onChange={(event) => setVipPrice(Number(event.target.value))} /></td>
      <td><button className="btn" onClick={() => onSave(movie.id, { regularPrice, vipPrice, couplePrice: vipPrice })}>Save</button></td>
    </tr>
  );
}

function ShowtimePricingRow({
  showtime,
  onSave
}: {
  showtime: ShowtimeRecord;
  onSave: (showtimeId: string, payload: { regularPrice: number; vipPrice: number; couplePrice: number }) => void;
}) {
  const [regularPrice, setRegularPrice] = useState(Number(showtime.regularPrice));
  const [vipPrice, setVipPrice] = useState(Number(showtime.vipPrice));

  return (
    <tr>
      <td>
        {showtime.movie.title}
        <div className="muted" style={{ fontSize: "0.78rem" }}>
          {showtime.theatre.name} · {showtime.screen.name}
        </div>
      </td>
      <td>{new Date(showtime.startTime).toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</td>
      <td><input className="field" type="number" min={0} value={regularPrice} onChange={(event) => setRegularPrice(Number(event.target.value))} /></td>
      <td><input className="field" type="number" min={0} value={vipPrice} onChange={(event) => setVipPrice(Number(event.target.value))} /></td>
      <td><button className="btn" onClick={() => onSave(showtime.id, { regularPrice, vipPrice, couplePrice: vipPrice })}>Save</button></td>
    </tr>
  );
}
