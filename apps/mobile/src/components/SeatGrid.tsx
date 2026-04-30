import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ScreenSeat } from "@bhutan/shared";

import { colors, fonts, layout, radii, spacing } from "../lib/theme";

const SEAT_SIZE = 34;
const SEAT_GAP = 8;
const GAP_UNIT = 18;
const SCREEN_PANEL_MAX_WIDTH = 300;

export function SeatGrid({
  seats,
  selectedSeatIds,
  onToggle
}: {
  seats: ScreenSeat[];
  selectedSeatIds: string[];
  onToggle: (seatId: string) => void;
}) {
  const { width } = useWindowDimensions();
  const compact = width < layout.compactWidth;
  const seatSize = compact ? 29 : SEAT_SIZE;
  const seatGap = compact ? 6 : SEAT_GAP;
  const gapUnit = compact ? 14 : GAP_UNIT;
  const rowTagWidth = compact ? 18 : 24;

  const grouped = Object.entries(
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

  const widestColumn = seats.reduce(
    (largest, seat) => Math.max(largest, seat.layoutColumn ?? seat.rowWidth ?? seat.seatNumber),
    0
  );
  const responsiveContentWidth = Math.max(widestColumn * (seatSize + seatGap), compact ? 224 : 260);

  return (
    <View style={styles.container}>
      <View style={styles.screenWrap}>
        <View style={styles.screenPanel}>
          <Text style={styles.screenLabel}>Screen</Text>
        </View>
        <Text style={styles.screenNote}>Seats face the screen</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.grid, { minWidth: responsiveContentWidth }]}>
          {grouped.map(([row, rowSeats]) => {
            let cursor = 1;

            return (
              <View key={row} style={styles.row}>
                <View style={[styles.rowTag, { width: rowTagWidth }]}>
                  <Text style={styles.rowLabel}>{row}</Text>
                </View>

                <View style={[styles.rowSeats, { minHeight: seatSize }]}>
                  {rowSeats.map((seat) => {
                    const selected = selectedSeatIds.includes(seat.id);
                    const status = selected ? "SELECTED" : seat.status ?? "AVAILABLE";
                    const visualStatus = status === "RESERVED" || status === "BLOCKED" ? "BOOKED" : status;
                    const disabled = status === "BOOKED" || status === "RESERVED" || status === "BLOCKED";
                    const layoutColumn = seat.layoutColumn ?? seat.seatNumber;
                    const gapUnits = Math.max(layoutColumn - cursor, 0);
                    cursor = layoutColumn + 1;

                    return (
                      <View key={seat.id} style={styles.seatWrap}>
                        {gapUnits > 0 ? (
                          <View
                            style={[
                              styles.gap,
                              gapUnits > 1 && styles.aisleGap,
                              { width: gapUnits * gapUnit, marginRight: seatGap }
                            ]}
                          />
                        ) : null}

                        <Pressable
                          disabled={disabled}
                          onPress={() => onToggle(seat.id)}
                          style={({ pressed }) => [
                            styles.seat,
                            {
                              width: seatSize,
                              height: seatSize,
                              borderRadius: compact ? 10 : 12,
                              marginRight: seatGap
                            },
                            visualStatus === "AVAILABLE" && styles.seatAvailable,
                            visualStatus === "SELECTED" && styles.seatSelected,
                            visualStatus === "BOOKED" && styles.seatBooked,
                            pressed && !disabled && styles.seatPressed
                          ]}
                        >
                          <View
                            style={[
                              styles.seatTierMarker,
                              (seat.seatType === "VIP" || seat.seatType === "COUPLE") && styles.markerBalcony,
                              seat.seatType === "REGULAR" && styles.markerRegular
                            ]}
                          />
                          <Text
                            style={[
                              styles.seatText,
                              visualStatus === "SELECTED" && styles.seatTextSelected,
                              visualStatus === "BOOKED" && styles.seatTextDark
                            ]}
                          >
                            {seat.seatNumber}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>

                <View style={[styles.rowTagEnd, { width: rowTagWidth }]}>
                  <Text style={styles.rowLabel}>{row}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        {[
          ["Available", "AVAILABLE"],
          ["Selected", "SELECTED"],
          ["Booked", "BOOKED"]
        ].map(([label, value]) => (
          <View key={label} style={styles.legendItem}>
            <View
              style={[
                styles.legendSwatch,
                value === "AVAILABLE" && styles.seatAvailable,
                value === "SELECTED" && styles.seatSelected,
                value === "BOOKED" && styles.seatBooked
              ]}
            >
              {value === "SELECTED" ? (
                <MaterialCommunityIcons name="check" size={11} color="#fff9f4" />
              ) : null}
            </View>
            <Text style={styles.legendLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        {[
          ["First Class", "REGULAR"],
          ["Balcony", "VIP"]
        ].map(([label, value]) => (
          <View key={label} style={styles.legendItem}>
            <View style={styles.tierSwatch}>
              <View
                style={[
                  styles.tierDot,
                  value === "REGULAR" && styles.markerRegular,
                  value === "VIP" && styles.markerBalcony
                ]}
              />
            </View>
            <Text style={styles.legendLabel}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const baseSeat = {
  borderWidth: 1,
  alignItems: "center" as const,
  justifyContent: "center" as const
};

const styles = StyleSheet.create({
  container: {
    gap: spacing[5]
  },
  screenWrap: {
    alignItems: "center",
    gap: spacing[2],
    paddingTop: spacing[2]
  },
  screenPanel: {
    width: "82%",
    maxWidth: SCREEN_PANEL_MAX_WIDTH,
    minHeight: 38,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center"
  },
  screenLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.1
  },
  screenNote: {
    fontSize: 13,
    color: colors.textSoft
  },
  scrollContent: {
    paddingHorizontal: spacing[1]
  },
  grid: {
    gap: spacing[3]
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2]
  },
  rowTag: {
    alignItems: "center",
    justifyContent: "center"
  },
  rowTagEnd: {
    alignItems: "center",
    justifyContent: "center"
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSoft,
    fontFamily: fonts.display
  },
  rowSeats: {
    flexDirection: "row",
    alignItems: "center"
  },
  seatWrap: {
    flexDirection: "row",
    alignItems: "center"
  },
  gap: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: "rgba(151, 143, 132, 0.16)"
  },
  aisleGap: {
    backgroundColor: "rgba(151, 143, 132, 0.22)"
  },
  seat: {
    ...baseSeat
  },
  seatAvailable: {
    backgroundColor: colors.available,
    borderColor: colors.availableBorder
  },
  seatSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brandPressed
  },
  seatReserved: {
    backgroundColor: colors.reserved,
    borderColor: colors.reservedBorder
  },
  seatBooked: {
    backgroundColor: colors.booked,
    borderColor: colors.bookedBorder
  },
  seatBlocked: {
    backgroundColor: colors.blocked,
    borderColor: colors.blocked
  },
  seatPressed: {
    transform: [{ scale: 0.94 }]
  },
  seatText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSoft
  },
  seatTextSelected: {
    color: "#fff9f4"
  },
  seatTextDark: {
    color: "#fff9f4"
  },
  seatTierMarker: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 999
  },
  markerRegular: {
    backgroundColor: "#4f8c6b"
  },
  markerBalcony: {
    backgroundColor: colors.brand
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.line
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  legendSwatch: {
    width: 16,
    height: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  tierSwatch: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: colors.surfaceStrong,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  tierDot: {
    width: 6,
    height: 6,
    borderRadius: 999
  },
  legendLabel: {
    fontSize: 12,
    color: colors.textSoft
  }
});
