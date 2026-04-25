"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { formatCurrency } from "@bhutan/shared";

import { SeatMap } from "../../components/seat-map";
import { apiFetch, getStoredToken } from "../../lib/api";

function SeatSelectionContent() {
  const params = useSearchParams();
  const router = useRouter();
  const showtimeId = params.get("showtimeId");

  const [showtime, setShowtime] = useState<any | null>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!showtimeId) {
        setError("Missing showtime id.");
        setLoading(false);
        return;
      }

      try {
        const [showtimeData, seatData] = await Promise.all([
          apiFetch(`/showtimes/${showtimeId}`),
          apiFetch(`/showtimes/${showtimeId}/seats`)
        ]);
        setShowtime(showtimeData);
        setSeats(seatData as any[]);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load showtime");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [showtimeId]);

  const selectedSeats = useMemo(
    () => seats.filter((seat) => selectedSeatIds.includes(seat.id)),
    [selectedSeatIds, seats]
  );

  const total = selectedSeats.reduce((sum, seat) => sum + Number(seat.price ?? 0), 0);

  const toggleSeat = (seatId: string) => {
    setSelectedSeatIds((current) =>
      current.includes(seatId) ? current.filter((id) => id !== seatId) : [...current, seatId]
    );
  };

  const confirmBooking = async () => {
    const token = getStoredToken();

    if (!token) {
      router.push("/login");
      return;
    }

    if (!showtimeId || selectedSeatIds.length === 0) {
      setError("Select at least one seat before continuing.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const booking = await apiFetch<any>("/bookings", {
        method: "POST",
        token,
        body: {
          showtimeId,
          seatIds: selectedSeatIds
        }
      });
      router.push(`/booking-confirmation?bookingId=${booking.id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="container section">
        <div className="empty-state" style={{ padding: 24 }}>Loading seat map...</div>
      </main>
    );
  }

  return (
    <main className="container">
      <section className="page-header">
        <h1 className="page-title">Seat Selection</h1>
        <p className="page-subtitle">Choose your seats and confirm the reservation with pay at counter.</p>
      </section>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="section booking-layout">
        <SeatMap seats={seats} selectedSeatIds={selectedSeatIds} onToggle={toggleSeat} />

        <div className="seat-panel">
          <span className="badge">Booking Summary</span>
          <h2>{showtime?.movie?.title}</h2>
          <p className="muted">{showtime?.theatre?.name} | {showtime?.screen?.name}</p>
          <p>{showtime ? new Date(showtime.startTime).toLocaleString() : ""}</p>

          <div className="summary-grid">
            <div className="summary-card">
              <span>Seats</span>
              <strong>{selectedSeats.length}</strong>
            </div>
            <div className="summary-card">
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "18px 0" }} />
          <p><strong>Selected seats:</strong> {selectedSeats.map((seat) => seat.seatCode).join(", ") || "None"}</p>
          <p className="muted">
            Your booking will be created as RESERVED and marked PAY AT COUNTER until the theatre confirms payment.
          </p>
          <button className="btn" onClick={confirmBooking} disabled={submitting}>
            {submitting ? "Confirming..." : "Confirm Booking"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default function SeatSelectionPage() {
  return (
    <Suspense
      fallback={
        <main className="container section">
          <div className="empty-state" style={{ padding: 24 }}>Loading seat map...</div>
        </main>
      }
    >
      <SeatSelectionContent />
    </Suspense>
  );
}
