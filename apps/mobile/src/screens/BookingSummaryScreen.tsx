import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { authStorage, mobileApiFetch } from "../lib/api";
import { sharedStyles } from "../lib/theme";

export function BookingSummaryScreen({ route }: any) {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      const token = await authStorage.getToken();
      if (!token) return;
      const data = await mobileApiFetch(`/bookings/${bookingId}`, { token });
      setBooking(data);
    };

    void load().catch(() => setBooking(null));
  }, [bookingId]);

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <View style={sharedStyles.card}>
        <Text style={sharedStyles.title}>Booking Confirmed</Text>
        <Text style={sharedStyles.subtitle}>Payment will be collected at the counter.</Text>
        <Text style={{ marginTop: 16 }}>Booking code: {booking?.bookingCode ?? "..."}</Text>
        <Text>Seats: {booking?.bookingSeats?.map((seat: any) => seat.seatCode).join(", ")}</Text>
        <Text>Status: {booking?.status}</Text>
      </View>
    </ScrollView>
  );
}
