import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { ActionButton, EmptyState, ScreenHeader, ToneBadge } from "../components/ui";
import { authStorage, mobileApiFetch } from "../lib/api";
import { colors, fonts, layout, sharedStyles, spacing } from "../lib/theme";

export function MyBookingsScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const compact = width < layout.compactWidth;
  const [bookings, setBookings] = useState<any[]>([]);

  const load = useCallback(() => {
    void (async () => {
      const token = await authStorage.getToken();

      if (!token) {
        setBookings([]);
        return;
      }

      const result = await mobileApiFetch<any[]>("/my-bookings", { token });
      setBookings(result);
    })().catch(() => setBookings([]));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const cancelBooking = async (bookingId: string) => {
    const token = await authStorage.getToken();

    if (!token) {
      navigation.navigate("Auth");
      return;
    }

    try {
      await mobileApiFetch(`/bookings/${bookingId}/cancel`, { method: "PATCH", token });
      load();
    } catch (error) {
      Alert.alert("Unable to cancel", error instanceof Error ? error.message : "Try again later");
    }
  };

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={[sharedStyles.scrollContent, styles.content]}>
      <ScreenHeader
        eyebrow="Bookings"
        title="Your reservations"
        subtitle="Track every booking code, payment status, and the seats you've already reserved."
      />

      {bookings.length > 0 ? (
        <View style={styles.list}>
          {bookings.map((booking) => {
            const showtime = new Date(booking.showtime.startTime);

            return (
              <View key={booking.id} style={[styles.card, compact && styles.cardCompact]}>
                <View style={[styles.cardTop, compact && styles.cardTopCompact]}>
                  <View style={styles.cardCopy}>
                    <Text style={[styles.movieTitle, compact && styles.movieTitleCompact]}>{booking.showtime.movie.title}</Text>
                    <Text style={styles.metaText}>{booking.showtime.theatre.name}</Text>
                    <Text style={styles.metaText}>
                      {showtime.toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short"
                      })}{" "}
                      |{" "}
                      {showtime.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true
                      })}
                    </Text>
                  </View>

                  <View style={[styles.badges, compact && styles.badgesCompact]}>
                    <ToneBadge
                      label={booking.status}
                      tone={
                        booking.status === "CONFIRMED"
                          ? "success"
                          : booking.status === "CANCELLED"
                            ? "danger"
                            : "warning"
                      }
                    />
                    <ToneBadge label={booking.paymentStatus.replaceAll("_", " ")} />
                  </View>
                </View>

                <View style={[styles.middleRow, compact && styles.middleRowCompact]}>
                  <View>
                    <Text style={styles.smallLabel}>Booking code</Text>
                    <Text style={styles.codeText}>{booking.bookingCode}</Text>
                  </View>
                  <View style={[styles.seatWrap, compact && styles.seatWrapCompact]}>
                    <Text style={styles.smallLabel}>Seats</Text>
                    <Text style={styles.seatText}>{booking.bookingSeats.map((seat: any) => seat.seatCode).join(", ")}</Text>
                  </View>
                </View>

                {booking.status !== "CANCELLED" ? (
                  <ActionButton
                    label="Cancel booking"
                    icon="close-circle-outline"
                    variant="secondary"
                    onPress={() => cancelBooking(booking.id)}
                    fullWidth
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState
          icon="ticket-confirmation-outline"
          title="No bookings yet"
          subtitle="Once you reserve a showtime, your booking codes and seat details will appear here."
          action={
            <ActionButton
              label="Browse ongoing movies"
              icon="movie-play-outline"
              onPress={() => navigation.navigate("OngoingMovies")}
              fullWidth
            />
          }
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 144
  },
  list: {
    gap: spacing[4]
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    padding: spacing[5],
    gap: spacing[4]
  },
  cardCompact: {
    padding: spacing[4],
    borderRadius: 20
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing[4]
  },
  cardTopCompact: {
    flexDirection: "column"
  },
  cardCopy: {
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
  metaText: {
    color: colors.textSoft,
    lineHeight: 20
  },
  badges: {
    alignItems: "flex-end",
    gap: spacing[2]
  },
  badgesCompact: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap"
  },
  middleRowCompact: {
    flexDirection: "column",
    gap: spacing[3]
  },
  middleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.line
  },
  seatWrap: {
    alignItems: "flex-end"
  },
  seatWrapCompact: {
    alignItems: "flex-start"
  },
  smallLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: colors.textMuted
  },
  codeText: {
    marginTop: 6,
    fontSize: 18,
    color: colors.brand,
    fontWeight: "700",
    fontFamily: fonts.mono
  },
  seatText: {
    marginTop: 6,
    fontSize: 15,
    color: colors.text,
    fontWeight: "700"
  }
});
