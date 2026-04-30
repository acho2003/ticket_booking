import type { ScreenSeat } from "@bhutan/shared";

type Props = {
  seats: ScreenSeat[];
  selectedSeatIds: string[];
  onToggle: (seatId: string) => void;
};

export function SeatMap({ seats, selectedSeatIds, onToggle }: Props) {
  const groupedSeats = Object.entries(
    seats.reduce<Record<string, ScreenSeat[]>>((accumulator, seat) => {
      accumulator[seat.rowLabel] = [...(accumulator[seat.rowLabel] ?? []), seat];
      return accumulator;
    }, {})
  )
    .map(([rowLabel, rowSeats]) => [
      rowLabel,
      [...rowSeats].sort(
        (left, right) =>
          (left.rowIndex ?? 0) - (right.rowIndex ?? 0) ||
          (left.layoutColumn ?? left.seatNumber) - (right.layoutColumn ?? right.seatNumber)
      )
    ] as const)
    .sort((left, right) => (left[1][0]?.rowIndex ?? 0) - (right[1][0]?.rowIndex ?? 0));

  const layoutWidth = seats.reduce(
    (largest, seat) => Math.max(largest, seat.layoutColumn ?? seat.rowWidth ?? seat.seatNumber),
    0
  );

  return (
    <div className="seat-map-wrap" style={{ ["--seat-layout-width" as string]: String(Math.max(layoutWidth, 10)) }}>
      <div className="screen-indicator">
        <div className="screen-bar">Screen</div>
        <p className="screen-note">The hall layout reflects this exact theatre and screen.</p>
      </div>

      <div className="seat-grid">
        {groupedSeats.map(([rowLabel, rowSeats]) => {
          let cursor = 1;

          return (
            <div key={rowLabel} className="seat-row">
              <span className="seat-row-label">{rowLabel}</span>
              <div className="seat-row-lane">
                {rowSeats.map((seat) => {
                  const selected = selectedSeatIds.includes(seat.id);
                  const statusClass = selected ? "selected" : (seat.status?.toLowerCase() ?? "available");
                  const disabled =
                    seat.status === "RESERVED" ||
                    seat.status === "BOOKED" ||
                    seat.status === "BLOCKED";
                  const layoutColumn = seat.layoutColumn ?? seat.seatNumber;
                  const gapUnits = Math.max(layoutColumn - cursor, 0);
                  cursor = layoutColumn + 1;

                  return (
                    <div key={seat.id} className="seat-cell">
                      {gapUnits > 0 ? (
                        <span
                          className={`seat-gap ${gapUnits > 1 ? "aisle" : ""}`}
                          style={{ width: `${gapUnits * 22}px` }}
                        />
                      ) : null}

                      <button
                        type="button"
                        className={`seat ${statusClass} type-${seat.seatType.toLowerCase()}`}
                        disabled={disabled}
                        title={`${seat.seatCode} - Nu. ${seat.price ?? 0}${disabled ? " (unavailable)" : ""}`}
                        onClick={() => onToggle(seat.id)}
                        aria-label={`${seat.seatCode}, ${statusClass}`}
                      >
                        <span className="seat-number">{seat.seatNumber}</span>
                        <span className="seat-tier-marker" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <span className="seat-row-label seat-row-label-end">{rowLabel}</span>
            </div>
          );
        })}
      </div>

      <div className="legend">
        {(
          [
            ["Available", "available"],
            ["Selected", "selected"],
            ["Reserved", "reserved"],
            ["Booked", "booked"],
            ["Blocked", "blocked"]
          ] as const
        ).map(([label, cssClass]) => (
          <span key={label} className="legend-item">
            <span className={`legend-swatch ${cssClass}`} />
            {label}
          </span>
        ))}
      </div>

      <div className="legend tier-legend">
        {(
          [
            ["First Class", "regular"],
            ["Balcony", "vip"]
          ] as const
        ).map(([label, cssClass]) => (
          <span key={label} className="legend-item">
            <span className={`tier-swatch ${cssClass}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
