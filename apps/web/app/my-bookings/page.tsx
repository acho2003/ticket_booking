"use client";

import { useEffect, useState } from "react";

import { BookingCard } from "../../components/booking-card";
import { apiFetch, getStoredToken } from "../../lib/api";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    const token = getStoredToken();

    if (!token) {
      setError("Please login to view your bookings.");
      setLoading(false);
      return;
    }

    try {
      const result = await apiFetch<any[]>("/my-bookings", { token });
      setBookings(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  const cancelBooking = async (bookingId: string) => {
    const token = getStoredToken();

    if (!token) {
      return;
    }

    try {
      await apiFetch(`/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        token
      });
      await loadBookings();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to cancel booking");
    }
  };

  return (
    <main className="container">
      <section className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">Track reserved tickets, booking codes, and cancellation status.</p>
      </section>

      <section className="section">
        {loading ? <p className="muted">Loading bookings...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        <div className="grid">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onCancel={cancelBooking} />
          ))}
          {!loading && bookings.length === 0 && !error ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <h3>No bookings yet</h3>
              <p className="muted">Your reserved tickets will appear here after checkout.</p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
