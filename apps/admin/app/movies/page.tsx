"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { PageHeader } from "../../components/page-header";
import { adminApiFetch, getAdminToken, resolveAdminAssetUrl, uploadAdminImage } from "../../lib/api";

const STATUS_OPTIONS = ["NOW_SHOWING", "UPCOMING", "ENDED"] as const;

const initialForm = {
  title: "",
  description: "",
  genre: "",
  language: "",
  durationMinutes: 120,
  rating: "PG",
  posterUrl: "",
  trailerUrl: "",
  regularPrice: 250,
  vipPrice: 350,
  couplePrice: 350,
  releaseDate: "",
  status: "NOW_SHOWING"
} as const;

type MovieForm = {
  title: string;
  description: string;
  genre: string;
  language: string;
  durationMinutes: number;
  rating: string;
  posterUrl: string;
  trailerUrl: string;
  regularPrice: number;
  vipPrice: number;
  couplePrice: number;
  releaseDate: string;
  status: (typeof STATUS_OPTIONS)[number];
};

type MovieRecord = {
  id: string;
  title: string;
  description: string;
  genre: string;
  language: string;
  durationMinutes: number;
  rating: string;
  posterUrl: string;
  trailerUrl?: string | null;
  regularPrice: number;
  vipPrice: number;
  couplePrice: number;
  releaseDate: string;
  status: (typeof STATUS_OPTIONS)[number];
};

const statusLabel: Record<(typeof STATUS_OPTIONS)[number], string> = {
  NOW_SHOWING: "Now Showing",
  UPCOMING: "Upcoming",
  ENDED: "Ended"
};

function toDateInput(value: string) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function normalizeForm(form: MovieForm) {
  return {
    ...form,
    durationMinutes: Number(form.durationMinutes),
    couplePrice: Number(form.vipPrice),
    releaseDate: new Date(form.releaseDate).toISOString()
  };
}

