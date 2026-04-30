import { useCallback, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LaunchSplash } from "./src/components/LaunchSplash";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { colors, navTheme } from "./src/lib/theme";

export default function App() {
  const [showLaunchSplash, setShowLaunchSplash] = useState(true);
  const finishLaunchSplash = useCallback(() => setShowLaunchSplash(false), []);

  return (
    <SafeAreaProvider>
      {showLaunchSplash ? (
        <>
          <StatusBar barStyle="dark-content" backgroundColor={colors.page} />
          <LaunchSplash onFinish={finishLaunchSplash} />
        </>
      ) : (
        <NavigationContainer theme={navTheme}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.page} />
          <AppNavigator />
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}
