import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { WebView } from "react-native-webview";
import YoutubeIframe from "react-native-youtube-iframe";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ActionButton, EmptyState, MetricCard, ToneBadge } from "../components/ui";
import { mobileApiFetch, resolveMobileAssetUrl } from "../lib/api";
import { colors, fonts, layout, radii, sharedStyles, spacing } from "../lib/theme";

function getTrailerVideoId(trailerUrl?: string | null) {
  if (!trailerUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(trailerUrl);
    const host = parsedUrl.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const watchId = parsedUrl.searchParams.get("v");
      const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
      const embeddedId = pathParts[0] === "embed" || pathParts[0] === "shorts" ? pathParts[1] : null;
      return watchId ?? embeddedId;
    }

    return null;
  } catch {
    return null;
  }
}

function getTrailerEmbedUrl(videoId?: string | null) {
  return videoId ? `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1` : null;
}

function getTrailerThumbnailUrl(trailerUrl?: string | null) {
  const videoId = getTrailerVideoId(trailerUrl);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}

function getTheatresFromShowtimes(showtimes: any[]) {
  const theatresById = new Map<string, any>();

  showtimes
    .filter((showtime) => showtime.status === "ACTIVE")
    .forEach((showtime) => {
      if (showtime.theatre?.id && !theatresById.has(showtime.theatre.id)) {
        theatresById.set(showtime.theatre.id, showtime.theatre);
      }
    });

  return Array.from(theatresById.values());
}

function getMovieDateMetric(movie: any, showtimes: any[]) {
  if (movie.status === "NOW_SHOWING") {
    const latestEndTime = showtimes
      .filter((showtime) => showtime.status === "ACTIVE" && showtime.endTime)
      .map((showtime) => new Date(showtime.endTime))
      .sort((left, right) => right.getTime() - left.getTime())[0];

    return {
      label: "Ends",
      value: latestEndTime
        ? latestEndTime.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short"
          })
        : "TBA"
    };
  }

  return {
    label: "Release",
    value: new Date(movie.releaseDate).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short"
    })
  };
}

