import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { SeatGrid } from "../components/SeatGrid";
import { ActionButton, EmptyState, ScreenHeader, ToneBadge } from "../components/ui";
import { authStorage, mobileApiFetch } from "../lib/api";
import { colors, fonts, layout, radii, sharedStyles, spacing } from "../lib/theme";

const PLATFORM_SERVICE_FEE_NU = 15;

function formatTime(value?: string | null) {
  if (!value) {
    return "TBA";
  }

  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function isShowtimeBookable(showtime?: any | null) {
  return Boolean(showtime && showtime.canBook !== false && !["CLOSED", "COMPLETED", "CANCELLED"].includes(showtime.bookingStatus));
}

export function SeatSelectionScreen({ route, navigation }: any) {
  const { showtimeId } = route.params;
  const { width } = useWindowDimensions();
  const compact = width < layout.compactWidth;
  const [showtime, setShowtime] = useState<any | null>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void Promise.all([
      mobileApiFetch(`/showtimes/${showtimeId}`),
      mobileApiFetch(`/showtimes/${showtimeId}/seats`)
    ])
      .then(([showtimeData, seatsData]) => {
        setShowtime(showtimeData);
        setSeats(seatsData as any[]);
      })
      .catch(() => {
        setShowtime(null);
        setSeats([]);
      });
  }, [showtimeId]);

  const selectedSeats = useMemo(
    () => seats.filter((seat) => selectedSeatIds.includes(seat.id)),
    [selectedSeatIds, seats]
  );

  const subtotal = selectedSeats.reduce((sum, seat) => sum + Number(seat.price ?? 0), 0);
  const serviceFee = PLATFORM_SERVICE_FEE_NU * selectedSeats.length;
  const total = subtotal + serviceFee;
  const showtimeCanBook = isShowtimeBookable(showtime);

  const toggleSeat = (seatId: string) => {
    setSelectedSeatIds((current) =>
      current.includes(seatId) ? current.filter((id) => id !== seatId) : [...current, seatId]
    );
  };

  const confirmBooking = async () => {
    const token = await authStorage.getToken();

    if (!token) {
      navigation.navigate("Auth");
      return;
    }

    if (selectedSeatIds.length === 0) {
      Alert.alert("No seats selected", "Please choose at least one seat before continuing.");
      return;
    }

    if (!showtimeCanBook) {
      Alert.alert("Booking closed", "Booking closed for this show.");
      return;
    }

    setSubmitting(true);

    try {
      const booking = await mobileApiFetch<any>("/bookings", {
        method: "POST",
        token,
        body: {
          showtimeId,
          seatIds: selectedSeatIds
        }
      });
      navigation.navigate("BookingSummary", { bookingId: booking.id });
    } catch (error) {
      Alert.alert("Booking failed", error instanceof Error ? error.message : "Please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const start = showtime ? new Date(showtime.startTime) : null;

  return (
    <View style={sharedStyles.screen}>
      <ScrollView contentContainerStyle={[sharedStyles.scrollContent, styles.scrollContent]}>
        <ScreenHeader
          eyebrow="Step 3"
          title="Pick your seats"
          subtitle="Choose the seats you want and we'll hold the exact total before you confirm."
        />

        {showtime ? (
          <View style={[styles.contextCard, compact && styles.contextCardCompact]}>
            <View style={[styles.contextTop, compact && styles.contextTopCompact]}>
              <View style={styles.contextCopy}>
                <Text style={[styles.movieTitle, compact && styles.movieTitleCompact]}>{showtime.movie?.title ?? "Selected show"}</Text>
                <Text style={styles.contextMeta}>
                  {showtime.theatre?.name} | {showtime.screen?.name}
                </Text>
              </View>
              <ToneBadge label="Pay at counter" tone="brand" />
            </View>

            {start ? (
              <Text style={styles.contextDate}>
                {start.toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short"
                })}{" "}
                |{" "}
                {formatTime(showtime.startTime)}
              </Text>
            ) : null}
            <Text style={[styles.contextDate, !showtimeCanBook && styles.closedText]}>
              {showtimeCanBook
                ? `Booking closes at ${formatTime(showtime.bookingClosesAt)}`
                : "Booking closed for this show."}
            </Text>
          </View>
        ) : null}

        <View style={[styles.gridCard, compact && styles.gridCardCompact]}>
          {seats.length > 0 ? (
            <SeatGrid seats={seats} selectedSeatIds={selectedSeatIds} onToggle={toggleSeat} />
          ) : (
            <EmptyState
              icon="seat-outline"
              title={showtimeCanBook ? "No seats available" : "Booking closed"}
              subtitle={showtimeCanBook ? "We couldn't load the seat map for this showtime." : "Seats are no longer available for this show."}
            />
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomSheet, compact && styles.bottomSheetCompact]}>
        <View style={[styles.summaryRow, compact && styles.summaryRowCompact]}>
          <View style={styles.summaryMetric}>
            <Text style={styles.summaryLabel}>Seats</Text>
            <Text style={styles.summaryValue}>
              {selectedSeats.length > 0 ? selectedSeats.map((seat) => seat.seatCode).join(", ") : "None selected"}
            </Text>
          </View>
          <View style={[styles.summaryMetricRight, compact && styles.summaryMetricRightCompact]}>
            <Text style={styles.summaryLabel}>Total incl. Nu. {PLATFORM_SERVICE_FEE_NU}/seat fee</Text>
            <Text style={styles.summaryPrice}>Nu. {total.toFixed(2)}</Text>
          </View>
        </View>

        <ActionButton
          label={submitting ? "Confirming booking..." : "Confirm booking"}
          icon="check-circle-outline"
          onPress={confirmBooking}
          disabled={selectedSeatIds.length === 0 || submitting || !showtimeCanBook}
          loading={submitting}
          fullWidth
        />

        <Pressable onPress={() => navigation.navigate("Auth")}>
          <Text style={styles.bottomHint}>Need to sign in first? Continue with your account.</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 220
  },
  contextCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[5],
    gap: spacing[3]
  },
  contextCardCompact: {
    padding: spacing[4],
    borderRadius: radii.lg
  },
  contextTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing[3]
  },
  contextTopCompact: {
    flexDirection: "column"
  },
  contextCopy: {
    flex: 1,
    gap: spacing[1]
  },
  movieTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "700",
    color: colors.text,
    fontFamily: fonts.display
  },
  movieTitleCompact: {
    fontSize: 21,
    lineHeight: 25
  },
  contextMeta: {
    color: colors.textSoft
  },
  contextDate: {
    color: colors.textSoft,
    fontSize: 14
  },
  closedText: {
    color: colors.danger,
    fontWeight: "700"
  },
  gridCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[5]
  },
  gridCardCompact: {
    padding: spacing[3],
    borderRadius: radii.lg
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 253, 250, 0.98)",
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderTopWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[3]
  },
  bottomSheetCompact: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[5],
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing[4]
  },
  summaryRowCompact: {
    flexDirection: "column",
    gap: spacing[2]
  },
  summaryMetric: {
    flex: 1,
    gap: 6
  },
  summaryMetricRight: {
    alignItems: "flex-end",
    gap: 6
  },
  summaryMetricRightCompact: {
    alignItems: "flex-start"
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  summaryValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "700"
  },
  summaryPrice: {
    fontSize: 24,
    lineHeight: 28,
    color: colors.text,
    fontWeight: "700",
    fontFamily: fonts.display
  },
  bottomHint: {
    fontSize: 13,
    color: colors.textSoft,
    textAlign: "center"
  }
});
