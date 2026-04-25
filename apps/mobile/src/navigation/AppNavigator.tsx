import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { HomeScreen } from "../screens/HomeScreen";
import { MoviesScreen } from "../screens/MoviesScreen";
import { MovieDetailsScreen } from "../screens/MovieDetailsScreen";
import { SelectTheatreScreen } from "../screens/SelectTheatreScreen";
import { SelectShowtimeScreen } from "../screens/SelectShowtimeScreen";
import { SeatSelectionScreen } from "../screens/SeatSelectionScreen";
import { BookingSummaryScreen } from "../screens/BookingSummaryScreen";
import { MyBookingsScreen } from "../screens/MyBookingsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { AuthScreen } from "../screens/AuthScreen";

export type RootStackParamList = {
  Tabs: undefined;
  MovieDetails: { movieId: string };
  SelectTheatre: { movieId: string };
  SelectShowtime: { movieId: string; theatreId: string; theatreName: string };
  SeatSelection: { showtimeId: string };
  BookingSummary: { bookingId: string };
  Auth: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Movies: undefined;
  MyBookings: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Movies" component={MoviesScreen} />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: "Bookings" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} options={{ title: "Movie Details" }} />
      <Stack.Screen name="SelectTheatre" component={SelectTheatreScreen} options={{ title: "Select Theatre" }} />
      <Stack.Screen name="SelectShowtime" component={SelectShowtimeScreen} options={{ title: "Select Showtime" }} />
      <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} options={{ title: "Choose Seats" }} />
      <Stack.Screen name="BookingSummary" component={BookingSummaryScreen} options={{ title: "Booking Summary" }} />
      <Stack.Screen name="Auth" component={AuthScreen} options={{ title: "Login / Register" }} />
    </Stack.Navigator>
  );
}
