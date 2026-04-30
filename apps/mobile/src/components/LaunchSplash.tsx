import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts, spacing } from "../lib/theme";

const LOGO = require("../../assets/movi-logo.png");

export function LaunchSplash({ onFinish }: { onFinish: () => void }) {
  const insets = useSafeAreaInsets();
  const entrance = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        })
      ])
    );

    loop.start();

    Animated.parallel([
      Animated.timing(entrance, {
        toValue: 1,
        duration: 760,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: 1450,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false
      })
    ]).start();

    const timer = setTimeout(onFinish, 1800);

    return () => {
      loop.stop();
      clearTimeout(timer);
    };
  }, [entrance, glow, onFinish, progress]);

  const logoScale = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0.86, 1]
  });
  const logoTranslate = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0]
  });
  const glowScale = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.08]
  });
  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["12%", "100%"]
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing[8], paddingBottom: insets.bottom + spacing[6] }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.52] }),
            transform: [{ scale: glowScale }]
          }
        ]}
      />

      <View style={styles.center}>
        <Animated.View
          style={[
            styles.logoCard,
            {
              opacity: entrance,
              transform: [{ translateY: logoTranslate }, { scale: logoScale }]
            }
          ]}
        >
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.View style={[styles.copy, { opacity: entrance }]}>
          <Text style={styles.name}>Movi</Text>
          <Text style={styles.slogan}>Your seat, your show</Text>
        </Animated.View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </View>

      <Animated.View style={[styles.footer, { opacity: entrance }]}>
        <Text style={styles.poweredLabel}>Powered by</Text>
        <Text style={styles.poweredName}>CUDIS SoftLab</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    backgroundColor: colors.page
  },
  glow: {
    position: "absolute",
    top: "12%",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.brandSoft
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: spacing[8]
  },
  logoCard: {
    width: 132,
    height: 132,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 38,
    borderWidth: 1,
    borderColor: "rgba(210, 171, 80, 0.32)",
    backgroundColor: colors.surface
  },
  logo: {
    width: 104,
    height: 104
  },
  copy: {
    alignItems: "center",
    marginTop: spacing[5],
    gap: spacing[1]
  },
  name: {
    color: colors.text,
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "700",
    letterSpacing: -1.4,
    fontFamily: fonts.display
  },
  slogan: {
    color: colors.textSoft,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700"
  },
  progressTrack: {
    width: 136,
    height: 5,
    marginTop: spacing[7],
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: colors.surfaceStrong
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.brand
  },
  footer: {
    alignItems: "center",
    gap: 2
  },
  poweredLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.6,
    textTransform: "uppercase"
  },
  poweredName: {
    color: colors.button,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.2
  }
});
