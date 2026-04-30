import { DefaultTheme } from "@react-navigation/native";
import { Platform, StyleSheet } from "react-native";

export const colors = {
  page: "#f9f8f5",
  pageMuted: "#f2f0eb",
  surface: "#ffffff",
  surfaceMuted: "#f7f5f0",
  surfaceStrong: "#eeeae1",
  text: "#1f1f1f",
  textSoft: "#6b6b6b",
  textMuted: "#8c887f",
  line: "#e6e2d9",
  brand: "#d2ab50",
  brandPressed: "#e8c979",
  brandSoft: "#f7eed8",
  button: "#2f4f6f",
  buttonPressed: "#e8c979",
  buttonSoft: "#e5ebf1",
  accent: "#e8c979",
  accentSoft: "#f8efd3",
  success: "#3aa76d",
  successSoft: "#e1f3e9",
  warning: "#8b5e18",
  warningSoft: "#f8edd3",
  danger: "#d64545",
  dangerSoft: "#f9e2e2",
  dark: "#1f1f1f",
  available: "#e3efe8",
  availableBorder: "#8bb79e",
  selected: "#e5ebf1",
  selectedBorder: "#2f4f6f",
  reserved: "#f4ecd5",
  reservedBorder: "#d2ab50",
  booked: "#f9e2e2",
  bookedBorder: "#d64545",
  blocked: "#1f1f1f"
};

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999
};

export const fonts = {
  display: Platform.select({ ios: "Georgia", android: "serif", default: undefined }),
  body: Platform.select({ ios: "System", android: "sans-serif", default: undefined }),
  mono: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" })
};

export const shadows = {
  card: {
    shadowColor: "#1f1f1f",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4
  },
  floating: {
    shadowColor: "#1f1f1f",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8
  }
};

export const layout = {
  compactWidth: 380,
  maxContentWidth: 720,
  maxFormWidth: 520
};

export const navTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.button,
    background: colors.page,
    card: colors.surface,
    text: colors.text,
    border: colors.line,
    notification: colors.brand
  }
};

export const sharedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.page
  },
  scrollContent: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[5]
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[5],
    ...shadows.card
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    color: colors.text,
    fontWeight: "700",
    fontFamily: fonts.display
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 28,
    color: colors.text,
    fontWeight: "700",
    fontFamily: fonts.display
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSoft
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "700",
    color: colors.brand
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
    lineHeight: 18,
    color: colors.textMuted
  }
});
