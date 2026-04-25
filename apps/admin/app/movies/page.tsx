"use client";

import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "../../components/page-header";
import { adminApiFetch, getAdminToken } from "../../lib/api";

const initialForm = {
  title: "",
  description: "",
  genre: "",
  language: "",
  durationMinutes: 120,
  rating: "PG",
  posterUrl: "",
  trailerUrl: "",
  releaseDate: "",
  status: "NOW_SHOWING"
};

const statusOptions = ["NOW_SHOWING", "UPCOMING", "ENDED"];

export default function MoviesManagementPage() {
  const token = getAdminToken();
  const [movies, setMovies] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);

  const statusCounts = useMemo(() => {
    return {
      NOW_SHOWING: movies.filter((movie) => movie.status === "NOW_SHOWING").length,
      UPCOMING: movies.filter((movie) => movie.status === "UPCOMING").length,
      ENDED: movies.filter((movie) => movie.status === "ENDED").length
    };
  }, [movies]);

  const load = async () => {
    try {
      const result = await adminApiFetch<any[]>("/movies");
      setMovies(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load movies");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateField = (key: keyof typeof initialForm, value: string | number) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const createMovie = async () => {
    setMessage("");
    setError("");

    try {
      await adminApiFetch("/admin/movies", {
        method: "POST",
        token,
        body: {
          ...form,
          durationMinutes: Number(form.durationMinutes),
          releaseDate: new Date(form.releaseDate).toISOString()
        }
      });

      setMessage("Movie created successfully.");
      setForm(initialForm);
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create movie");
    }
  };

  return (
    <div className="grid">
      <PageHeader
        title="Movies Management"
        subtitle="Create polished movie listings with the right poster, trailer, runtime, and release status."
      />

      <section className="grid stats-grid">
        {[
          ["Catalog total", movies.length, "All movies available in the platform"],
          ["Now showing", statusCounts.NOW_SHOWING, "Titles customers can book today"],
          ["Upcoming", statusCounts.UPCOMING, "Titles that are announced but not live yet"],
          ["Ended", statusCounts.ENDED, "Titles kept for history and reporting"]
        ].map(([label, value, hint]) => (
          <article key={label} className="stat-card">
            <span className="pill">{label}</span>
            <h3>{value}</h3>
            <p className="muted">{hint}</p>
          </article>
        ))}
      </section>

      <section className="grid two-column">
        <article className="form-card">
          <div className="section-intro">
            <span className="pill">New release</span>
            <h3>Create Movie</h3>
            <p className="muted">
              Add the public-facing information customers will see across the website and mobile app.
            </p>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label className="field-label" htmlFor="title">Movie title</label>
              <input
                id="title"
                className="field"
                placeholder="Example: The Thunder Dragon"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
              />
            </div>

            <div className="form-split">
              <div className="field-group">
                <label className="field-label" htmlFor="genre">Genre</label>
                <input
                  id="genre"
                  className="field"
                  placeholder="Action, Drama, Comedy"
                  value={form.genre}
                  onChange={(event) => updateField("genre", event.target.value)}
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="language">Language</label>
                <input
                  id="language"
                  className="field"
                  placeholder="Dzongkha, English, Hindi"
                  value={form.language}
                  onChange={(event) => updateField("language", event.target.value)}
                />
              </div>
            </div>

            <div className="form-split">
              <div className="field-group">
                <label className="field-label" htmlFor="duration">Duration in minutes</label>
                <input
                  id="duration"
                  className="field"
                  type="number"
                  min={1}
                  value={form.durationMinutes}
                  onChange={(event) => updateField("durationMinutes", Number(event.target.value))}
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="rating">Audience rating</label>
                <input
                  id="rating"
                  className="field"
                  placeholder="PG, PG-13, 16+"
                  value={form.rating}
                  onChange={(event) => updateField("rating", event.target.value)}
                />
              </div>
            </div>

            <div className="form-split">
              <div className="field-group">
                <label className="field-label" htmlFor="releaseDate">Release date</label>
                <input
                  id="releaseDate"
                  className="field"
                  type="date"
                  value={form.releaseDate}
                  onChange={(event) => updateField("releaseDate", event.target.value)}
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="status">Movie status</label>
                <select
                  id="status"
                  className="select"
                  value={form.status}
                  onChange={(event) => updateField("status", event.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="posterUrl">Poster URL</label>
              <input
                id="posterUrl"
                className="field"
                placeholder="https://..."
                value={form.posterUrl}
                onChange={(event) => updateField("posterUrl", event.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="trailerUrl">Trailer URL</label>
              <input
                id="trailerUrl"
                className="field"
                placeholder="https://youtube.com/..."
                value={form.trailerUrl}
                onChange={(event) => updateField("trailerUrl", event.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="description">Description</label>
              <textarea
                id="description"
                className="textarea"
                rows={5}
                placeholder="Write a short description that helps customers decide quickly."
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
            </div>

            {message ? <p className="success">{message}</p> : null}
            {error ? <p className="error">{error}</p> : null}

            <div className="btn-row">
              <button className="btn" onClick={createMovie}>Create Movie</button>
              <button className="btn secondary" onClick={() => setForm(initialForm)}>Reset Form</button>
            </div>
          </div>
        </article>

        <article className="report-card report-highlight">
          <div className="section-intro">
            <span className="pill">Live preview</span>
            <h3>How this listing will feel</h3>
            <p className="muted">
              Use this panel to sanity-check the poster, metadata, and short description before publishing.
            </p>
          </div>

          <div className="movie-preview-card">
            {form.posterUrl ? (
              <img className="movie-preview-poster" src={form.posterUrl} alt={form.title || "Movie poster preview"} />
            ) : (
              <div className="movie-preview-placeholder">Poster preview</div>
            )}

            <div className="stack">
              <div className="badge-row">
                <span className="pill">{form.status.replace("_", " ")}</span>
                <span className="pill">{form.genre || "Genre"}</span>
                <span className="pill">{form.language || "Language"}</span>
              </div>

              <div>
                <h3>{form.title || "Untitled movie"}</h3>
                <p className="muted">
                  Rated {form.rating || "PG"} | {form.durationMinutes || 0} mins
                </p>
              </div>

              <p className="muted">
                {form.description || "Add a description to preview how your listing will read to customers."}
              </p>

              <div className="quick-links">
                <span className="btn-link">Poster ready</span>
                <span className="btn-link">Counter booking flow</span>
                <span className="btn-link">Public catalog</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="table-card">
        <div className="section-intro">
          <span className="pill">Catalog view</span>
          <h3>Movie Catalog</h3>
          <p className="muted">
            A quick scan of the live movie library, including poster coverage and release readiness.
          </p>
        </div>

        <div className="catalog-list">
          {movies.map((movie) => (
            <article key={movie.id} className="catalog-row">
              <div className="catalog-poster-wrap">
                {movie.posterUrl ? (
                  <img className="catalog-poster" src={movie.posterUrl} alt={movie.title} />
                ) : (
                  <div className="catalog-poster placeholder">No poster</div>
                )}
              </div>

              <div className="catalog-copy">
                <div className="catalog-header">
                  <h4>{movie.title}</h4>
                  <span className="pill">{movie.status.replace("_", " ")}</span>
                </div>
                <p className="muted">{movie.description?.slice(0, 140) || "No description added yet."}</p>
                <div className="meta-row">
                  <span className="btn-link">{movie.genre}</span>
                  <span className="btn-link">{movie.language}</span>
                  <span className="btn-link">{movie.durationMinutes} mins</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
