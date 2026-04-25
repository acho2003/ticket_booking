import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { MovieTile } from "../components/MovieTile";
import { mobileApiFetch } from "../lib/api";
import { sharedStyles } from "../lib/theme";

export function MoviesScreen() {
  const navigation = useNavigation<any>();
  const [movies, setMovies] = useState<any[]>([]);

  useEffect(() => {
    void mobileApiFetch<any[]>("/movies").then(setMovies).catch(() => setMovies([]));
  }, []);

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <View>
        <Text style={sharedStyles.title}>All Movies</Text>
        <Text style={sharedStyles.subtitle}>Choose a title to view details, theatres, and showtimes.</Text>
      </View>
      {movies.map((movie) => (
        <MovieTile key={movie.id} movie={movie} onPress={() => navigation.navigate("MovieDetails", { movieId: movie.id })} />
      ))}
    </ScrollView>
  );
}
