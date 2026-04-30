import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ActionButton, BrandMark, EmptyState, ScreenHeader, ToneBadge } from "../components/ui";
import { authStorage, mobileApiFetch } from "../lib/api";
import { colors, fonts, layout, sharedStyles, spacing } from "../lib/theme";

export function ProfileScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const compact = width < layout.compactWidth;
  const [user, setUser] = useState<any | null>(null);

  const loadUser = useCallback(async () => {
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadUser();
    }, [loadUser])
  );

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={[sharedStyles.scrollContent, styles.content]}>
      <ScreenHeader
        eyebrow="Account"
        title="Profile"
        subtitle="Manage your Movi details, review your access, and keep bookings within easy reach."
      />

      {user ? (
        <>
          <View style={[styles.profileCard, compact && styles.profileCardCompact]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() ?? "D"}</Text>
            </View>

            <View style={styles.profileCopy}>
              <Text style={[styles.name, compact && styles.nameCompact]}>{user.name}</Text>
              <Text style={styles.email} numberOfLines={2}>{user.email}</Text>
              <ToneBadge label={user.role.replaceAll("_", " ")} tone="brand" />
            </View>
          </View>

          <View style={[styles.noteCard, compact && styles.noteCardCompact]}>
            <BrandMark showWordmark showSlogan />
            <Text style={styles.noteText}>
              Keep your booking code handy at the counter and your upcoming reservations will stay one tap away in the bookings tab.
            </Text>
          </View>

          <ActionButton
            label="Logout"
            icon="logout"
            variant="secondary"
            onPress={async () => {
              await authStorage.clearToken();
              setUser(null);
            }}
            fullWidth
          />
        </>
      ) : (
        <EmptyState
          icon="account-circle-outline"
          title="You're not signed in"
          subtitle="Log in to book tickets, view reservation codes, and keep everything synced to your account."
          action={
            <ActionButton
              label="Login or register"
              icon="account-arrow-right-outline"
              onPress={() => navigation.navigate("Auth")}
              fullWidth
            />
          }
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 144
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[6],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4]
  },
  profileCardCompact: {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: spacing[4],
    borderRadius: 22
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSoft
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.brand,
    fontFamily: fonts.display
  },
  profileCopy: {
    flex: 1,
    gap: spacing[2]
  },
  name: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "700",
    color: colors.text,
    fontFamily: fonts.display
  },
  nameCompact: {
    fontSize: 24,
    lineHeight: 28
  },
  email: {
    fontSize: 15,
    color: colors.textSoft,
    flexShrink: 1
  },
  noteCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[5],
    gap: spacing[4]
  },
  noteCardCompact: {
    padding: spacing[4],
    borderRadius: 20
  },
  noteText: {
    color: colors.textSoft,
    lineHeight: 21
  }
});
