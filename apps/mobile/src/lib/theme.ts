import { StyleSheet } from "react-native";

export const colors = {
  background: "#f6efe7",
  surface: "#ffffff",
  card: "#fff9f2",
  text: "#1f2937",
  muted: "#6b7280",
  primary: "#0f766e",
  secondary: "#c2410c",
  border: "#e5e7eb",
  available: "#bbf7d0",
  selected: "#facc15",
  reserved: "#93c5fd",
  booked: "#fca5a5",
  blocked: "#374151"
};

export const sharedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 16,
    gap: 16
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 6
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600"
  },
  buttonSecondaryText: {
    color: colors.text,
    textAlign: "center",
    fontWeight: "600"
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12
  }
});
