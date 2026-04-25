import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { mobileApiFetch } from "../lib/api";
import { sharedStyles } from "../lib/theme";

export function SelectTheatreScreen({ route, navigation }: any) {
  const { movieId } = route.params;
  const [theatres, setTheatres] = useState<any[]>([]);

  useEffect(() => {
    void mobileApiFetch<any[]>("/theatres").then(setTheatres).catch(() => setTheatres([]));
  }, []);

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <Text style={sharedStyles.title}>Select Theatre</Text>
      {theatres.map((theatre) => (
        <Pressable
          key={theatre.id}
          style={sharedStyles.card}
          onPress={() => navigation.navigate("SelectShowtime", { movieId, theatreId: theatre.id, theatreName: theatre.name })}
        >
          <Text style={{ fontSize: 18, fontWeight: "700" }}>{theatre.name}</Text>
          <Text style={sharedStyles.subtitle}>{theatre.city}</Text>
          <Text>{theatre.location}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
