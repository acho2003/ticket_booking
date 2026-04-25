"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "../../components/page-header";
import { adminApiFetch, getAdminToken } from "../../lib/api";

export default function BookingManagementPage() {
  const token = getAdminToken();
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [bookingCode, setBookingCode] = useState("");

  const load = async (code?: string) => {
    try {
      const query = code ? `?bookingCode=${encodeURIComponent(code)}` : "";
      const result = await adminApiFetch<any[]>(`/admin/bookings${query}`, { token });
      setBookings(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load bookings");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const confirmBooking = async (bookingId: string) => {
    try {
      await adminApiFetch(`/admin/bookings/${bookingId}/confirm`, {
        method: "PATCH",
        token
      });
      await load(bookingCode);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to confirm booking");
    }
  };

  return (
    <div className="grid">
      <PageHeader title="Booking Management" subtitle="Inspect bookings, search by booking code, and confirm counter payments." />
      <div className="form-card">
        <div className="btn-row">
          <input className="field" placeholder="Search booking code" value={bookingCode} onChange={(event) => setBookingCode(event.target.value)} />
          <button className="btn" onClick={() => load(bookingCode)}>Search</button>
        </div>
      </div>
      <div className="table-card">
        {error ? <p className="error">{error}</p> : null}
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Movie</th>
              <th>Theatre</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Seats</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.bookingCode}</td>
                <td>{booking.showtime.movie.title}</td>
                <td>{booking.showtime.theatre.name}</td>
                <td><span className="pill">{booking.status}</span></td>
                <td>{booking.paymentStatus}</td>
                <td>{booking.bookingSeats.map((seat: any) => seat.seatCode).join(", ")}</td>
                <td>
                  {booking.status !== "CONFIRMED" ? (
                    <button className="btn" onClick={() => confirmBooking(booking.id)}>Confirm</button>
                  ) : (
                    <span className="success">Confirmed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
