import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { SeatGrid } from "../components/SeatGrid";
import { authStorage, mobileApiFetch } from "../lib/api";
import { sharedStyles } from "../lib/theme";

export function SeatSelectionScreen({ route, navigation }: any) {
  const { showtimeId } = route.params;
  const [showtime, setShowtime] = useState<any | null>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

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

  const total = selectedSeats.reduce((sum, seat) => sum + Number(seat.price ?? 0), 0);

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
    }
  };

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <View>
        <Text style={sharedStyles.title}>Seat Selection</Text>
        <Text style={sharedStyles.subtitle}>{showtime?.movie?.title ?? "Loading..."}</Text>
      </View>
      <View style={sharedStyles.card}>
        <Text style={sharedStyles.subtitle}>Screen</Text>
        <Text style={{ textAlign: "center", fontWeight: "700", marginBottom: 12 }}>{showtime?.screen?.name}</Text>
        <SeatGrid seats={seats} selectedSeatIds={selectedSeatIds} onToggle={toggleSeat} />
      </View>
      <View style={sharedStyles.card}>
        <Text style={{ fontWeight: "700", fontSize: 18 }}>Booking Summary</Text>
        <Text style={sharedStyles.subtitle}>Selected seats: {selectedSeats.map((seat) => seat.seatCode).join(", ") || "None"}</Text>
        <Text style={{ marginVertical: 8 }}>Total: Nu. {total.toFixed(2)}</Text>
        <Pressable style={sharedStyles.button} onPress={confirmBooking}>
          <Text style={sharedStyles.buttonText}>Confirm Booking</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