export function MovieDetailsScreen({ route, navigation }: any) {
  const { movieId } = route.params;
  const { width } = useWindowDimensions();
  const compact = width < layout.compactWidth;
  const horizontalMargin = compact ? spacing[4] : spacing[5];
  const trailerHeight = compact ? 204 : 236;
  const [movie, setMovie] = useState<any | null>(null);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [theatres, setTheatres] = useState<any[]>([]);
  const [selectedTheatreId, setSelectedTheatreId] = useState<string | null>(null);
  const [theatrePickerOpen, setTheatrePickerOpen] = useState(false);
  const [trailerMode, setTrailerMode] = useState<"hosted" | "local" | "embed">("hosted");
  const [trailerError, setTrailerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTrailerMode("hosted");
    setTrailerError(null);
    void Promise.all([
      mobileApiFetch(`/movies/${movieId}`),
      mobileApiFetch<any[]>(`/movies/${movieId}/showtimes`)
    ])
      .then(([movieData, showtimeData]) => {
        const availableTheatres = getTheatresFromShowtimes(showtimeData);
        setMovie(movieData);
        setShowtimes(showtimeData);
        setTheatres(availableTheatres);
        setSelectedTheatreId(availableTheatres[0]?.id ?? null);
      })
      .catch(() => {
        setMovie(null);
        setShowtimes([]);
        setTheatres([]);
        setSelectedTheatreId(null);
      })
      .finally(() => setLoading(false));
  }, [movieId]);

  if (loading) {
    return (
      <View style={[sharedStyles.screen, styles.centered]}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={[sharedStyles.screen, styles.centered]}>
        <EmptyState
          icon="movie-open-off"
          title="Movie unavailable"
          subtitle="We couldn't load the details for this title right now."
        />
      </View>
    );
  }

  const trailerVideoId = getTrailerVideoId(movie.trailerUrl);
  const trailerThumbnailUrl = getTrailerThumbnailUrl(movie.trailerUrl);
  const trailerEmbedUrl = getTrailerEmbedUrl(trailerVideoId);
  const trailerPreviewUrl = trailerThumbnailUrl ?? (movie.posterUrl ? resolveMobileAssetUrl(movie.posterUrl) : null);
  const dateMetric = getMovieDateMetric(movie, showtimes);
  const selectedTheatre = theatres.find((theatre) => theatre.id === selectedTheatreId) ?? null;
  const handleTrailerError = (message = "Playback failed") => {
    if (trailerMode === "hosted") {
      setTrailerMode("local");
      return;
    }

    if (trailerMode === "local") {
      setTrailerMode("embed");
      return;
    }

    setTrailerError(message);
  };

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={styles.content}>
      <View style={[styles.trailerPanel, { height: trailerHeight, marginHorizontal: horizontalMargin }]}>
        {trailerVideoId && !trailerError ? (
          trailerMode === "embed" && trailerEmbedUrl ? (
            <WebView
              source={{ uri: trailerEmbedUrl }}
              style={styles.trailerWebView}
              allowsFullscreenVideo
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              onError={() => handleTrailerError("This trailer is blocked for in-app playback.")}
              onHttpError={() => handleTrailerError("This trailer is blocked for in-app playback.")}
            />
          ) : (
            <YoutubeIframe
              height={trailerHeight}
              videoId={trailerVideoId}
              play={false}
              forceAndroidAutoplay={false}
              useLocalHTML={trailerMode === "local"}
              initialPlayerParams={{
                controls: true,
                rel: false,
                preventFullScreen: false,
                iv_load_policy: 3
              }}
              webViewProps={{
                allowsFullscreenVideo: true,
                allowsInlineMediaPlayback: true,
                mediaPlaybackRequiresUserAction: false,
                javaScriptEnabled: true,
                domStorageEnabled: true,
                originWhitelist: ["*"],
                mixedContentMode: "always"
              }}
              webViewStyle={styles.trailerWebView}
              viewContainerStyle={styles.trailerPlayer}
              onError={(error: string) => handleTrailerError(error)}
            />
          )
        ) : trailerPreviewUrl ? (
          <View style={styles.trailerUnavailable}>
            <Image source={{ uri: trailerPreviewUrl }} style={styles.trailerPreviewImage} />
            <View style={styles.trailerOverlay}>
              <MaterialCommunityIcons name="alert-circle-outline" size={28} color="#fffaf5" />
              <Text style={styles.trailerOverlayText}>
                {trailerError ?? "Trailer unavailable in the app"}
              </Text>
              {trailerError ? (
                <Pressable
                  style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
                  onPress={() => {
                    setTrailerMode("hosted");
                    setTrailerError(null);
                  }}
                >
                  <Text style={styles.retryButtonText}>Try again</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.trailerFallback}>
            <MaterialCommunityIcons name="play-circle-outline" size={42} color={colors.textMuted} />
            <Text style={styles.trailerFallbackText}>Trailer unavailable</Text>
          </View>
        )}
      </View>

      <View style={[styles.summaryCard, compact && styles.summaryCardCompact, { marginHorizontal: horizontalMargin }]}>
        <View style={styles.badgeRow}>
          <ToneBadge
            label={movie.status.replace("_", " ").toLowerCase()}
            tone={movie.status === "NOW_SHOWING" ? "brand" : "neutral"}
          />
          {movie.genre ? <ToneBadge label={movie.genre} /> : null}
          {movie.language ? <ToneBadge label={movie.language} /> : null}
        </View>

        <Text style={[styles.title, compact && styles.titleCompact]}>{movie.title}</Text>
        <Text style={styles.description}>{movie.description}</Text>

        <View style={styles.metricsRow}>
          <MetricCard value={`${movie.durationMinutes}m`} label="Runtime" />
          <MetricCard value={dateMetric.value} label={dateMetric.label} />
        </View>
      </View>

      <View style={[sharedStyles.card, styles.theatreCard, compact && styles.theatreCardCompact, { marginHorizontal: horizontalMargin }]}>
        <View style={[styles.theatreHeader, compact && styles.theatreHeaderCompact]}>
          <View style={styles.theatreHeaderCopy}>
            <Text style={styles.detailTitle}>Select theatre</Text>
            <Text style={styles.detailItemText}>Choose where you want to watch, then continue to showtimes.</Text>
          </View>
          <ToneBadge label={`${theatres.length} available`} tone={theatres.length > 0 ? "brand" : "neutral"} />
        </View>

        {theatres.length === 0 ? (
          <EmptyState
            icon="calendar-remove-outline"
            title="No showtimes yet"
            subtitle="This movie does not have active theatre showtimes right now."
          />
        ) : (
          <>
            <Pressable
              style={({ pressed }) => [styles.theatreSelect, pressed && styles.theatreSelectPressed]}
              onPress={() => setTheatrePickerOpen((value) => !value)}
            >
              <View style={styles.theatreSelectIcon}>
                <MaterialCommunityIcons name="map-marker-radius-outline" size={22} color={colors.brand} />
              </View>
              <View style={styles.theatreSelectCopy}>
                <Text style={styles.theatreSelectLabel}>Theatre</Text>
                <Text style={styles.theatreSelectName}>{selectedTheatre?.name ?? "Choose a theatre"}</Text>
                {selectedTheatre?.city ? <Text style={styles.theatreSelectMeta}>{selectedTheatre.city}</Text> : null}
              </View>
              <MaterialCommunityIcons
                name={theatrePickerOpen ? "chevron-up" : "chevron-down"}
                size={24}
                color={colors.textSoft}
              />
            </Pressable>

            {theatrePickerOpen ? (
              <View style={styles.theatreList}>
                {theatres.map((theatre) => {
                  const active = theatre.id === selectedTheatreId;

                  return (
                    <Pressable
                      key={theatre.id}
                      style={({ pressed }) => [
                        styles.theatreOption,
                        active && styles.theatreOptionActive,
                        pressed && styles.theatreSelectPressed
                      ]}
                      onPress={() => {
                        setSelectedTheatreId(theatre.id);
                        setTheatrePickerOpen(false);
                      }}
                    >
                      <View style={styles.theatreOptionCopy}>
                        <Text style={styles.theatreOptionTitle}>{theatre.name}</Text>
                        <Text style={styles.theatreOptionMeta}>{theatre.location ?? theatre.city}</Text>
                      </View>
                      {active ? <MaterialCommunityIcons name="check-circle" size={22} color={colors.brand} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            <ActionButton
              label="View showtimes"
              icon="calendar-clock-outline"
              onPress={() =>
                selectedTheatre
                  ? navigation.navigate("SelectShowtime", {
                      movieId: movie.id,
                      theatreId: selectedTheatre.id,
                      theatreName: selectedTheatre.name
                    })
                  : undefined
              }
              disabled={!selectedTheatre}
              fullWidth
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    padding: spacing[5]
  },
  content: {
    paddingBottom: spacing[10],
    gap: spacing[5]
  },
  trailerPanel: {
    marginTop: spacing[4],
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: colors.dark
  },
  trailerPlayer: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.dark
  },
  trailerWebView: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.dark
  },
  trailerUnavailable: {
    flex: 1
  },
  trailerPreviewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  trailerFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2]
  },
  trailerFallbackText: {
    color: colors.textMuted
  },
  trailerOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[3],
    backgroundColor: "rgba(31, 31, 31, 0.28)"
  },
  trailerOverlayText: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radii.pill,
    overflow: "hidden",
    backgroundColor: "rgba(31, 31, 31, 0.74)",
    color: "#fffaf5",
    fontWeight: "700",
    textAlign: "center"
  },
  retryButton: {
    minHeight: 38,
    paddingHorizontal: spacing[4],
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.button
  },
  retryButtonPressed: {
    transform: [{ scale: 0.97 }]
  },
  retryButtonText: {
    color: "#fffaf5",
    fontWeight: "700"
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[6],
    gap: spacing[4]
  },
  summaryCardCompact: {
    padding: spacing[4],
    borderRadius: radii.lg
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing[2],
    flexWrap: "wrap"
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "700",
    color: colors.text,
    fontFamily: fonts.display
  },
  titleCompact: {
    fontSize: 29,
    lineHeight: 33
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSoft
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing[3],
    flexWrap: "wrap"
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    fontFamily: fonts.display
  },
  detailItemText: {
    flex: 1,
    color: colors.textSoft,
    lineHeight: 21
  },
  theatreCard: {
    gap: spacing[4]
  },
  theatreCardCompact: {
    padding: spacing[4],
    borderRadius: radii.lg
  },
  theatreHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing[3]
  },
  theatreHeaderCompact: {
    flexDirection: "column"
  },
  theatreHeaderCopy: {
    flex: 1,
    gap: spacing[1]
  },
  theatreSelect: {
    minHeight: 78,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
    padding: spacing[4],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3]
  },
  theatreSelectPressed: {
    transform: [{ scale: 0.99 }]
  },
  theatreSelectIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSoft
  },
  theatreSelectCopy: {
    flex: 1,
    gap: 2
  },
  theatreSelectLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: colors.textMuted
  },
  theatreSelectName: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "700",
    color: colors.text,
    fontFamily: fonts.display
  },
  theatreSelectMeta: {
    color: colors.textSoft,
    fontSize: 13
  },
  theatreList: {
    gap: spacing[2]
  },
  theatreOption: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: spacing[4],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
    backgroundColor: colors.surface
  },
  theatreOptionActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft
  },
  theatreOptionCopy: {
    flex: 1,
    gap: 3
  },
  theatreOptionTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15
  },
  theatreOptionMeta: {
    color: colors.textSoft,
    fontSize: 13
  }
});
