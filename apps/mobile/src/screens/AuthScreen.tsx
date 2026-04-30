import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ActionButton, BrandMark, ToneBadge } from "../components/ui";
import { authStorage, mobileApiFetch } from "../lib/api";
import { colors, layout, radii, sharedStyles, spacing } from "../lib/theme";

type AuthMode = "login" | "register";

export function AuthScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const compact = width < layout.compactWidth;
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password.trim()) {
      return false;
    }

    if (mode === "register" && !name.trim()) {
      return false;
    }

    return true;
  }, [email, mode, name, password]);

  const submit = async () => {
    if (!canSubmit) {
      Alert.alert(
        mode === "login" ? "Missing details" : "Complete your details",
        mode === "login"
          ? "Enter your email and password to continue."
          : "Enter your name, email, and password to create your account."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await mobileApiFetch<{ token: string }>(
        mode === "login" ? "/auth/login" : "/auth/register",
        {
          method: "POST",
          body:
            mode === "login"
              ? { email: email.trim(), password }
              : { name: name.trim(), email: email.trim(), phone: phone.trim(), password }
        }
      );

      await authStorage.setToken(result.token);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Authentication failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={sharedStyles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={[styles.content, compact && styles.contentCompact]} keyboardShouldPersistTaps="handled">
        <View style={[styles.heroCard, compact && styles.cardCompact]}>
          <View style={[styles.heroTopRow, compact && styles.heroTopRowCompact]}>
            <BrandMark size={62} showWordmark showSlogan />
            <ToneBadge label={mode === "login" ? "Secure sign in" : "Create account"} tone="brand" />
          </View>

          <View style={styles.heroCopy}>
            <Text style={sharedStyles.title}>
              {mode === "login" ? "Welcome back." : "Join Movi."}
            </Text>
            <Text style={sharedStyles.subtitle}>
              {mode === "login"
                ? "Access your bookings, keep plans organized, and book faster next time."
                : "Create your account to reserve seats, track bookings, and pay at the counter with confidence."}
            </Text>
          </View>

          <View style={styles.heroHighlights}>
            <View style={styles.heroPill}>
              <MaterialCommunityIcons name="ticket-confirmation-outline" size={16} color={colors.brand} />
              <Text style={styles.heroPillText}>Fast booking history</Text>
            </View>
            <View style={styles.heroPill}>
              <MaterialCommunityIcons name="shield-check-outline" size={16} color={colors.brand} />
              <Text style={styles.heroPillText}>Secure account access</Text>
            </View>
          </View>
        </View>

        <View style={[styles.formCard, compact && styles.cardCompact]}>
          <View style={styles.modeSwitch}>
            {(["login", "register"] as AuthMode[]).map((value) => {
              const active = mode === value;

              return (
                <Pressable
                  key={value}
                  onPress={() => setMode(value)}
                  style={({ pressed }) => [
                    styles.modeOption,
                    active && styles.modeOptionActive,
                    pressed && styles.modeOptionPressed
                  ]}
                >
                  <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
                    {value === "login" ? "Login" : "Register"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.formBody}>
            {mode === "register" ? (
              <FormField
                label="Full name"
                placeholder="How should we address you?"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            ) : null}

            <FormField
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            {mode === "register" ? (
              <FormField
                label="Phone number"
                placeholder="+975 17 00 00 00"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                optional
              />
            ) : null}

            <FormField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <ActionButton
              label={loading ? "Please wait..." : mode === "login" ? "Continue" : "Create Account"}
              onPress={submit}
              icon={mode === "login" ? "arrow-right" : "account-plus-outline"}
              fullWidth
              loading={loading}
              disabled={!canSubmit}
            />

            <Text style={styles.helperText}>
              {mode === "login"
                ? "Use the same email you booked with to manage your reservations."
                : "By continuing, your bookings will stay linked to this account for easy access later."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FormField({
  label,
  optional = false,
  ...props
}: {
  label: string;
  optional?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeader}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {optional ? <Text style={styles.optionalLabel}>Optional</Text> : null}
      </View>
      <TextInput
        {...props}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    maxWidth: layout.maxFormWidth,
    alignSelf: "center",
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[5]
  },
  contentCompact: {
    paddingHorizontal: spacing[4]
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[5],
    gap: spacing[5],
    shadowColor: "#1b1410",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4
  },
  cardCompact: {
    padding: spacing[4],
    borderRadius: radii.lg
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing[3]
  },
  heroTopRowCompact: {
    flexDirection: "column"
  },
  heroCopy: {
    gap: spacing[2]
  },
  heroHighlights: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2]
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    backgroundColor: colors.brandSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2]
  },
  heroPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.brand
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[5],
    gap: spacing[5]
  },
  modeSwitch: {
    flexDirection: "row",
    backgroundColor: colors.pageMuted,
    borderRadius: radii.pill,
    padding: 4,
    gap: spacing[2]
  },
  modeOption: {
    flex: 1,
    minHeight: 48,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  modeOptionActive: {
    backgroundColor: colors.surface,
    shadowColor: "#1b1410",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2
  },
  modeOptionPressed: {
    transform: [{ scale: 0.99 }]
  },
  modeLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textSoft
  },
  modeLabelActive: {
    color: colors.text
  },
  formBody: {
    gap: spacing[4]
  },
  field: {
    gap: spacing[2]
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text
  },
  optionalLabel: {
    fontSize: 12,
    color: colors.textMuted
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    fontSize: 16,
    color: colors.text
  },
  helperText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted
  }
});
