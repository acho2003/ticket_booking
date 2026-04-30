import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ActionButton, BrandMark, EmptyState, ScreenHeader, ToneBadge } from "../components/ui";
import { authStorage, mobileApiFetch } from "../lib/api";
import { colors, fonts, layout, radii, sharedStyles, spacing } from "../lib/theme";

const PLATFORM_SERVICE_FEE_NU = 15;

export function BookingSummaryScreen({ route }: any) {
  const { bookingId } = route.params;
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const compact = width < layout.compactWidth;
  const [booking, setBooking] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      const token = await authStorage.getToken();

      if (!token) {
        return;
      }

      const data = await mobileApiFetch(`/bookings/${bookingId}`, { token });
      setBooking(data);
    };

    void load().catch(() => setBooking(null));
  }, [bookingId]);

  const seatSubtotal = booking
    ? booking.bookingSeats.reduce((total: number, seat: any) => total + Number(seat.price ?? 0), 0)
    : 0;
  const serviceFee = booking ? Math.max(Number(booking.totalAmount ?? 0) - seatSubtotal, 0) : 0;
  const perSeatServiceFee = booking?.bookingSeats.length ? serviceFee / booking.bookingSeats.length : PLATFORM_SERVICE_FEE_NU;
  const infoValueStyle = [styles.infoValue, compact && styles.infoValueCompact];

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.scrollContent}>
      {booking ? (
        <>
          <View style={[styles.heroCard, compact && styles.cardCompact]}>
            <BrandMark showWordmark showSlogan />
            <View style={styles.successIcon}>
              <MaterialCommunityIcons name="check-bold" size={28} color={colors.success} />
            </View>
            <ScreenHeader
              eyebrow="Reservation secured"
              title="Booking confirmed"
              subtitle="You're all set. Show the booking code at the counter to complete payment and collect your tickets."
            />
          </View>

          <View style={[styles.codeCard, compact && styles.cardCompact]}>
            <Text style={styles.codeLabel}>Booking code</Text>
            <Text style={[styles.codeValue, compact && styles.codeValueCompact]}>{booking.bookingCode}</Text>
          </View>

          <View style={[sharedStyles.card, styles.infoCard, compact && styles.cardCompact]}>
            <View style={[styles.infoRow, compact && styles.infoRowCompact]}>
              <Text style={styles.infoKey}>Status</Text>
              <ToneBadge label={booking.status} tone={booking.status === "CONFIRMED" ? "success" : "warning"} />
            </View>
            <View style={[styles.infoRow, compact && styles.infoRowCompact]}>
              <Text style={styles.infoKey}>Movie</Text>
              <Text style={infoValueStyle}>{booking.showtime.movie.title}</Text>
            </View>
            <View style={[styles.infoRow, compact && styles.infoRowCompact]}>
              <Text style={styles.infoKey}>Theatre</Text>
              <Text style={infoValueStyle}>{booking.showtime.theatre.name}</Text>
            </View>
            <View style={[styles.infoRow, compact && styles.infoRowCompact]}>
              <Text style={styles.infoKey}>Seats</Text>
              <Text style={infoValueStyle}>{booking.bookingSeats.map((seat: any) => seat.seatCode).join(", ")}</Text>
            </View>
            <View style={[styles.infoRow, compact && styles.infoRowCompact]}>
              <Text style={styles.infoKey}>Tickets</Text>
              <Text style={infoValueStyle}>Nu. {seatSubtotal.toFixed(2)}</Text>
            </View>
            <View style={[styles.infoRow, compact && styles.infoRowCompact]}>
              <Text style={styles.infoKey}>Movi fee</Text>
              <Text style={infoValueStyle}>Nu. {serviceFee.toFixed(2)}</Text>
            </View>
            <Text style={styles.feeNote}>
              {booking.bookingSeats.length} x Nu. {perSeatServiceFee.toFixed(2)} service fee
            </Text>
            <View style={[styles.infoRow, compact && styles.infoRowCompact]}>
              <Text style={styles.infoKey}>Total</Text>
              <Text style={infoValueStyle}>Nu. {Number(booking.totalAmount).toFixed(2)}</Text>
            </View>
            <View style={[styles.infoRow, compact && styles.infoRowCompact]}>
              <Text style={styles.infoKey}>Payment</Text>
              <Text style={infoValueStyle}>{booking.paymentStatus.replaceAll("_", " ")}</Text>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <ActionButton
              label="View my bookings"
              icon="ticket-confirmation-outline"
              onPress={() => navigation.navigate("MyBookings")}
              fullWidth
            />
            <ActionButton
              label="Browse ongoing movies"
              icon="movie-play-outline"
              variant="secondary"
              onPress={() => navigation.navigate("Tabs", { screen: "OngoingMovies" })}
              fullWidth
            />
          </View>
        </>
      ) : (
        <EmptyState
          icon="ticket-confirmation-outline"
          title="Booking details unavailable"
          subtitle="We couldn't load the booking summary right now."
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[6],
    gap: spacing[4]
  },
  cardCompact: {
    padding: spacing[4],
    borderRadius: radii.lg
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.successSoft
  },
  codeCard: {
    backgroundColor: colors.button,
    borderRadius: radii.xl,
    padding: spacing[6],
    alignItems: "center",
    gap: spacing[2]
  },
  codeLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "rgba(255, 250, 245, 0.78)",
    fontWeight: "700"
  },
  codeValue: {
    fontSize: 28,
    lineHeight: 32,
    color: "#fff8f2",
    fontWeight: "700",
    fontFamily: fonts.mono
  },
  codeValueCompact: {
    fontSize: 22,
    lineHeight: 26
  },
  infoCard: {
    gap: spacing[4]
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing[4]
  },
  infoRowCompact: {
    flexDirection: "column",
    gap: spacing[1]
  },
  infoKey: {
    color: colors.textMuted,
    fontSize: 13
  },
  infoValue: {
    flex: 1,
    textAlign: "right",
    color: colors.text,
    fontWeight: "600"
  },
  infoValueCompact: {
    textAlign: "left"
  },
  feeNote: {
    marginTop: -spacing[3],
    textAlign: "right",
    color: colors.textMuted,
    fontSize: 12
  },
  buttonGroup: {
    gap: spacing[3]
  }
});
