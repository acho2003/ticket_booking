import { formatCurrency } from "@bhutan/shared";

type BookingCardProps = {
  booking: {
    id: string;
    bookingCode: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    showtime: {
      startTime: string;
      movie: { title: string };
      theatre: { name: string };
    };
    bookingSeats: Array<{ seatCode: string }>;
  };
  onCancel?: (bookingId: string) => void;
};

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  return (
    <article className="booking-card">
      <div className="badge-row">
        <span className={`pill status-${booking.status.toLowerCase()}`}>{booking.status}</span>
        <span className="pill">{booking.paymentStatus.replaceAll("_", " ")}</span>
      </div>
      <h3>{booking.showtime.movie.title}</h3>
      <p className="muted">{booking.showtime.theatre.name}</p>
      <p>Booking code: <strong>{booking.bookingCode}</strong></p>
      <p>Seats: {booking.bookingSeats.map((seat) => seat.seatCode).join(", ")}</p>
      <p>Showtime: {new Date(booking.showtime.startTime).toLocaleString()}</p>
      <p>Total: {formatCurrency(Number(booking.totalAmount))}</p>
      {onCancel && booking.status !== "CANCELLED" ? (
        <div className="booking-actions">
          <button className="btn ghost" onClick={() => onCancel(booking.id)}>
            Cancel Booking
          </button>
        </div>
      ) : null}
    </article>
  );
}
