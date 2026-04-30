import { TheatreCard } from "../../components/theatre-card";
import { apiFetch } from "../../lib/api";

export const metadata = {
  title: "Theatres - Movi",
  description: "Explore theatres, locations, and active show listings across Bhutan."
};

export default async function TheatresPage() {
  const theatres = await apiFetch<any[]>("/theatres");

  return (
    <main>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <h1 className="page-title">Theatres</h1>
          <p className="page-subtitle">
            {theatres.length} theatre{theatres.length !== 1 ? "s" : ""} across Bhutan — explore locations and view active showtimes.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 64 }}>
        <div className="container">
          {theatres.length > 0 ? (
            <div className="grid theatres">
              {theatres.map((theatre) => <TheatreCard key={theatre.id} theatre={theatre} />)}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No theatres listed yet</h3>
              <p>Add theatres from the admin dashboard.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
