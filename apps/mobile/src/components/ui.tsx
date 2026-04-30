import type { ReactNode } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, fonts, layout, radii, shadows, spacing } from "../lib/theme";

export function BrandMark({
  size = 52,
  showWordmark = false,
  showSlogan = false
}: {
  size?: number;
  showWordmark?: boolean;
  showSlogan?: boolean;
}) {
  const { width } = useWindowDimensions();
  const compact = width < layout.compactWidth;
  const resolvedSize = compact && showWordmark ? Math.min(size, 48) : size;

  return (
    <View style={[styles.brandRow, compact && styles.brandRowCompact]}>
      <View style={[styles.brandMark, { width: resolvedSize, height: resolvedSize, borderRadius: resolvedSize * 0.34 }]}>
        <Image source={require("../../assets/movi-logo.png")} style={styles.brandImage} resizeMode="contain" />
      </View>

      {showWordmark ? (
        <View style={styles.brandCopy}>
          <Text style={styles.brandTitle}>Movi</Text>
          {showSlogan ? (
            <>
              <Text style={styles.brandSubtitle}>Your seat, your show</Text>
              <Text style={styles.brandPowered}>Powered by CUDIS SoftLab</Text>
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  trailing
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const compact = width < layout.compactWidth;

  return (
    <View style={[styles.headerCard, compact && styles.headerCardCompact]}>
      <View style={[styles.headerRow, compact && styles.headerRowCompact]}>
        <View style={styles.headerCopy}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={[styles.headerTitle, compact && styles.headerTitleCompact]}>{title}</Text>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
        {trailing ? <View>{trailing}</View> : null}
      </View>
      <View style={styles.headerAccentLine} />
    </View>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const compact = width < layout.compactWidth;

  return (
    <View style={[styles.sectionRow, compact && styles.sectionRowCompact]}>
      <View style={styles.sectionCopy}>
        <Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View>{action}</View> : null}
    </View>
  );
}

export function ActionButton({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled = false,
  loading = false,
  fullWidth = false
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}) {
  const { width } = useWindowDimensions();
  const compact = width < layout.compactWidth;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.buttonBase,
        compact && styles.buttonBaseCompact,
        variant === "primary" && styles.buttonPrimary,
        variant === "secondary" && styles.buttonSecondary,
        variant === "ghost" && styles.buttonGhost,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.buttonDisabled,
        pressed && !disabled && !loading && styles.buttonPressed
      ]}
    >
      {loading ? <ActivityIndicator color={variant === "primary" ? "#fffaf5" : colors.button} /> : null}
      {!loading && icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={variant === "primary" ? "#fffaf5" : colors.text}
        />
      ) : null}
      <Text
        style={[
          styles.buttonLabel,
          compact && styles.buttonLabelCompact,
          variant === "primary" ? styles.buttonLabelPrimary : styles.buttonLabelSecondary
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ToneBadge({
  label,
  tone = "neutral"
}: {
  label: string;
  tone?: "brand" | "neutral" | "success" | "warning" | "danger" | "dark";
}) {
  return (
    <View
      style={[
        styles.badge,
        tone === "brand" && styles.badgeBrand,
        tone === "success" && styles.badgeSuccess,
        tone === "warning" && styles.badgeWarning,
        tone === "danger" && styles.badgeDanger,
        tone === "dark" && styles.badgeDark
      ]}
    >
      <Text
        style={[
          styles.badgeLabel,
          tone === "brand" && styles.badgeLabelBrand,
          tone === "success" && styles.badgeLabelSuccess,
          tone === "warning" && styles.badgeLabelWarning,
          tone === "danger" && styles.badgeLabelDanger,
          tone === "dark" && styles.badgeLabelDark
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export function MetricCard({
  value,
  label,
  tone = "neutral"
}: {
  value: string | number;
  label: string;
  tone?: "neutral" | "brand" | "accent";
}) {
  return (
    <View
      style={[
        styles.metricCard,
        tone === "brand" && styles.metricCardBrand,
        tone === "accent" && styles.metricCardAccent
      ]}
    >
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
  action
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconWrap}>
        <MaterialCommunityIcons name={icon} size={28} color={colors.brand} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      {action ? <View style={styles.emptyAction}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    flexShrink: 1
  },
  brandRowCompact: {
    gap: spacing[2]
  },
  brandMark: {
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.card
  },
  brandImage: {
    width: "86%",
    height: "86%"
  },
  brandCopy: {
    gap: 2,
    flexShrink: 1
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    fontFamily: fonts.display
  },
  brandSubtitle: {
    fontSize: 13,
    color: colors.textSoft,
    flexShrink: 1
  },
  brandPowered: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600"
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing[4]
  },
  headerCard: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[5],
    ...shadows.card
  },
  headerCardCompact: {
    borderRadius: radii.lg,
    padding: spacing[4]
  },
  headerAccentLine: {
    position: "absolute",
    left: spacing[5],
    right: spacing[5],
    bottom: 0,
    height: 3,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    backgroundColor: colors.brand
  },
  headerRowCompact: {
    flexDirection: "column",
    gap: spacing[3]
  },
  headerCopy: {
    flex: 1,
    gap: spacing[2]
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "700",
    color: colors.button
  },
  headerTitle: {
    fontSize: 34,
    lineHeight: 38,
    color: colors.text,
    fontWeight: "700",
    fontFamily: fonts.display
  },
  headerTitleCompact: {
    fontSize: 29,
    lineHeight: 33
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSoft
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: spacing[3]
  },
  sectionRowCompact: {
    flexDirection: "column",
    alignItems: "flex-start"
  },
  sectionCopy: {
    flex: 1,
    gap: spacing[1]
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 28,
    color: colors.text,
    fontWeight: "700",
    fontFamily: fonts.display
  },
  sectionTitleCompact: {
    fontSize: 22,
    lineHeight: 26
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSoft
  },
  buttonBase: {
    minHeight: 54,
    paddingHorizontal: spacing[5],
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing[2]
  },
  buttonBaseCompact: {
    minHeight: 50,
    paddingHorizontal: spacing[4]
  },
  fullWidth: {
    width: "100%"
  },
  buttonPrimary: {
    backgroundColor: colors.button,
    ...shadows.card
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line
  },
  buttonGhost: {
    backgroundColor: colors.buttonSoft
  },
  buttonPressed: {
    transform: [{ scale: 0.985 }]
  },
  buttonDisabled: {
    opacity: 0.55
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "700"
  },
  buttonLabelCompact: {
    fontSize: 14
  },
  buttonLabelPrimary: {
    color: "#fffaf5"
  },
  buttonLabelSecondary: {
    color: colors.text
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.line
  },
  badgeBrand: {
    backgroundColor: colors.brandSoft,
    borderColor: colors.brand
  },
  badgeSuccess: {
    backgroundColor: colors.successSoft,
    borderColor: "#a8dcc0"
  },
  badgeWarning: {
    backgroundColor: colors.warningSoft,
    borderColor: "#e5d19d"
  },
  badgeDanger: {
    backgroundColor: colors.dangerSoft,
    borderColor: "#ebb4b4"
  },
  badgeDark: {
    backgroundColor: "rgba(25, 21, 16, 0.78)",
    borderColor: "transparent"
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSoft
  },
  badgeLabelBrand: {
    color: colors.text
  },
  badgeLabelSuccess: {
    color: colors.success
  },
  badgeLabelWarning: {
    color: colors.warning
  },
  badgeLabelDanger: {
    color: colors.danger
  },
  badgeLabelDark: {
    color: "#fff8f2"
  },
  metricCard: {
    flex: 1,
    minWidth: 96,
    padding: spacing[4],
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line
  },
  metricCardBrand: {
    backgroundColor: colors.brandSoft
  },
  metricCardAccent: {
    backgroundColor: colors.accentSoft
  },
  metricValue: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "700",
    color: colors.text,
    fontFamily: fonts.display
  },
  metricLabel: {
    marginTop: spacing[1],
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSoft
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[6],
    alignItems: "center",
    gap: spacing[3],
    ...shadows.card
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSoft
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    fontFamily: fonts.display
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSoft,
    textAlign: "center"
  },
  emptyAction: {
    width: "100%",
    marginTop: spacing[2]
  }
});
