import type { ScreenSeat } from "@bhutan/shared";

type Props = {
  seats: ScreenSeat[];
  selectedSeatIds: string[];
  onToggle: (seatId: string) => void;
};

export function SeatMap({ seats, selectedSeatIds, onToggle }: Props) {
  const groupedSeats = seats.reduce<Record<string, ScreenSeat[]>>((accumulator, seat) => {
    accumulator[seat.rowLabel] = [...(accumulator[seat.rowLabel] ?? []), seat];
    return accumulator;
  }, {});

  return (
    <div className="seat-panel">
      <div className="legend">
        {[
          ["Available", "available"],
          ["Selected", "selected"],
          ["Reserved", "reserved"],
          ["Booked", "booked"],
          ["Blocked", "blocked"]
        ].map(([label, className]) => (
          <span key={label} className="legend-item">
            <span className={`legend-swatch ${className}`}></span>
            {label}
          </span>
        ))}
      </div>

      <div style={{ margin: "18px 0", textAlign: "center" }}>
        <div className="badge">Screen This Way</div>
      </div>

      <div className="seat-grid">
        {Object.entries(groupedSeats).map(([rowLabel, rowSeats]) => (
          <div key={rowLabel} className="seat-row">
            <span className="seat-label">{rowLabel}</span>
            {rowSeats.map((seat) => {
              const selected = selectedSeatIds.includes(seat.id);
              const statusClass = selected ? "selected" : seat.status?.toLowerCase() ?? "available";
              const disabled = seat.status === "RESERVED" || seat.status === "BOOKED" || seat.status === "BLOCKED";

              return (
                <button
                  key={seat.id}
                  type="button"
                  className={`seat ${statusClass}`}
                  disabled={disabled}
                  title={`${seat.seatCode} - Nu. ${seat.price ?? 0}`}
                  onClick={() => onToggle(seat.id)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
