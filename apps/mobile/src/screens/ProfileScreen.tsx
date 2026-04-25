import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { authStorage, mobileApiFetch } from "../lib/api";
import { sharedStyles } from "../lib/theme";

export function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<any | null>(null);

  const loadUser = async () => {
    const token = await authStorage.getToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const data = await mobileApiFetch("/auth/me", { token });
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    void loadUser();
  }, []);

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <Text style={sharedStyles.title}>Profile</Text>
      <View style={sharedStyles.card}>
        {user ? (
          <>
            <Text style={{ fontSize: 20, fontWeight: "700" }}>{user.name}</Text>
            <Text style={sharedStyles.subtitle}>{user.email}</Text>
            <Text style={{ marginTop: 8 }}>Role: {user.role}</Text>
            <Pressable
              style={[sharedStyles.buttonSecondary, { marginTop: 16 }]}
              onPress={async () => {
                await authStorage.clearToken();
                setUser(null);
              }}
            >
              <Text style={sharedStyles.buttonSecondaryText}>Logout</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={{ marginBottom: 12 }}>Login to reserve seats and manage your bookings.</Text>
            <Pressable style={sharedStyles.button} onPress={() => navigation.navigate("Auth")}>
              <Text style={sharedStyles.buttonText}>Login / Register</Text>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}
