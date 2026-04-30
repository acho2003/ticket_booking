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

const statusClass: Record<string, string> = {
  RESERVED: "reserved",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled"
};

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  const cls = statusClass[booking.status] ?? "default";
  const showtime = new Date(booking.showtime.startTime);

  return (
    <article className="booking-card">
      <div className="badge-row">
        <span className={`pill ${cls}`}>{booking.status}</span>
        <span className="pill default">{booking.paymentStatus.replaceAll("_", " ")}</span>
      </div>

      <div>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 4 }}>
          {booking.showtime.movie.title}
        </h3>
        <p className="booking-detail">{booking.showtime.theatre.name}</p>
        <p className="booking-detail">
          {showtime.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
          {" · "}
          {showtime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
        </p>
      </div>

      <div className="code-block" style={{ margin: 0, padding: "12px 14px" }}>
        <label>Booking Code</label>
        <span>{booking.bookingCode}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <p className="booking-detail">
            <strong>Seats:</strong> {booking.bookingSeats.map((s) => s.seatCode).join(", ")}
          </p>
          <p className="booking-detail">
            <strong>Total:</strong> {formatCurrency(Number(booking.totalAmount))}
          </p>
        </div>
        {onCancel && booking.status !== "CANCELLED" ? (
          <button className="btn ghost sm danger" onClick={() => onCancel(booking.id)}
            style={{ color: "var(--danger)", borderColor: "var(--danger-soft)" }}>
            Cancel
          </button>
        ) : null}
      </div>
    </article>
  );
}
