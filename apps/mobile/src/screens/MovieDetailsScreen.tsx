import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View, Pressable } from "react-native";

import { mobileApiFetch } from "../lib/api";
import { sharedStyles } from "../lib/theme";

export function MovieDetailsScreen({ route, navigation }: any) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState<any | null>(null);

  useEffect(() => {
    void mobileApiFetch(`/movies/${movieId}`).then(setMovie).catch(() => setMovie(null));
  }, [movieId]);

  if (!movie) {
    return (
      <View style={[sharedStyles.screen, sharedStyles.content]}>
        <Text>Loading movie details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <Image source={{ uri: movie.posterUrl }} style={{ width: "100%", height: 360, borderRadius: 24 }} />
      <View style={sharedStyles.card}>
        <Text style={{ fontSize: 26, fontWeight: "700" }}>{movie.title}</Text>
        <Text style={sharedStyles.subtitle}>{movie.genre} · {movie.language} · {movie.durationMinutes} mins</Text>
        <Text style={{ marginTop: 12 }}>{movie.description}</Text>
        <View style={{ marginTop: 16, gap: 12 }}>
          <Pressable style={sharedStyles.button} onPress={() => navigation.navigate("SelectTheatre", { movieId: movie.id })}>
            <Text style={sharedStyles.buttonText}>Select Theatre</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
