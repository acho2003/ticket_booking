import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { MovieTile } from "../components/MovieTile";
import { EmptyState, ScreenHeader, ToneBadge } from "../components/ui";
import { mobileApiFetch } from "../lib/api";
import { colors, sharedStyles, spacing } from "../lib/theme";

type MovieStatus = "NOW_SHOWING" | "UPCOMING";

type MovieListCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptySubtitle: string;
  badge: string;
};

const movieListCopy: Record<MovieStatus, MovieListCopy> = {
  NOW_SHOWING: {
    eyebrow: "Now playing",
    title: "Ongoing movies",
    subtitle: "Book seats for films currently screening across Movi theatres.",
    emptyTitle: "No ongoing movies",
    emptySubtitle: "Current screenings will appear here as soon as theatres publish showtimes.",
    badge: "Live"
  },
  UPCOMING: {
    eyebrow: "Coming next",
    title: "Upcoming movies",
    subtitle: "Browse upcoming releases before they open for seat booking.",
    emptyTitle: "No upcoming movies",
    emptySubtitle: "Future releases will appear here once they are added by the theatre team.",
    badge: "Soon"
  }
};

function MovieListScreen({ status }: { status: MovieStatus }) {
  const navigation = useNavigation<any>();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const copy = movieListCopy[status];

  useEffect(() => {
    setLoading(true);
    void mobileApiFetch<any[]>(`/movies?status=${status}`)
      .then((movieData) => {
        setMovies(movieData);
        setError(null);
      })
      .catch((fetchError) => {
        setMovies([]);
        setError(fetchError instanceof Error ? fetchError.message : "Could not load movies right now.");
      })
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={[sharedStyles.scrollContent, styles.content]}>
      <ScreenHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
      />

      <View style={styles.summaryRow}>
        <ToneBadge label={`${movies.length} ${copy.badge.toLowerCase()}`} tone={status === "NOW_SHOWING" ? "brand" : "warning"} />
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : null}

      {!loading && movies.length === 0 ? (
        <EmptyState
          icon="movie-open-outline"
          title={error ? "Couldn't load movies" : copy.emptyTitle}
          subtitle={
            error ??
            copy.emptySubtitle
          }
        />
      ) : null}

      {movies.map((movie) => (
        <MovieTile key={movie.id} movie={movie} onPress={() => navigation.navigate("MovieDetails", { movieId: movie.id })} />
      ))}
    </ScrollView>
  );
}

export function OngoingMoviesScreen() {
  return <MovieListScreen status="NOW_SHOWING" />;
}

export function UpcomingMoviesScreen() {
  return <MovieListScreen status="UPCOMING" />;
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 144
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  loaderWrap: {
    paddingVertical: spacing[6],
    alignItems: "center"
  }
});