export default function MoviesManagementPage() {
  const token = getAdminToken();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [movies, setMovies] = useState<MovieRecord[]>([]);
  const [form, setForm] = useState<MovieForm>({ ...initialForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      total: movies.length,
      nowShowing: movies.filter((movie) => movie.status === "NOW_SHOWING").length,
      upcoming: movies.filter((movie) => movie.status === "UPCOMING").length,
      ended: movies.filter((movie) => movie.status === "ENDED").length
    }),
    [movies]
  );

  const load = async () => {
    const result = await adminApiFetch<MovieRecord[]>("/movies");
    setMovies(result);
  };

  useEffect(() => {
    void load().catch((requestError) =>
      setError(requestError instanceof Error ? requestError.message : "Failed to load movies")
    );
  }, []);

  const update =
    (key: keyof MovieForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = key === "durationMinutes" ? Number(event.target.value) : event.target.value;
      setForm((current) => ({ ...current, [key]: value }));
    };

  const clearForm = () => {
    setForm({ ...initialForm });
    setEditingId(null);
  };

  const resetForm = () => {
    clearForm();
    setMessage("");
    setError("");
  };

  const beginEdit = (movie: MovieRecord) => {
    setEditingId(movie.id);
    setMessage("");
    setError("");
    setForm({
      title: movie.title,
      description: movie.description,
      genre: movie.genre,
      language: movie.language,
      durationMinutes: movie.durationMinutes,
      rating: movie.rating,
      posterUrl: movie.posterUrl,
      trailerUrl: movie.trailerUrl ?? "",
      regularPrice: Number(movie.regularPrice),
      vipPrice: Number(movie.vipPrice),
      couplePrice: Number(movie.vipPrice),
      releaseDate: toDateInput(movie.releaseDate),
      status: movie.status
    });
  };

  const saveMovie = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (editingId) {
        await adminApiFetch(`/admin/movies/${editingId}`, {
          method: "PATCH",
          token,
          body: normalizeForm(form)
        });
        clearForm();
        setMessage("Movie updated successfully.");
      } else {
        await adminApiFetch("/admin/movies", {
          method: "POST",
          token,
          body: normalizeForm(form)
        });
        clearForm();
        setMessage("Movie created successfully.");
      }

      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to save movie");
    } finally {
      setSaving(false);
    }
  };

  const handlePosterUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const uploaded = await uploadAdminImage(file, token);
      setForm((current) => ({ ...current, posterUrl: uploaded.url }));
      setMessage("Poster uploaded successfully.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to upload poster");
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const deleteMovie = async (movie: MovieRecord) => {
    const confirmDelete = window.confirm(
      `Delete "${movie.title}"? This should only be used for titles that have finished screening.`
    );

    if (!confirmDelete) {
      return;
    }

    setDeletingId(movie.id);
    setMessage("");
    setError("");

    try {
      await adminApiFetch(`/admin/movies/${movie.id}`, {
        method: "DELETE",
        token
      });
      if (editingId === movie.id) {
        clearForm();
      }
      setMessage("Movie deleted successfully.");
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to delete movie");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid">
      <PageHeader
        title="Movies"
        subtitle="Create, update, and retire movie listings. Upload posters directly here, attach trailer links, and only delete titles once screening is finished."
      />

      <div className="grid stats-grid">
        {[
          ["Total", counts.total, "All movies"],
          ["Now Showing", counts.nowShowing, "Live to customers"],
          ["Upcoming", counts.upcoming, "Announced releases"],
          ["Ended", counts.ended, "Ready for archive"]
        ].map(([label, value, hint]) => (
          <article key={label} className="stat-card">
            <div className="stat-card-label">{label}</div>
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-hint">{hint}</div>
          </article>
        ))}
      </div>

      <div className="grid two-col">
        <article className="form-card">
          <div className="section-intro">
            <span className="pill primary">{editingId ? "Editing" : "New release"}</span>
            <h3>{editingId ? "Edit Movie" : "Create Movie"}</h3>
            <p className="muted">Manage the customer-facing listing without changing the underlying API structure.</p>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label className="field-label" htmlFor="title">
                Title
              </label>
              <input id="title" className="field" value={form.title} onChange={update("title")} placeholder="e.g. The Monk and the Gun" />
            </div>

            <div className="form-split">
              <div className="field-group">
                <label className="field-label" htmlFor="genre">
                  Genre
                </label>
                <input id="genre" className="field" value={form.genre} onChange={update("genre")} placeholder="Drama, Adventure..." />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="language">
                  Language
                </label>
                <input id="language" className="field" value={form.language} onChange={update("language")} placeholder="Dzongkha, English..." />
              </div>
            </div>

            <div className="form-split">
              <div className="field-group">
                <label className="field-label" htmlFor="duration">
                  Duration (min)
                </label>
                <input id="duration" className="field" type="number" min={1} value={form.durationMinutes} onChange={update("durationMinutes")} />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="rating">
                  Rating
                </label>
                <input id="rating" className="field" value={form.rating} onChange={update("rating")} placeholder="PG, PG-13..." />
              </div>
            </div>

            <div className="form-split">
              <div className="field-group">
                <label className="field-label" htmlFor="releaseDate">
                  Release date
                </label>
                <input id="releaseDate" className="field" type="date" value={form.releaseDate} onChange={update("releaseDate")} />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="status">
                  Status
                </label>
                <select id="status" className="select" value={form.status} onChange={update("status")}>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-split">
              <div className="field-group">
                <label className="field-label" htmlFor="regularPrice">
                  First Class price
                </label>
                <input id="regularPrice" className="field" type="number" min={0} value={form.regularPrice} onChange={update("regularPrice")} />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="vipPrice">
                  Balcony price
                </label>
                <input id="vipPrice" className="field" type="number" min={0} value={form.vipPrice} onChange={(event) => setForm((current) => ({ ...current, vipPrice: Number(event.target.value), couplePrice: Number(event.target.value) }))} />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Poster</label>
              <div className="btn-row">
                <button className="btn secondary" type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Poster"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePosterUpload}
                />
              </div>
              <input className="field" placeholder="https://... or uploaded image path" value={form.posterUrl} onChange={update("posterUrl")} />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="trailerUrl">
                Trailer URL
              </label>
              <input id="trailerUrl" className="field" value={form.trailerUrl} onChange={update("trailerUrl")} placeholder="https://youtube.com/watch?v=..." />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="description">
                Description
              </label>
              <textarea id="description" className="textarea" rows={5} value={form.description} onChange={update("description")} placeholder="Add the synopsis customers will read before booking..." />
            </div>

            {message ? <p className="success">{message}</p> : null}
            {error ? <p className="error">{error}</p> : null}

            <div className="btn-row">
              <button className="btn" onClick={saveMovie} disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Movie" : "Create Movie"}
              </button>
              <button className="btn ghost sm" onClick={resetForm} disabled={saving}>
                {editingId ? "Cancel Edit" : "Reset"}
              </button>
            </div>
          </div>
        </article>

        <article className="report-card">
          <div className="section-intro">
            <span className="pill primary">Live preview</span>
            <h3>How customers will see it</h3>
          </div>

          <div className="movie-preview">
            {form.posterUrl ? (
              <img className="movie-preview-poster" src={resolveAdminAssetUrl(form.posterUrl)} alt={form.title || "Poster preview"} />
            ) : (
              <div className="movie-preview-placeholder">Poster preview</div>
            )}

            <div className="stack">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className="pill primary">{statusLabel[form.status]}</span>
                {form.genre ? <span className="pill default">{form.genre}</span> : null}
                {form.language ? <span className="pill default">{form.language}</span> : null}
              </div>

              <div>
                <h3 style={{ fontSize: "1rem" }}>{form.title || "Untitled movie"}</h3>
                <p className="muted" style={{ fontSize: "0.78rem", marginTop: 2 }}>
                  Rated {form.rating || "PG"} · {form.durationMinutes || 0} min
                </p>
                <p className="muted" style={{ fontSize: "0.78rem", marginTop: 6 }}>
                  First Class Nu. {form.regularPrice} · Balcony Nu. {form.vipPrice}
                </p>
              </div>

              <p className="muted" style={{ fontSize: "0.82rem", lineHeight: 1.5 }}>
                {form.description || "Add a description to preview how it reads to customers."}
              </p>

              {form.trailerUrl ? (
                <a className="btn-link" href={form.trailerUrl} target="_blank" rel="noreferrer">
                  Open trailer
                </a>
              ) : null}
            </div>
          </div>
        </article>
      </div>

      <article className="table-card">
        <div className="section-intro">
          <span className="pill primary">Catalog</span>
          <h3>Movie Library</h3>
          <p className="muted">Use edit for corrections or status changes. Delete is reserved for ended titles.</p>
        </div>

        <div className="catalog-list">
          {movies.length === 0 ? (
            <div className="empty-state">
              <p>No movies yet. Create one above.</p>
            </div>
          ) : null}

          {movies.map((movie) => {
            const canDelete = movie.status === "ENDED";

            return (
              <div key={movie.id} className="catalog-row">
                <div className="catalog-poster-wrap">
                  {movie.posterUrl ? (
                    <img className="catalog-poster" src={resolveAdminAssetUrl(movie.posterUrl)} alt={movie.title} />
                  ) : (
                    <div className="catalog-poster-placeholder">No poster</div>
                  )}
                </div>

                <div className="catalog-copy">
                  <div className="catalog-header">
                    <div style={{ display: "grid", gap: 6 }}>
                      <h4>{movie.title}</h4>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span className="pill primary">{statusLabel[movie.status]}</span>
                        {movie.genre ? <span className="pill default">{movie.genre}</span> : null}
                        {movie.language ? <span className="pill default">{movie.language}</span> : null}
                        <span className="pill default">{movie.durationMinutes} min</span>
                        <span className="pill default">First Class Nu. {Number(movie.regularPrice)} / Balcony Nu. {Number(movie.vipPrice)}</span>
                      </div>
                    </div>

                    <div className="btn-row">
                      <button className="btn secondary sm" onClick={() => beginEdit(movie)}>
                        Edit
                      </button>
                      <button
                        className="btn danger sm"
                        onClick={() => deleteMovie(movie)}
                        disabled={!canDelete || deletingId === movie.id}
                        title={canDelete ? "Delete movie" : "Mark the movie as ended before deleting it"}
                      >
                        {deletingId === movie.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>

                  <p className="muted" style={{ fontSize: "0.82rem" }}>
                    {movie.description?.slice(0, 170) || "No description."}
                  </p>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <span className="muted" style={{ fontSize: "0.78rem" }}>
                      Release {new Date(movie.releaseDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {movie.trailerUrl ? (
                      <a className="btn-link" href={movie.trailerUrl} target="_blank" rel="noreferrer">
                        Trailer
                      </a>
                    ) : null}
                    {!canDelete ? (
                      <span className="muted" style={{ fontSize: "0.78rem" }}>
                        Delete unlocks once status is Ended.
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
}
