import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ScreenSeat } from "@bhutan/shared";

import { colors } from "../lib/theme";

export function SeatGrid({
  seats,
  selectedSeatIds,
  onToggle
}: {
  seats: ScreenSeat[];
  selectedSeatIds: string[];
  onToggle: (seatId: string) => void;
}) {
  const grouped = seats.reduce<Record<string, ScreenSeat[]>>((accumulator, seat) => {
    accumulator[seat.rowLabel] = [...(accumulator[seat.rowLabel] ?? []), seat];
    return accumulator;
  }, {});

  return (
    <View style={{ gap: 8 }}>
      {Object.entries(grouped).map(([row, rowSeats]) => (
        <View key={row} style={styles.row}>
          <Text style={styles.rowLabel}>{row}</Text>
          {rowSeats.map((seat) => {
            const selected = selectedSeatIds.includes(seat.id);
            const status = selected ? "selected" : (seat.status ?? "AVAILABLE").toLowerCase();
            const disabled = seat.status === "BOOKED" || seat.status === "RESERVED" || seat.status === "BLOCKED";

            return (
              <Pressable
                key={seat.id}
                disabled={disabled}
                onPress={() => onToggle(seat.id)}
                style={[
                  styles.seat,
                  status === "available" && { backgroundColor: colors.available },
                  status === "selected" && { backgroundColor: colors.selected },
                  status === "reserved" && { backgroundColor: colors.reserved },
                  status === "booked" && { backgroundColor: colors.booked },
                  status === "blocked" && { backgroundColor: colors.blocked }
                ]}
              >
                <Text style={[styles.seatText, status === "blocked" && { color: "white" }]}>{seat.seatNumber}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap"
  },
  rowLabel: {
    width: 18,
    fontWeight: "700",
    color: colors.text
  },
  seat: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  seatText: {
    fontSize: 10,
    color: colors.text
  }
});
