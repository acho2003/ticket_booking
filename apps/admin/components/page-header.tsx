export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="topbar">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}
