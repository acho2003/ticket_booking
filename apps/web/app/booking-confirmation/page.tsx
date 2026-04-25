"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { apiFetch, getStoredToken } from "../../lib/api";

function BookingConfirmationContent() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId");
  const [booking, setBooking] = useState<any | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!bookingId) {
        return;
      }

      try {
        const token = getStoredToken();

        if (!token) {
          setError("Login required to view this booking.");
          return;
        }

        const bookingData = await apiFetch(`/bookings/${bookingId}`, { token });
        setBooking(bookingData);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load booking");
      }
    };

    void load();
  }, [bookingId]);

  return (
    <main className="container">
      <section className="page-header">
        <h1 className="page-title">Booking Confirmation</h1>
        <p className="page-subtitle">Your booking has been recorded. Present this code at the counter.</p>
      </section>

      <section className="section">
        <div className="detail-card">
          {error ? <p className="error-text">{error}</p> : null}
          {booking ? (
            <>
              <div className="badge-row">
                <span className={`pill status-${booking.status.toLowerCase()}`}>{booking.status}</span>
                <span className="pill">{booking.paymentStatus.replaceAll("_", " ")}</span>
              </div>
              <h2>{booking.showtime.movie.title}</h2>
              <p className="muted">{booking.showtime.theatre.name} · {booking.showtime.screen.name}</p>
              <p>Booking code: <strong>{booking.bookingCode}</strong></p>
              <p>Seats: {booking.bookingSeats.map((seat: any) => seat.seatCode).join(", ")}</p>
              <p>Showtime: {new Date(booking.showtime.startTime).toLocaleString()}</p>
              <div className="cta-row" style={{ marginTop: 18 }}>
                <Link className="link-btn" href="/my-bookings">View My Bookings</Link>
                <Link className="link-btn secondary" href="/movies">Book Another Movie</Link>
              </div>
            </>
          ) : (
            <p className="muted">Loading your booking...</p>
          )}
        </div>
      </section>
    </main>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<main className="container section"><div className="empty-state" style={{ padding: 24 }}>Loading booking...</div></main>}>
      <BookingConfirmationContent />
    </Suspense>
  );
}
