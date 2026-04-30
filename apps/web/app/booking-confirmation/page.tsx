"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { formatCurrency } from "@bhutan/shared";

import { apiFetch, getStoredToken } from "../../lib/api";

const PLATFORM_SERVICE_FEE_NU = 15;

const statusClass: Record<string, string> = {
  RESERVED: "reserved",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled"
};

function BookingConfirmationContent() {
  const params    = useSearchParams();
  const bookingId = params.get("bookingId");
  const [booking, setBooking] = useState<any | null>(null);
  const [error, setError]     = useState("");

  useEffect(() => {
    const load = async () => {
      if (!bookingId) return;
      const token = getStoredToken();
      if (!token) { setError("Login required to view this booking."); return; }
      try {
        const data = await apiFetch(`/bookings/${bookingId}`, { token });
        setBooking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load booking");
      }
    };
    void load();
  }, [bookingId]);

  const seatSubtotal = booking
    ? booking.bookingSeats.reduce((total: number, seat: any) => total + Number(seat.price ?? 0), 0)
    : 0;
  const serviceFee = booking ? Math.max(Number(booking.totalAmount ?? 0) - seatSubtotal, 0) : 0;
  const perSeatServiceFee = booking?.bookingSeats.length ? serviceFee / booking.bookingSeats.length : PLATFORM_SERVICE_FEE_NU;

  return (
    <main>
      <section className="section" style={{ paddingBottom: 64 }}>
        <div className="container">
          <div className="confirmation-card">
            {error && <p className="error-text">{error}</p>}

            {!booking && !error && (
              <div className="loading-state">Loading your booking…</div>
            )}

            {booking && (
              <>
                <div className="confirmation-icon">✓</div>
                <h1 className="confirmation-title">You&apos;re all booked!</h1>
                <p className="confirmation-meta">
                  Your reservation is confirmed. Show the code below at the counter to pay and collect your tickets.
                </p>

                <div className="badge-row" style={{ marginTop: 16 }}>
                  <span className={`pill ${statusClass[booking.status] ?? "default"}`}>{booking.status}</span>
                  <span className="pill default">{booking.paymentStatus.replaceAll("_", " ")}</span>
                </div>

                <div className="code-block">
                  <label>Booking Code</label>
                  <span>{booking.bookingCode}</span>
                </div>

                <div style={{ display: "grid", gap: 8, fontSize: "0.875rem", color: "var(--text-2)" }}>
                  <div><strong style={{ color: "var(--text)" }}>Film:</strong> {booking.showtime.movie.title}</div>
                  <div><strong style={{ color: "var(--text)" }}>Theatre:</strong> {booking.showtime.theatre.name} · {booking.showtime.screen.name}</div>
                  <div>
                    <strong style={{ color: "var(--text)" }}>Showtime:</strong>{" "}
                    {new Date(booking.showtime.startTime).toLocaleDateString("en-GB", {
                      weekday: "long", day: "numeric", month: "long"
                    })}
                    {" at "}
                    {new Date(booking.showtime.startTime).toLocaleTimeString("en-US", {
                      hour: "numeric", minute: "2-digit", hour12: true
                    })}
                  </div>
                  <div><strong style={{ color: "var(--text)" }}>Seats:</strong> {booking.bookingSeats.map((s: any) => s.seatCode).join(", ")}</div>
                </div>

                <div className="booking-summary-grid" style={{ marginTop: 20 }}>
                  <div className="summary-stat">
                    <span>Tickets</span>
                    <strong>{formatCurrency(seatSubtotal)}</strong>
                  </div>
                  <div className="summary-stat">
                    <span>Movi fee</span>
                    <strong>{formatCurrency(serviceFee)}</strong>
                    <small style={{ color: "var(--muted)" }}>
                      {booking.bookingSeats.length} x Nu. {perSeatServiceFee.toFixed(2)}
                    </small>
                  </div>
                  <div className="summary-stat">
                    <span>Total</span>
                    <strong>{formatCurrency(Number(booking.totalAmount))}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
                  <Link className="link-btn" href="/my-bookings">View My Bookings</Link>
                  <Link className="link-btn secondary" href="/movies">Book Another</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="loading-state" style={{ paddingTop: 80 }}>Loading booking…</div>}>
      <BookingConfirmationContent />
    </Suspense>
  );
}
