import React, { useEffect, useRef } from "react";
import { Pressable, View, Text, StyleSheet, Animated, Platform, Easing } from "react-native";
import { BeachBall } from 'phosphor-react-native';
import * as Haptics from "expo-haptics";

// Pass tokens from the caller; these are safe defaults.
const DEFAULTS = {
  primary: "#ff1493",   // pink glass fill (tokens.brand.primary)
  secondary: "#00ffff", // cyan tube/glow (tokens.brand.secondary)
  text: "#ffffff",
  fontFamily: "IBMPlexMono_700Bold", // Clean, readable button font
  height: 56,
};

export default function NeonBarButton({
  title,
  onPress,
  disabled,
  colors = {},
  fontFamily = DEFAULTS.fontFamily,
  height = DEFAULTS.height,
}) {
  const palette = { ...DEFAULTS, ...colors };

  // Native-driver anims (opacity/scale)
  const breathe = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main breathing animation (for outer glow)
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 2400,            // slower
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [breathe]);

  const onPressIn  = () => Animated.spring(pressScale, { toValue: 0.985, useNativeDriver: true, friction: 6 }).start();
  const onPressOut = () => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    flash.setValue(0);
    Animated.sequence([
      Animated.timing(flash, { toValue: 1, duration: 70,  useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0, duration: 140, useNativeDriver: true }),
    ]).start();
    onPress && onPress();
  };

  // Animate only the outer glow layer with subtle opacity ranges
  const outerOpacity = breathe.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [0.10, 0.18] // Much subtler - was 0.20→0.45
  });
  const outerScale = breathe.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [1.0, 1.004] // Minimal scale or could remove entirely
  });

  return (
    <Animated.View
      style={[
        styles.wrap,
        { height, transform: [{ scale: pressScale }] },
      ]}
      pointerEvents={disabled ? "none" : "auto"}
    >
      {/* 1) Pink underlay - ensures any gap shows pink, not background */}
      <View style={[styles.underlay, { backgroundColor: palette.primary }]} />

      {/* 2) Outer glow (BEHIND the tube for proper halo effect) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.outerGlow,
          {
            backgroundColor: palette.secondary,
            opacity: outerOpacity,
            transform: [{ scale: outerScale }],
          },
        ]}
      />

      {/* 3) Cyan neon ring (OPAQUE - never fades) */}
      <View
        pointerEvents="none"
        style={[
          styles.neonRing,
          { borderColor: palette.secondary },
          Platform.OS === "android"
            ? { elevation: 12 }
            : {
                shadowColor: palette.secondary,
                shadowOpacity: 0.85,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 0 },
              },
        ]}
      />

      {/* 4) Pink glass fill */}
      <View style={[styles.fill, { backgroundColor: palette.primary }]} />

      {/* 5) Flash overlay on press */}
      <Animated.View
        pointerEvents="none"
        style={[styles.flash, { backgroundColor: palette.secondary, opacity: flash }]}
      />

      {/* 7) Pressable label (topmost) */}
      <Pressable
        style={styles.pressArea}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={title}
        disabled={disabled}
      >
        {/* Text and icon container */}
        <View style={styles.contentRow}>
          {/* Text container with overlapping glow */}
          <View style={styles.textContainer}>
            {/* Cyan text underlay (positioned behind) */}
            <Text 
              style={[
                styles.textGlowUnder, 
                { 
                  color: palette.secondary,
                  fontFamily: fontFamily
                }
              ]} 
              numberOfLines={1}
            >
              {title}
            </Text>

            {/* White text (foreground) */}
            <Text 
              style={[
                styles.text, 
                { 
                  color: palette.text, 
                  fontFamily: fontFamily,
                  textShadowColor: palette.secondary,
                  textShadowRadius: 8,
                  textShadowOffset: { width: 0, height: 0 },
                }
              ]} 
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>

          {/* Beach ball icon after text */}
          <BeachBall 
            size={28} 
            color={palette.secondary} 
            style={styles.icon}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const R = 16;

const styles = StyleSheet.create({
  // IMPORTANT: do not clip glow here or in the parent wrapper.
  wrap: {
    position: "relative",
    width: "100%",
    borderRadius: R,
    overflow: "visible",
    // No margins - parent handles spacing
  },
  underlay: {
    position: "absolute",
    top: 0, right: 0, bottom: 0, left: 0,
    borderRadius: R,
  },
  outerGlow: {
    position: "absolute",
    top: -6, right: -6, bottom: -6, left: -6,
    borderRadius: R + 6,
    // iOS shadow for extra glow
    ...(Platform.OS === "ios" ? {
      shadowColor: "#00ffff",
      shadowOpacity: 0.6,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 0 },
    } : {}),
  },
  neonRing: {
    position: "absolute",
    top: 0, right: 0, bottom: 0, left: 0,
    borderRadius: R,
    borderWidth: 2,
  },
  fill: {
    position: "absolute",
    top: 2, right: 2, bottom: 2, left: 2,
    borderRadius: R - 2,
  },
  flash: {
    position: "absolute",
    top: 0, right: 0, bottom: 0, left: 0,
    borderRadius: R,
    opacity: 0,
  },
  pressArea: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    position: "relative",
  },
  text: {
    fontSize: 16,
    letterSpacing: 1,
    textAlign: "center",
    zIndex: 2,
  },
  textGlowUnder: {
    position: "absolute",
    fontSize: 16,
    letterSpacing: 1,
    textAlign: "center",
    zIndex: 1,
    // Strong glow effect
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 0 },
  },
  icon: {
    marginLeft: 8,
    zIndex: 3, // Above text
  },
});