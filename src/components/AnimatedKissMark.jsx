import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import KissMark from "./KissMark";
import { CELEBRATION } from "../utils/celebrationConstants";

export default function AnimatedKissMark({
  visible = false,
  onComplete,
  color = "#00ffff",  // Cyan for Miami Vice aesthetic
  size = 140,         // Large for impact
  glow = true,
  glowOpacity = 0.3,
}) {
  // Animation values - useRef for StrictMode stability (avoids remount issues)
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  // Latest-ref pattern: Keep callback stable, always call the latest version
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Interpolate rotation for subtle tilt effect
  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["-15deg", "5deg"],  // Tilts from -15° to 5° for playful effect
  });

  useEffect(() => {
    // Stop any in-flight animations to prevent overlaps
    const stopAll = () => {
      scale.stopAnimation();
      opacity.stopAnimation();
      rotation.stopAnimation();
    };

    if (!visible) {
      // If hidden, ensure reset and stop animations
      stopAll();
      opacity.setValue(0);
      scale.setValue(0);
      rotation.setValue(0);
      return;
    }

    // Fresh run - stop existing animations and reset values
    stopAll();
    opacity.setValue(0);
    scale.setValue(0);
    rotation.setValue(0);

    const sequence = Animated.sequence([
      // Pop in with bounce (uses CELEBRATION.kissPopInMs)
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: CELEBRATION.kissPopInMs,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 1,
          duration: CELEBRATION.kissPopInMs,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // Hold (uses CELEBRATION.kissHoldMs)
      Animated.delay(CELEBRATION.kissHoldMs),

      // Fade out with slight scale up (uses CELEBRATION.kissFadeOutMs)
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: CELEBRATION.kissFadeOutMs,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.12,
          duration: CELEBRATION.kissFadeOutMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

    sequence.start(({ finished }) => {
      console.log('[KissMark] ✅ Animation complete (finished:', finished, ')');
      // Call onComplete with { finished } object to match contract
      onCompleteRef.current?.({ finished });
    });

    // Cleanup on unmount or when visible changes
    return () => {
      stopAll();
    };
  }, [visible]);  // Only depend on visible - callback is stable via ref

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* Animated glow layer that pulses with the kiss mark */}
      {glow && (
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: color,
              opacity: opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, glowOpacity],
              }),
              transform: [{ scale }],
            },
          ]}
        />
      )}

      {/* Main kiss mark with rotation and scale */}
      <Animated.View
        style={{
          opacity,
          transform: [{ scale }, { rotate }],
        }}
      >
        <KissMark size={size} color={color} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,  // Above everything
  },
  glow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    // iOS shadow for extra glow effect
    shadowOpacity: 0.8,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    // Android fallback
    elevation: 12,
  },
});
