import { TheatreCard } from "../../components/theatre-card";
import { apiFetch } from "../../lib/api";

export default async function TheatresPage() {
  const theatres = await apiFetch<any[]>("/theatres");

  return (
    <main className="container">
      <section className="page-header">
        <h1 className="page-title">Theatres</h1>
        <p className="page-subtitle">Explore theatres, locations, and active show listings.</p>
      </section>

      <section className="section">
        <div className="grid theatres">
          {theatres.map((theatre) => <TheatreCard key={theatre.id} theatre={theatre} />)}
        </div>
      </section>
    </main>
  );
}
