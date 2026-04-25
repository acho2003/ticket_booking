"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "../../components/page-header";
import { adminApiFetch, getAdminToken } from "../../lib/api";

const seatTypes = ["REGULAR", "VIP", "COUPLE", "BLOCKED"] as const;

export default function SeatLayoutEditorPage() {
  const token = getAdminToken();
  const [theatres, setTheatres] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [selectedTheatreId, setSelectedTheatreId] = useState("");
  const [selectedScreenId, setSelectedScreenId] = useState("");
  const [seats, setSeats] = useState<any[]>([]);
  const [rows, setRows] = useState(10);
  const [columns, setColumns] = useState(12);
  const [error, setError] = useState("");

  useEffect(() => {
    void adminApiFetch<any[]>("/theatres")
      .then((result) => {
        setTheatres(result);
        if (result[0]) {
          setSelectedTheatreId(result[0].id);
        }
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Failed to load theatres"));
  }, []);

  useEffect(() => {
    if (!selectedTheatreId || !token) return;
    void adminApiFetch<any[]>(`/admin/theatres/${selectedTheatreId}/screens`, { token })
      .then((result) => {
        setScreens(result);
        if (result[0]) {
          setSelectedScreenId(result[0].id);
          setRows(result[0].totalRows);
          setColumns(result[0].totalColumns);
        }
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Failed to load screens"));
  }, [selectedTheatreId, token]);

  useEffect(() => {
    if (!selectedScreenId) return;
    void adminApiFetch<any[]>(`/screens/${selectedScreenId}/seats`)
      .then(setSeats)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Failed to load seats"));
  }, [selectedScreenId]);

  const generateSeats = async () => {
    try {
      await adminApiFetch(`/admin/screens/${selectedScreenId}/generate-seats`, {
        method: "POST",
        token,
        body: {
          totalRows: rows,
          totalColumns: columns
        }
      });
      const updated = await adminApiFetch<any[]>(`/screens/${selectedScreenId}/seats`);
      setSeats(updated);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to generate seats");
    }
  };

  const cycleSeatType = async (seat: any) => {
    const index = seatTypes.indexOf(seat.seatType);
    const nextSeatType = seatTypes[(index + 1) % seatTypes.length];

    try {
      await adminApiFetch(`/admin/seats/${seat.id}`, {
        method: "PATCH",
        token,
        body: {
          seatType: nextSeatType,
          isBlocked: nextSeatType === "BLOCKED"
        }
      });
      const updated = await adminApiFetch<any[]>(`/screens/${selectedScreenId}/seats`);
      setSeats(updated);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to update seat");
    }
  };

  const grouped = seats.reduce<Record<string, any[]>>((accumulator, seat) => {
    accumulator[seat.rowLabel] = [...(accumulator[seat.rowLabel] ?? []), seat];
    return accumulator;
  }, {});

  return (
    <div className="grid">
      <PageHeader title="Seat Layout Editor" subtitle="Generate seat maps, then click seats to cycle between regular, VIP, couple, and blocked." />
      <section className="grid two-column">
        <div className="form-card">
          <div className="form-grid">
            <select className="select" value={selectedTheatreId} onChange={(event) => setSelectedTheatreId(event.target.value)}>
              {theatres.map((theatre) => <option key={theatre.id} value={theatre.id}>{theatre.name}</option>)}
            </select>
            <select className="select" value={selectedScreenId} onChange={(event) => setSelectedScreenId(event.target.value)}>
              {screens.map((screen) => <option key={screen.id} value={screen.id}>{screen.name}</option>)}
            </select>
            <input className="field" type="number" value={rows} onChange={(event) => setRows(Number(event.target.value))} />
            <input className="field" type="number" value={columns} onChange={(event) => setColumns(Number(event.target.value))} />
            {error ? <p className="error">{error}</p> : null}
            <button className="btn" onClick={generateSeats}>Generate / Reset Layout</button>
          </div>
        </div>
        <div className="table-card">
          <h3>Seat Legend</h3>
          <div className="btn-row">
            {seatTypes.map((type) => <span key={type} className={`pill seat-${type}`}>{type}</span>)}
          </div>
          <p className="muted">Click a seat below to change its type.</p>
          <div className="seat-grid">
            {Object.entries(grouped).map(([row, rowSeats]) => (
              <div className="seat-row" key={row}>
                <strong style={{ width: 24 }}>{row}</strong>
                {rowSeats.map((seat) => (
                  <button key={seat.id} className={`seat-block seat-${seat.seatType}`} onClick={() => cycleSeatType(seat)}>
                    {seat.seatNumber}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
