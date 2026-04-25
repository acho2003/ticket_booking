"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "../../components/page-header";
import { adminApiFetch, getAdminToken } from "../../lib/api";

export default function ShowtimeManagementPage() {
  const token = getAdminToken();
  const [movies, setMovies] = useState<any[]>([]);
  const [theatres, setTheatres] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    movieId: "",
    theatreId: "",
    screenId: "",
    startTime: "",
    endTime: "",
    regularPrice: 250,
    vipPrice: 350,
    couplePrice: 600
  });

  const loadShowtimes = async () => {
    const result = await adminApiFetch<any[]>("/showtimes");
    setShowtimes(result);
  };

  useEffect(() => {
    const load = async () => {
      const [movieResult, theatreResult] = await Promise.all([
        adminApiFetch<any[]>("/movies"),
        adminApiFetch<any[]>("/theatres")
      ]);
      setMovies(movieResult);
      setTheatres(theatreResult);
      if (movieResult[0]) setForm((current) => ({ ...current, movieId: movieResult[0].id }));
      if (theatreResult[0]) setForm((current) => ({ ...current, theatreId: theatreResult[0].id }));
      await loadShowtimes();
    };

    void load().catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Failed to load data"));
  }, []);

  useEffect(() => {
    if (!form.theatreId || !token) return;
    void adminApiFetch<any[]>(`/admin/theatres/${form.theatreId}/screens`, { token })
      .then((result) => {
        setScreens(result);
        if (result[0]) {
          setForm((current) => ({ ...current, screenId: result[0].id }));
        }
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Failed to load screens"));
  }, [form.theatreId, token]);

  const createShowtime = async () => {
    try {
      await adminApiFetch("/admin/showtimes", {
        method: "POST",
        token,
        body: {
          ...form,
          regularPrice: Number(form.regularPrice),
          vipPrice: Number(form.vipPrice),
          couplePrice: Number(form.couplePrice),
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString()
        }
      });
      await loadShowtimes();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create showtime");
    }
  };

  return (
    <div className="grid">
      <PageHeader title="Showtime Management" subtitle="Assign movies to theatres and screens with custom pricing per showtime." />
      <section className="grid two-column">
        <div className="form-card">
          <h3>Create Showtime</h3>
          <div className="form-grid">
            <select className="select" value={form.movieId} onChange={(event) => setForm((current) => ({ ...current, movieId: event.target.value }))}>
              {movies.map((movie) => <option key={movie.id} value={movie.id}>{movie.title}</option>)}
            </select>
            <select className="select" value={form.theatreId} onChange={(event) => setForm((current) => ({ ...current, theatreId: event.target.value }))}>
              {theatres.map((theatre) => <option key={theatre.id} value={theatre.id}>{theatre.name}</option>)}
            </select>
            <select className="select" value={form.screenId} onChange={(event) => setForm((current) => ({ ...current, screenId: event.target.value }))}>
              {screens.map((screen) => <option key={screen.id} value={screen.id}>{screen.name}</option>)}
            </select>
            <input className="field" type="datetime-local" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} />
            <input className="field" type="datetime-local" value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} />
            <input className="field" type="number" value={form.regularPrice} onChange={(event) => setForm((current) => ({ ...current, regularPrice: Number(event.target.value) }))} />
            <input className="field" type="number" value={form.vipPrice} onChange={(event) => setForm((current) => ({ ...current, vipPrice: Number(event.target.value) }))} />
            <input className="field" type="number" value={form.couplePrice} onChange={(event) => setForm((current) => ({ ...current, couplePrice: Number(event.target.value) }))} />
            {error ? <p className="error">{error}</p> : null}
            <button className="btn" onClick={createShowtime}>Create Showtime</button>
          </div>
        </div>
        <div className="table-card">
          <h3>Existing Showtimes</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Movie</th>
                <th>Theatre</th>
                <th>Screen</th>
                <th>Start</th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map((showtime) => (
                <tr key={showtime.id}>
                  <td>{showtime.movie.title}</td>
                  <td>{showtime.theatre.name}</td>
                  <td>{showtime.screen.name}</td>
                  <td>{new Date(showtime.startTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
