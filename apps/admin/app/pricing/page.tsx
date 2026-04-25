"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "../../components/page-header";
import { adminApiFetch, getAdminToken } from "../../lib/api";

export default function PricingPage() {
  const token = getAdminToken();
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const result = await adminApiFetch<any[]>("/showtimes");
      setShowtimes(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load showtimes");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updatePrices = async (showtimeId: string, payload: { regularPrice: number; vipPrice: number; couplePrice: number }) => {
    try {
      await adminApiFetch(`/admin/showtimes/${showtimeId}`, {
        method: "PATCH",
        token,
        body: payload
      });
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to update pricing");
    }
  };

  return (
    <div className="grid">
      <PageHeader title="Ticket Pricing" subtitle="Adjust ticket prices per showtime for regular, VIP, and couple seats." />
      <div className="table-card">
        {error ? <p className="error">{error}</p> : null}
        <table className="table">
          <thead>
            <tr>
              <th>Movie</th>
              <th>Showtime</th>
              <th>Regular</th>
              <th>VIP</th>
              <th>Couple</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {showtimes.map((showtime) => (
              <PricingRow key={showtime.id} showtime={showtime} onSave={updatePrices} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PricingRow({
  showtime,
  onSave
}: {
  showtime: any;
  onSave: (showtimeId: string, payload: { regularPrice: number; vipPrice: number; couplePrice: number }) => void;
}) {
  const [regularPrice, setRegularPrice] = useState(showtime.regularPrice);
  const [vipPrice, setVipPrice] = useState(showtime.vipPrice);
  const [couplePrice, setCouplePrice] = useState(showtime.couplePrice);

  return (
    <tr>
      <td>{showtime.movie.title}</td>
      <td>{new Date(showtime.startTime).toLocaleString()}</td>
      <td><input className="field" type="number" value={regularPrice} onChange={(event) => setRegularPrice(Number(event.target.value))} /></td>
      <td><input className="field" type="number" value={vipPrice} onChange={(event) => setVipPrice(Number(event.target.value))} /></td>
      <td><input className="field" type="number" value={couplePrice} onChange={(event) => setCouplePrice(Number(event.target.value))} /></td>
      <td><button className="btn" onClick={() => onSave(showtime.id, { regularPrice, vipPrice, couplePrice })}>Save</button></td>
    </tr>
  );
}
