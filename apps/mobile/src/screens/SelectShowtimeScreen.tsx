import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { SeatGrid } from "../components/SeatGrid";
import { ActionButton, EmptyState, ScreenHeader, ToneBadge } from "../components/ui";
import { authStorage, mobileApiFetch } from "../lib/api";
import { colors, fonts, layout, radii, sharedStyles, shadows, spacing } from "../lib/theme";

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

export function SelectShowtimeScreen({ route, navigation }: any) {
  const { movieId, theatreId, theatreName } = route.params;
  const { width } = useWindowDimensions();
  const compact = width < layout.compactWidth;
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [seatsByShowtime, setSeatsByShowtime] = useState<Record<string, any[]>>({});
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSelectedShowtimeId(null);
    setSelectedSeatIds([]);
    void mobileApiFetch<any[]>(`/movies/${movieId}/showtimes?theatreId=${theatreId}`)
      .then(async (result) => {
        setShowtimes(result);

        const seatEntries = await Promise.all(
          result.map(async (showtime) => {
            const seats = await mobileApiFetch<any[]>(`/showtimes/${showtime.id}/seats`).catch(() => []);
            return [showtime.id, seats] as const;
          })
        );

        const nextSeatsByShowtime = Object.fromEntries(seatEntries);
        const defaultShowtime = result.find(isShowtimeBookable) ?? result[0] ?? null;

        setSeatsByShowtime(nextSeatsByShowtime);
        setSelectedShowtimeId(defaultShowtime?.id ?? null);
      })
      .catch(() => {
        setShowtimes([]);
        setSeatsByShowtime({});
      })
      .finally(() => setLoading(false));
  }, [movieId, theatreId]);

  const groupedShowtimes = useMemo(() => {
    return showtimes.reduce<Record<string, any[]>>((accumulator, showtime) => {
      const dateKey = new Date(showtime.startTime).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short"
      });
      accumulator[dateKey] = [...(accumulator[dateKey] ?? []), showtime];
      return accumulator;
    }, {});
  }, [showtimes]);

  const selectedShowtime = showtimes.find((showtime) => showtime.id === selectedShowtimeId) ?? null;
  const selectedShowtimeCanBook = isShowtimeBookable(selectedShowtime);
  const selectedSeats = selectedShowtimeId
    ? (seatsByShowtime[selectedShowtimeId] ?? []).filter((seat) => selectedSeatIds.includes(seat.id))
    : [];
  const seatsSubtotal = selectedSeats.reduce((sum, seat) => sum + Number(seat.price ?? 0), 0);
  const serviceFee = PLATFORM_SERVICE_FEE_NU * selectedSeats.length;
  const grandTotal = seatsSubtotal + serviceFee;
  const checkoutValueStyle = [styles.checkoutValue, compact && styles.checkoutValueCompact];

  const getAvailability = (showtimeId: string) => {
    const seats = seatsByShowtime[showtimeId];

    if (!seats) {
      return null;
    }

    return seats.filter((seat) => seat.status === "AVAILABLE").length;
  };

  const selectShowtime = async (showtimeId: string) => {
    setSelectedShowtimeId(showtimeId);
    setSelectedSeatIds([]);

    if (seatsByShowtime[showtimeId]) {
      return;
    }

    setLoadingSeats(true);
    const seats = await mobileApiFetch<any[]>(`/showtimes/${showtimeId}/seats`).catch(() => []);
    setSeatsByShowtime((current) => ({ ...current, [showtimeId]: seats }));
    setLoadingSeats(false);
  };

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

    if (!selectedShowtimeId || selectedSeatIds.length === 0) {
      Alert.alert("No seats selected", "Please choose a showtime and at least one seat.");
      return;
    }

    if (!selectedShowtimeCanBook) {
      Alert.alert("Booking closed", "Booking closed for this show.");
      return;
    }

    setSubmitting(true);

    try {
      const booking = await mobileApiFetch<any>("/bookings", {
        method: "POST",
        token,
        body: {
          showtimeId: selectedShowtimeId,
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

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={[sharedStyles.scrollContent, styles.content]}>
      <ScreenHeader
        eyebrow="Step 2"
        title="Select your seats"
        subtitle={`Today's screening at ${theatreName} is selected for you. Choose your seats and confirm.`}
      />

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : null}

      {!loading && showtimes.length === 0 ? (
        <EmptyState
          icon="clock-remove-outline"
          title="No screening available"
          subtitle="This theatre doesn't have an active screening for the selected movie right now."
        />
      ) : null}

      {selectedShowtime ? (
        <View style={[styles.autoSelectedCard, compact && styles.cardCompact]}>
          <View style={[styles.cardTop, compact && styles.cardTopCompact]}>
            <View style={styles.cardCopy}>
              <Text style={styles.autoSelectedLabel}>Selected screening</Text>
              <Text style={[styles.timeText, compact && styles.timeTextCompact]}>
                {formatTime(selectedShowtime.startTime)}
              </Text>
              <Text style={styles.screenText}>
                {new Date(selectedShowtime.startTime).toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short"
                })}{" "}
                · {selectedShowtime.screen.name}
              </Text>
            </View>
            <ToneBadge
              label={
                selectedShowtimeCanBook
                  ? `${getAvailability(selectedShowtime.id) ?? 0} seats available`
                  : "Booking closed"
              }
              tone={selectedShowtimeCanBook && (getAvailability(selectedShowtime.id) ?? 0) > 0 ? "brand" : "danger"}
            />
          </View>

          <View style={styles.cutoffNotice}>
            <MaterialCommunityIcons
              name={selectedShowtimeCanBook ? "clock-check-outline" : "lock-outline"}
              size={18}
              color={selectedShowtimeCanBook ? colors.brand : colors.danger}
            />
            <Text style={[styles.cutoffText, !selectedShowtimeCanBook && styles.cutoffTextClosed]}>
              {selectedShowtimeCanBook
                ? `Booking closes at ${formatTime(selectedShowtime.bookingClosesAt)}`
                : "Booking closed for this show."}
            </Text>
          </View>

          <View style={styles.pricingWrap}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>First Class</Text>
              <Text style={styles.priceValue}>Nu. {selectedShowtime.regularPrice}</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Balcony</Text>
              <Text style={styles.priceValue}>Nu. {selectedShowtime.vipPrice}</Text>
            </View>
          </View>
        </View>
      ) : null}

      {!selectedShowtime && Object.entries(groupedShowtimes).map(([dateLabel, entries]) => (
        <View key={dateLabel} style={styles.group}>
          <Text style={styles.groupTitle}>{dateLabel}</Text>

          {entries.map((showtime) => {
            const active = selectedShowtimeId === showtime.id;
            const availableSeats = getAvailability(showtime.id);
            const canBook = isShowtimeBookable(showtime);

            return (
              <Pressable
                key={showtime.id}
                style={({ pressed }) => [styles.card, active && styles.cardActive, pressed && styles.pressed]}
                onPress={() => void selectShowtime(showtime.id)}
              >
                <View style={[styles.cardTop, compact && styles.cardTopCompact]}>
                  <View style={styles.cardCopy}>
                    <Text style={[styles.timeText, compact && styles.timeTextCompact]}>
                      {formatTime(showtime.startTime)}
                    </Text>
                    <Text style={styles.screenText}>{showtime.screen.name}</Text>
                  </View>
                  <ToneBadge
                    label={!canBook ? "Booking closed" : availableSeats === null ? "Checking seats" : `${availableSeats} seats available`}
                    tone={canBook && availableSeats !== 0 ? "brand" : "danger"}
                  />
                </View>

                <Text style={[styles.cutoffText, !canBook && styles.cutoffTextClosed]}>
                  {canBook ? `Booking closes at ${formatTime(showtime.bookingClosesAt)}` : "Booking closed for this show."}
                </Text>

                <View style={styles.pricingWrap}>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceLabel}>First Class</Text>
                    <Text style={styles.priceValue}>Nu. {showtime.regularPrice}</Text>
                  </View>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceLabel}>Balcony</Text>
                    <Text style={styles.priceValue}>Nu. {showtime.vipPrice}</Text>
                  </View>
                </View>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>{active ? "Selected" : "Tap to select seats"}</Text>
                  <MaterialCommunityIcons name={active ? "check-circle" : "arrow-right"} size={20} color={colors.brand} />
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}

      {selectedShowtime ? (
        <View style={styles.seatSection}>
          <View style={[styles.seatHeader, compact && styles.seatHeaderCompact]}>
            <View style={styles.seatHeaderCopy}>
              <Text style={styles.groupTitle}>Select seats</Text>
              <Text style={styles.screenText}>
                {formatTime(selectedShowtime.startTime)}{" "}
                · {selectedShowtime.screen.name}
              </Text>
            </View>
            <ToneBadge label={`Nu. ${PLATFORM_SERVICE_FEE_NU} fee per seat`} tone="neutral" />
          </View>

          <View style={[styles.gridCard, compact && styles.gridCardCompact]}>
            {loadingSeats ? (
              <View style={styles.loaderWrap}>
                <ActivityIndicator color={colors.brand} />
              </View>
            ) : (seatsByShowtime[selectedShowtime.id] ?? []).length > 0 ? (
              <SeatGrid
                seats={seatsByShowtime[selectedShowtime.id] ?? []}
                selectedSeatIds={selectedSeatIds}
                onToggle={toggleSeat}
              />
            ) : (
              <EmptyState
                icon="seat-outline"
                title={selectedShowtimeCanBook ? "No seats available" : "Booking closed"}
                subtitle={
                  selectedShowtimeCanBook
                    ? "We couldn't load the seat map for this showtime."
                    : "Seats are no longer available for this show."
                }
              />
            )}
          </View>

          <View style={[styles.checkoutCard, compact && styles.cardCompact]}>
            <View style={[styles.checkoutRow, compact && styles.checkoutRowCompact]}>
              <Text style={styles.checkoutLabel}>Seats</Text>
              <Text style={checkoutValueStyle}>
                {selectedSeats.length > 0 ? selectedSeats.map((seat) => seat.seatCode).join(", ") : "None selected"}
              </Text>
            </View>
            <View style={[styles.checkoutRow, compact && styles.checkoutRowCompact]}>
              <Text style={styles.checkoutLabel}>Tickets</Text>
              <Text style={checkoutValueStyle}>Nu. {seatsSubtotal.toFixed(2)}</Text>
            </View>
            <View style={[styles.checkoutRow, compact && styles.checkoutRowCompact]}>
              <Text style={styles.checkoutLabel}>Movi fee</Text>
              <Text style={checkoutValueStyle}>
                Nu. {serviceFee.toFixed(2)}
                {selectedSeats.length > 0 ? ` (${selectedSeats.length} x ${PLATFORM_SERVICE_FEE_NU})` : ""}
              </Text>
            </View>
            <View style={[styles.checkoutRow, styles.checkoutTotalRow]}>
              <Text style={styles.checkoutTotalLabel}>Total</Text>
              <Text style={styles.checkoutTotalValue}>Nu. {grandTotal.toFixed(2)}</Text>
            </View>

            <ActionButton
              label={submitting ? "Confirming booking..." : "Confirm booking"}
              icon="check-circle-outline"
              onPress={confirmBooking}
              disabled={selectedSeatIds.length === 0 || submitting || !selectedShowtimeCanBook}
              loading={submitting}
              fullWidth
            />
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 144
  },
  loaderWrap: {
    paddingVertical: spacing[6],
    alignItems: "center"
  },
  group: {
    gap: spacing[3]
  },
  groupTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "700",
    color: colors.text,
    fontFamily: fonts.display
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[5],
    gap: spacing[4],
    ...shadows.card
  },
  autoSelectedCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.brand,
    padding: spacing[5],
    gap: spacing[4],
    ...shadows.card
  },
  cardCompact: {
    padding: spacing[4],
    borderRadius: radii.lg
  },
  cardActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft
  },
  pressed: {
    transform: [{ scale: 0.985 }]
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing[3],
    flexWrap: "wrap"
  },
  cardTopCompact: {
    flexDirection: "column"
  },
  cardCopy: {
    flex: 1,
    gap: spacing[1]
  },
  autoSelectedLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700"
  },
  timeText: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.text,
    fontFamily: fonts.display
  },
  timeTextCompact: {
    fontSize: 26,
    lineHeight: 30
  },
  screenText: {
    fontSize: 14,
    color: colors.textSoft
  },
  pricingWrap: {
    flexDirection: "row",
    gap: spacing[3],
    flexWrap: "wrap"
  },
  cutoffNotice: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    padding: spacing[3],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2]
  },
  cutoffText: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "700"
  },
  cutoffTextClosed: {
    color: colors.danger
  },
  priceItem: {
    flex: 1,
    minWidth: 88,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[4]
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  priceValue: {
    marginTop: spacing[1],
    fontSize: 16,
    fontWeight: "700",
    color: colors.text
  },
  footer: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  footerText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand
  },
  seatSection: {
    gap: spacing[4]
  },
  seatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing[3]
  },
  seatHeaderCompact: {
    flexDirection: "column"
  },
  seatHeaderCopy: {
    flex: 1,
    gap: spacing[1]
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
  checkoutCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[5],
    gap: spacing[3],
    ...shadows.card
  },
  checkoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing[4]
  },
  checkoutRowCompact: {
    flexDirection: "column",
    gap: spacing[1]
  },
  checkoutLabel: {
    color: colors.textMuted,
    fontSize: 13
  },
  checkoutValue: {
    flex: 1,
    textAlign: "right",
    color: colors.text,
    fontWeight: "700"
  },
  checkoutValueCompact: {
    textAlign: "left"
  },
  checkoutTotalRow: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.line,
    alignItems: "center"
  },
  checkoutTotalLabel: {
    color: colors.text,
    fontWeight: "700"
  },
  checkoutTotalValue: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 22,
    fontFamily: fonts.display
  }
});
