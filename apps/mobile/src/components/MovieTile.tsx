import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { MovieSummary } from "@bhutan/shared";

import { colors } from "../lib/theme";

export function MovieTile({
  movie,
  onPress
}: {
  movie: MovieSummary;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: movie.posterUrl }} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.title}>{movie.title}</Text>
        <Text style={styles.meta}>{movie.genre} · {movie.language}</Text>
        <Text style={styles.description} numberOfLines={3}>{movie.description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  image: {
    width: "100%",
    height: 220
  },
  body: {
    padding: 14,
    gap: 6
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text
  },
  meta: {
    color: colors.muted
  },
  description: {
    color: colors.text
  }
});
