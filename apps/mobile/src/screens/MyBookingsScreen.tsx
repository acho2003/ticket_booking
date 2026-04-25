import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { authStorage, mobileApiFetch } from "../lib/api";
import { sharedStyles } from "../lib/theme";

export function MyBookingsScreen({ navigation }: any) {
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

  useFocusEffect(load);

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
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <Text style={sharedStyles.title}>My Bookings</Text>
      {bookings.map((booking) => (
        <View key={booking.id} style={sharedStyles.card}>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>{booking.showtime.movie.title}</Text>
          <Text style={sharedStyles.subtitle}>{booking.showtime.theatre.name}</Text>
          <Text>Code: {booking.bookingCode}</Text>
          <Text>Seats: {booking.bookingSeats.map((seat: any) => seat.seatCode).join(", ")}</Text>
          <Text>Status: {booking.status}</Text>
          {booking.status !== "CANCELLED" ? (
            <Pressable style={[sharedStyles.buttonSecondary, { marginTop: 12 }]} onPress={() => cancelBooking(booking.id)}>
              <Text style={sharedStyles.buttonSecondaryText}>Cancel Booking</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
      {bookings.length === 0 ? (
        <View style={sharedStyles.card}>
          <Text>No bookings yet. Reserve a seat from the Movies tab.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
