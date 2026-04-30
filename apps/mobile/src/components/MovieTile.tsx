import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { MovieSummary } from "@bhutan/shared";

import { ToneBadge } from "./ui";
import { resolveMobileAssetUrl } from "../lib/api";
import { colors, fonts, layout, radii, shadows, spacing } from "../lib/theme";

const statusLabel: Record<string, string> = {
  NOW_SHOWING: "Now showing",
  UPCOMING: "Coming soon",
  ENDED: "Ended"
};

export function MovieTile({
  movie,
  onPress
}: {
  movie: MovieSummary;
  onPress: () => void;
}) {
  const { width } = useWindowDimensions();
  const compact = width < layout.compactWidth;
  const posterHeight = compact ? 218 : Math.min(286, Math.max(238, width * 0.64));

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.posterWrap}>
        {movie.posterUrl ? (
          <Image source={{ uri: resolveMobileAssetUrl(movie.posterUrl) }} style={[styles.poster, { height: posterHeight }]} />
        ) : (
          <View style={[styles.posterPlaceholder, { height: posterHeight }]}>
            <MaterialCommunityIcons name="movie-open-outline" size={30} color={colors.textMuted} />
            <Text style={styles.posterPlaceholderText}>Poster coming soon</Text>
          </View>
        )}

        <View style={styles.posterOverlay}>
          <ToneBadge label={statusLabel[movie.status] ?? movie.status} tone={movie.status === "NOW_SHOWING" ? "dark" : "brand"} />
          <View style={styles.runtimeChip}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#fff8f2" />
            <Text style={styles.runtimeText}>{movie.durationMinutes} min</Text>
          </View>
        </View>
      </View>

      <View style={[styles.content, compact && styles.contentCompact]}>
        <View style={styles.metaRow}>
          {movie.genre ? <ToneBadge label={movie.genre} /> : null}
          {movie.language ? <ToneBadge label={movie.language} /> : null}
        </View>

        <Text style={[styles.title, compact && styles.titleCompact]}>{movie.title}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={16} color={colors.textMuted} />
            <Text style={styles.infoText}>
              {new Date(movie.releaseDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="cash-multiple" size={16} color={colors.brand} />
            <Text style={styles.infoText}>First Class Nu. {Number(movie.regularPrice)}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="sofa-single-outline" size={16} color={colors.textMuted} />
            <Text style={styles.infoText}>Balcony Nu. {Number(movie.vipPrice)}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {movie.description}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.footerHint}>Tap to view theatres and showtimes</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={colors.brand} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.card
  },
  pressed: {
    transform: [{ scale: 0.985 }]
  },
  posterWrap: {
    position: "relative"
  },
  poster: {
    width: "100%",
    resizeMode: "cover"
  },
  posterPlaceholder: {
    width: "100%",
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2]
  },
  posterPlaceholderText: {
    color: colors.textMuted,
    fontSize: 13
  },
  posterOverlay: {
    position: "absolute",
    top: spacing[4],
    left: spacing[4],
    right: spacing[4],
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  runtimeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing[3],
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: "rgba(25, 21, 16, 0.78)"
  },
  runtimeText: {
    color: "#fff8f2",
    fontSize: 12,
    fontWeight: "700"
  },
  content: {
    padding: spacing[5],
    gap: spacing[3]
  },
  contentCompact: {
    padding: spacing[4]
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing[2],
    flexWrap: "wrap"
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "700",
    color: colors.text,
    fontFamily: fonts.display
  },
  titleCompact: {
    fontSize: 22,
    lineHeight: 26
  },
  infoRow: {
    flexDirection: "row",
    gap: spacing[3],
    flexWrap: "wrap"
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1
  },
  infoText: {
    fontSize: 13,
    color: colors.textSoft,
    flexShrink: 1
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSoft
  },
  footerRow: {
    paddingTop: spacing[3],
    marginTop: spacing[1],
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  footerHint: {
    flex: 1,
    fontSize: 13,
    color: colors.brand,
    fontWeight: "600"
  }
});
