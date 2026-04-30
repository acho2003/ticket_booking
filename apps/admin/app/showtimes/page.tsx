"use client";

import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "../../components/page-header";
import { adminApiFetch, getAdminToken } from "../../lib/api";

type MovieRecord = {
  id: string;
  title: string;
  regularPrice: number;
  vipPrice: number;
  couplePrice: number;
  status: "NOW_SHOWING" | "UPCOMING" | "ENDED";
};

type TheatreRecord = {
  id: string;
  name: string;
};

type ScreenRecord = {
  id: string;
  name: string;
};

type ShowtimeRecord = {
  id: string;
  startTime: string;
  endTime: string;
  regularPrice: number;
  vipPrice: number;
  couplePrice: number;
  status: "ACTIVE" | "CANCELLED" | "COMPLETED";
  bookingStatus?: "UPCOMING" | "OPEN" | "CLOSED" | "COMPLETED" | "CANCELLED";
  canBook?: boolean;
  bookingClosesAt?: string;
  movie: { id: string; title: string };
  theatre: { id: string; name: string };
  screen: { id: string; name: string };
};

const initialForm = {
  movieId: "",
  theatreId: "",
  screenId: "",
  startTime: "",
  endTime: "",
  regularPrice: 250,
  vipPrice: 350,
  couplePrice: 350
};

