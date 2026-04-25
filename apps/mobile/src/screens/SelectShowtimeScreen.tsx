import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { mobileApiFetch } from "../lib/api";
import { sharedStyles } from "../lib/theme";

export function SelectShowtimeScreen({ route, navigation }: any) {
  const { movieId, theatreId, theatreName } = route.params;
  const [showtimes, setShowtimes] = useState<any[]>([]);

  useEffect(() => {
    void mobileApiFetch<any[]>(`/movies/${movieId}/showtimes?theatreId=${theatreId}`)
      .then(setShowtimes)
      .catch(() => setShowtimes([]));
  }, [movieId, theatreId]);

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <View>
        <Text style={sharedStyles.title}>Select Showtime</Text>
        <Text style={sharedStyles.subtitle}>{theatreName}</Text>
      </View>
      {showtimes.map((showtime) => (
        <Pressable key={showtime.id} style={sharedStyles.card} onPress={() => navigation.navigate("SeatSelection", { showtimeId: showtime.id })}>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>{showtime.screen.name}</Text>
          <Text style={sharedStyles.subtitle}>{new Date(showtime.startTime).toLocaleString()}</Text>
          <Text>Regular Nu. {showtime.regularPrice} · VIP Nu. {showtime.vipPrice}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
