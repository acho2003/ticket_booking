import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandMark } from "../components/ui";
import { colors, fonts, layout, radii, shadows, spacing } from "../lib/theme";
import { AuthScreen } from "../screens/AuthScreen";
import { BookingSummaryScreen } from "../screens/BookingSummaryScreen";
import { MovieDetailsScreen } from "../screens/MovieDetailsScreen";
import { OngoingMoviesScreen, UpcomingMoviesScreen } from "../screens/MoviesScreen";
import { MyBookingsScreen } from "../screens/MyBookingsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SeatSelectionScreen } from "../screens/SeatSelectionScreen";
import { SelectShowtimeScreen } from "../screens/SelectShowtimeScreen";

export type RootStackParamList = {
  Tabs: undefined;
  MovieDetails: { movieId: string };
  SelectShowtime: { movieId: string; theatreId: string; theatreName: string };
  SeatSelection: { showtimeId: string };
  BookingSummary: { bookingId: string };
  Auth: undefined;
};

export type RootTabParamList = {
  OngoingMovies: undefined;
  UpcomingMovies: undefined;
  MyBookings: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const tabMeta: Record<keyof RootTabParamList, { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  OngoingMovies: { label: "Ongoing", icon: "movie-play-outline" },
  UpcomingMovies: { label: "Upcoming", icon: "calendar-clock-outline" },
  MyBookings: { label: "Bookings", icon: "ticket-confirmation-outline" },
  Profile: { label: "Profile", icon: "account-circle-outline" }
};

function MoviTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < layout.compactWidth;

  return (
    <View pointerEvents="box-none" style={[styles.tabBarWrap, compact && styles.tabBarWrapCompact]}>
      <View style={[styles.tabBar, compact && styles.tabBarCompact, { paddingBottom: Math.max(insets.bottom, compact ? 8 : 10) }]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const options = descriptors[route.key].options;
          const meta = tabMeta[route.name as keyof RootTabParamList];

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={({ pressed }) => [
                styles.tabItem,
                compact && styles.tabItemCompact,
                focused && styles.tabItemActive,
                pressed && styles.tabItemPressed
              ]}
              accessibilityRole="button"
              accessibilityLabel={options.tabBarAccessibilityLabel}
            >
              <MaterialCommunityIcons
                name={meta.icon}
                size={compact ? 19 : 20}
                color={focused ? colors.text : colors.textSoft}
              />
              <Text style={[styles.tabLabel, compact && styles.tabLabelCompact, focused && styles.tabLabelActive]} numberOfLines={1}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function TabNavigator() {
  return (
    <SafeAreaView style={styles.tabsSafeArea} edges={["top"]}>
      <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <MoviTabBar {...props} />}>
        <Tab.Screen name="OngoingMovies" component={OngoingMoviesScreen} options={{ title: "Ongoing" }} />
        <Tab.Screen name="UpcomingMovies" component={UpcomingMoviesScreen} options={{ title: "Upcoming" }} />
        <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: "Bookings" }} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const stackScreenOptions = {
  headerShadowVisible: false,
  headerTintColor: colors.text,
  headerStyle: { backgroundColor: colors.page },
  headerTitleStyle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700" as const,
    fontFamily: fonts.display
  },
  headerBackTitleVisible: false,
  contentStyle: { backgroundColor: colors.page }
};

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="MovieDetails"
        component={MovieDetailsScreen}
        options={{
          title: "Film Details"
        }}
      />
      <Stack.Screen
        name="SelectShowtime"
        component={SelectShowtimeScreen}
        options={{
          title: "Choose Showtime"
        }}
      />
      <Stack.Screen
        name="SeatSelection"
        component={SeatSelectionScreen}
        options={{
          title: "Pick Your Seats"
        }}
      />
      <Stack.Screen
        name="BookingSummary"
        component={BookingSummaryScreen}
        options={{
          title: "Booking Confirmed",
          headerBackVisible: false,
          headerRight: () => <BrandMark size={36} />
        }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{
          title: "Account"
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabsSafeArea: {
    flex: 1,
    backgroundColor: colors.page
  },
  tabBarWrap: {
    position: "absolute",
    left: spacing[5],
    right: spacing[5],
    bottom: 0
  },
  tabBarWrapCompact: {
    left: spacing[3],
    right: spacing[3]
  },
  tabBar: {
    flexDirection: "row",
    gap: spacing[2],
    marginBottom: spacing[4],
    padding: spacing[2],
    borderRadius: radii.xl,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.floating
  },
  tabBarCompact: {
    gap: spacing[1],
    marginBottom: spacing[3],
    padding: 6,
    borderRadius: radii.lg
  },
  tabItem: {
    flex: 1,
    minHeight: 58,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  tabItemCompact: {
    minHeight: 52,
    gap: 4
  },
  tabItemActive: {
    backgroundColor: colors.brand
  },
  tabItemPressed: {
    transform: [{ scale: 0.98 }]
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSoft
  },
  tabLabelCompact: {
    fontSize: 10
  },
  tabLabelActive: {
    color: colors.text
  }
});
