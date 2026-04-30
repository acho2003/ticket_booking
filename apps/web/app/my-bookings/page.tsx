"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { BookingCard } from "../../components/booking-card";
import { apiFetch, getStoredToken } from "../../lib/api";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const loadBookings = async () => {
    const token = getStoredToken();
    if (!token) {
      setError("Please log in to view your bookings.");
      setLoading(false);
      return;
    }
    try {
      const result = await apiFetch<any[]>("/my-bookings", { token });
      setBookings(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadBookings(); }, []);

  const cancelBooking = async (bookingId: string) => {
    const token = getStoredToken();
    if (!token) return;
    try {
      await apiFetch(`/bookings/${bookingId}/cancel`, { method: "PATCH", token });
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    }
  };

  return (
    <main>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Track reserved tickets, booking codes, and payment status.</p>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 64 }}>
        <div className="container">
          {loading && (
            <div className="loading-state">Loading your bookings…</div>
          )}

          {!loading && error && (
            <div className="empty-state">
              <h3>Something went wrong</h3>
              <p>{error}</p>
              {error.includes("log in") && (
                <Link href="/login" className="link-btn" style={{ marginTop: 16, display: "inline-flex" }}>Log in</Link>
              )}
            </div>
          )}

          {!loading && !error && bookings.length === 0 && (
            <div className="empty-state">
              <h3>No bookings yet</h3>
              <p>Your reserved tickets will appear here once you book a showtime.</p>
              <Link href="/movies" className="link-btn" style={{ marginTop: 16, display: "inline-flex" }}>Browse Movies</Link>
            </div>
          )}

          {!loading && !error && bookings.length > 0 && (
            <>
              <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: 16 }}>
                {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
              </p>
              <div className="grid bookings">
                {bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} onCancel={cancelBooking} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
