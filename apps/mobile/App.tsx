import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppNavigator } from "./src/navigation/AppNavigator";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#f6efe7",
    primary: "#0f766e",
    card: "#ffffff",
    text: "#1f2937"
  }
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <StatusBar barStyle="dark-content" backgroundColor="#f6efe7" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
