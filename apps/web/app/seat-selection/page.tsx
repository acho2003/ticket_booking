"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { formatCurrency } from "@bhutan/shared";

import { SeatMap } from "../../components/seat-map";
import { apiFetch, getStoredToken } from "../../lib/api";

const PLATFORM_SERVICE_FEE_NU = 15;

function formatTime(value?: string | null) {
  if (!value) {
    return "TBA";
  }

  return new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function canBook(showtime?: any | null) {
  return Boolean(showtime && showtime.canBook !== false && !["CLOSED", "COMPLETED", "CANCELLED"].includes(showtime.bookingStatus));
}

function SeatSelectionContent() {
  const params = useSearchParams();
  const router = useRouter();
  const showtimeId = params.get("showtimeId");

  const [showtime, setShowtime] = useState<any | null>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeatIds, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!showtimeId) {
        setError("Missing showtime.");
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
  const subtotal = selectedSeats.reduce((sum, seat) => sum + Number(seat.price ?? 0), 0);
  const serviceFee = PLATFORM_SERVICE_FEE_NU * selectedSeats.length;
  const total = subtotal + serviceFee;
  const showtimeCanBook = canBook(showtime);

  const toggleSeat = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((seatId) => seatId !== id) : [...current, id]
    );

  const confirmBooking = async () => {
    const token = getStoredToken();

    if (!token) {
      router.push("/login");
      return;
    }

    if (!showtimeId || selectedSeatIds.length === 0) {
      setError("Please select at least one seat.");
      return;
    }

    if (!showtimeCanBook) {
      setError("Booking closed for this show.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const booking = await apiFetch<any>("/bookings", {
        method: "POST",
        token,
        body: { showtimeId, seatIds: selectedSeatIds }
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
      <main>
        <div className="loading-state" style={{ paddingTop: 80 }}>
          Loading seat map...
        </div>
      </main>
    );
  }

  const startTime = showtime ? new Date(showtime.startTime) : null;

  return (
    <main>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <h1 className="page-title">Select Your Seats</h1>
          <p className="page-subtitle">
            Pick from the exact hall layout for this screen, then confirm the booking and pay at the counter.
          </p>
          {error ? (
            <p className="error-text" style={{ marginTop: 12 }}>
              {error}
            </p>
          ) : null}
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 64 }}>
        <div className="container">
          <div className="seat-layout">
            <SeatMap seats={seats} selectedSeatIds={selectedSeatIds} onToggle={toggleSeat} />

            <div className="booking-panel">
              <div className="badge-row" style={{ marginBottom: 12 }}>
                <span className="badge primary">Booking Summary</span>
              </div>

              <h2>{showtime?.movie?.title ?? "-"}</h2>
              <p className="muted" style={{ fontSize: "0.82rem", marginTop: 4 }}>
                {showtime?.theatre?.name}
                {showtime?.screen?.name ? ` · ${showtime.screen.name}` : ""}
              </p>

              {startTime ? (
                <p style={{ fontSize: "0.875rem", color: "var(--text-2)", marginTop: 6 }}>
                  {startTime.toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short"
                  })}
                  {" · "}
                  {startTime.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true
                  })}
                </p>
              ) : null}

              <p style={{ fontSize: "0.86rem", color: showtimeCanBook ? "var(--muted)" : "var(--danger)", marginTop: 8, fontWeight: 700 }}>
                {showtimeCanBook
                  ? `Booking closes at ${formatTime(showtime?.bookingClosesAt)}`
                  : "Booking closed for this show."}
              </p>

              <div className="booking-summary-grid">
                <div className="summary-stat">
                  <span>Seats</span>
                  <strong>{selectedSeats.length}</strong>
                </div>
                <div className="summary-stat">
                  <span>Tickets</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>
                <div className="summary-stat">
                  <span>Movi fee</span>
                  <strong>{formatCurrency(serviceFee)}</strong>
                  <small style={{ color: "var(--muted)" }}>
                    {selectedSeats.length > 0 ? `${selectedSeats.length} x Nu. ${PLATFORM_SERVICE_FEE_NU}` : `Nu. ${PLATFORM_SERVICE_FEE_NU} per seat`}
                  </small>
                </div>
                <div className="summary-stat">
                  <span>Total</span>
                  <strong>{formatCurrency(total)}</strong>
                </div>
              </div>

              <hr className="summary-divider" />

              <p className="selected-seats-label">Selected seats</p>
              <p className="selected-seats-list">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((seat) => seat.seatCode).join(", ")
                ) : (
                  <span style={{ color: "var(--muted)" }}>None selected</span>
                )}
              </p>

              <p className="pay-note">
                Your booking will be reserved immediately. Bring your booking code to the counter to pay and confirm.
              </p>

              <button
                className="btn lg"
                style={{ width: "100%", marginTop: 16 }}
                onClick={confirmBooking}
                disabled={submitting || selectedSeatIds.length === 0 || !showtimeCanBook}
              >
                {submitting ? "Confirming..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function SeatSelectionPage() {
  return (
    <Suspense
      fallback={
        <div className="loading-state" style={{ paddingTop: 80 }}>
          Loading seat map...
        </div>
      }
    >
      <SeatSelectionContent />
    </Suspense>
  );
}