export default function ShowtimeManagementPage() {
  const token = getAdminToken();
  const [movies, setMovies] = useState<MovieRecord[]>([]);
  const [theatres, setTheatres] = useState<TheatreRecord[]>([]);
  const [screens, setScreens] = useState<ScreenRecord[]>([]);
  const [showtimes, setShowtimes] = useState<ShowtimeRecord[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const selectedMovie = useMemo(
    () => movies.find((movie) => movie.id === form.movieId) ?? null,
    [movies, form.movieId]
  );

  const loadShowtimes = async () => {
    const result = await adminApiFetch<ShowtimeRecord[]>("/showtimes");
    setShowtimes(result);
  };

  useEffect(() => {
    const load = async () => {
      const [movieResult, theatreResult] = await Promise.all([
        adminApiFetch<MovieRecord[]>("/movies"),
        adminApiFetch<TheatreRecord[]>("/theatres")
      ]);

      setMovies(movieResult);
      setTheatres(theatreResult);

      if (movieResult[0]) {
        setForm((current) => ({
          ...current,
          movieId: movieResult[0].id,
          regularPrice: Number(movieResult[0].regularPrice),
          vipPrice: Number(movieResult[0].vipPrice),
          couplePrice: Number(movieResult[0].vipPrice)
        }));
      }

      if (theatreResult[0]) {
        setForm((current) => ({ ...current, theatreId: theatreResult[0].id }));
      }

      await loadShowtimes();
    };

    void load().catch((requestError) =>
      setError(requestError instanceof Error ? requestError.message : "Failed to load data")
    );
  }, []);

  useEffect(() => {
    if (!form.theatreId || !token) {
      return;
    }

    void adminApiFetch<ScreenRecord[]>(`/admin/theatres/${form.theatreId}/screens`, { token })
      .then((result) => {
        setScreens(result);
        if (result[0]) {
          setForm((current) => ({ ...current, screenId: current.screenId || result[0].id }));
        }
      })
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : "Failed to load screens")
      );
  }, [form.theatreId, token]);

  useEffect(() => {
    if (!selectedMovie) {
      return;
    }

    setForm((current) => ({
      ...current,
      regularPrice: Number(selectedMovie.regularPrice),
      vipPrice: Number(selectedMovie.vipPrice),
      couplePrice: Number(selectedMovie.vipPrice)
    }));
  }, [selectedMovie]);

  const resetForm = () => {
    setEditingId(null);
    setForm((current) => ({
      ...initialForm,
      movieId: movies[0]?.id ?? current.movieId,
      theatreId: theatres[0]?.id ?? current.theatreId,
      screenId: screens[0]?.id ?? current.screenId,
      regularPrice: movies[0] ? Number(movies[0].regularPrice) : initialForm.regularPrice,
      vipPrice: movies[0] ? Number(movies[0].vipPrice) : initialForm.vipPrice,
      couplePrice: movies[0] ? Number(movies[0].vipPrice) : initialForm.couplePrice
    }));
  };

  const toDateTimeLocal = (value: string) => {
    const date = new Date(value);
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().slice(0, 16);
  };

  const beginEdit = (showtime: ShowtimeRecord) => {
    setEditingId(showtime.id);
    setMessage("");
    setError("");
    setForm({
      movieId: showtime.movie.id,
      theatreId: showtime.theatre.id,
      screenId: showtime.screen.id,
      startTime: toDateTimeLocal(showtime.startTime),
      endTime: toDateTimeLocal(showtime.endTime),
      regularPrice: Number(showtime.regularPrice),
      vipPrice: Number(showtime.vipPrice),
      couplePrice: Number(showtime.vipPrice)
    });
  };

  const saveShowtime = async (confirmTimeChangeWithBookings = false) => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await adminApiFetch(editingId ? `/admin/showtimes/${editingId}` : "/admin/showtimes", {
        method: editingId ? "PATCH" : "POST",
        token,
        body: {
          ...form,
          regularPrice: Number(form.regularPrice),
          vipPrice: Number(form.vipPrice),
          couplePrice: Number(form.vipPrice),
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
          confirmTimeChangeWithBookings
        }
      });

      setMessage(editingId ? "Showtime updated successfully." : "Showtime created successfully.");
      setEditingId(null);
      await loadShowtimes();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to save showtime";
      if (
        editingId &&
        message.toLowerCase().includes("already has bookings") &&
        window.confirm(`${message}\n\nDo you want to update it anyway? Customers with existing bookings may see the new time.`)
      ) {
        await saveShowtime(true);
        return;
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteShowtime = async (showtime: ShowtimeRecord) => {
    const confirmed = window.confirm(`Delete the ${showtime.movie.title} showtime on ${new Date(showtime.startTime).toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(showtime.id);
    setMessage("");
    setError("");

    try {
      await adminApiFetch(`/admin/showtimes/${showtime.id}`, {
        method: "DELETE",
        token
      });
      setMessage("Showtime deleted successfully.");
      await loadShowtimes();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to delete showtime");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid">
      <PageHeader
        title="Showtime Management"
        subtitle="Assign movies to theatres and screens with pricing prefilled from each movie, then override when a specific showtime needs a different rate."
      />

      <section className="grid two-col">
        <div className="form-card">
          <div className="section-intro">
            <span className="pill primary">{editingId ? "Editing screening" : "New screening"}</span>
            <h3>{editingId ? "Edit Showtime" : "Create Showtime"}</h3>
            <p className="muted">Set the exact movie, theatre, screen, date, start time, end time, and seat pricing.</p>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label className="field-label">Movie</label>
              <select className="select" value={form.movieId} onChange={(event) => setForm((current) => ({ ...current, movieId: event.target.value }))}>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-split">
              <div className="field-group">
                <label className="field-label">Theatre</label>
                <select className="select" value={form.theatreId} onChange={(event) => setForm((current) => ({ ...current, theatreId: event.target.value, screenId: "" }))}>
                  {theatres.map((theatre) => (
                    <option key={theatre.id} value={theatre.id}>
                      {theatre.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Screen</label>
                <select className="select" value={form.screenId} onChange={(event) => setForm((current) => ({ ...current, screenId: event.target.value }))}>
                  {screens.map((screen) => (
                    <option key={screen.id} value={screen.id}>
                      {screen.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-split">
              <div className="field-group">
                <label className="field-label">Start time</label>
                <input className="field" type="datetime-local" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} />
              </div>
              <div className="field-group">
                <label className="field-label">End time</label>
                <input className="field" type="datetime-local" value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} />
              </div>
            </div>

            <div className="form-split">
              <div className="field-group">
                <label className="field-label">First Class</label>
                <input className="field" type="number" min={0} value={form.regularPrice} onChange={(event) => setForm((current) => ({ ...current, regularPrice: Number(event.target.value) }))} />
              </div>
              <div className="field-group">
                <label className="field-label">Balcony</label>
                <input className="field" type="number" min={0} value={form.vipPrice} onChange={(event) => setForm((current) => ({ ...current, vipPrice: Number(event.target.value), couplePrice: Number(event.target.value) }))} />
              </div>
            </div>

            {selectedMovie ? (
              <p className="muted" style={{ fontSize: "0.8rem" }}>
                Movie default pricing: Nu. {Number(selectedMovie.regularPrice)} First Class, Nu. {Number(selectedMovie.vipPrice)} Balcony.
              </p>
            ) : null}

            {message ? <p className="success">{message}</p> : null}
            {error ? <p className="error">{error}</p> : null}

            <button className="btn" onClick={() => void saveShowtime()} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Showtime" : "Create Showtime"}
            </button>
            {editingId ? (
              <button className="btn ghost" onClick={resetForm} disabled={saving}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </div>

        <div className="table-card">
          <div className="section-intro">
            <span className="pill primary">Existing</span>
            <h3>Showtimes</h3>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Movie</th>
                <th>Theatre</th>
                <th>Screen</th>
                <th>Start</th>
                <th>Closes</th>
                <th>Status</th>
                <th>Pricing</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map((showtime) => (
                <tr key={showtime.id}>
                  <td>{showtime.movie.title}</td>
                  <td>{showtime.theatre.name}</td>
                  <td>{showtime.screen.name}</td>
                  <td>{new Date(showtime.startTime).toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</td>
                  <td>
                    {showtime.bookingClosesAt
                      ? new Date(showtime.bookingClosesAt).toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
                      : "-"}
                  </td>
                  <td>
                    <span className={`pill ${(showtime.bookingStatus ?? showtime.status).toLowerCase()}`}>
                      {showtime.bookingStatus ?? showtime.status}
                    </span>
                  </td>
                  <td>
                    First Class Nu. {Number(showtime.regularPrice)} / Balcony Nu. {Number(showtime.vipPrice)}
                  </td>
                  <td>
                    <div className="btn-row">
                      <button className="btn secondary sm" onClick={() => beginEdit(showtime)}>
                        Edit
                      </button>
                      <button className="btn danger sm" onClick={() => deleteShowtime(showtime)} disabled={deletingId === showtime.id}>
                        {deletingId === showtime.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
