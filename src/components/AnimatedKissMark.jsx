import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import KissMark from "./KissMark";

export default function AnimatedKissMark({
  visible = false,
  onComplete,
  color = "#00ffff",  // Cyan for Miami Vice aesthetic
  size = 140,         // Large for impact
  glow = true,
  glowOpacity = 0.3,
}) {
  // Animation values - useMemo ensures single initialization without render-phase side effects
  const scale = useMemo(() => new Animated.Value(0), []);
  const opacity = useMemo(() => new Animated.Value(0), []);
  const rotation = useMemo(() => new Animated.Value(0), []);

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
      // Pop in with bounce (300ms)
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // Hold (400ms)
      Animated.delay(400),

      // Fade out with slight scale up (280ms)
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 280,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.12,
          duration: 280,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

    sequence.start(({ finished }) => {
      // Only call onComplete if animation wasn't interrupted
      // Use ref to always call the latest callback without causing re-runs
      if (finished) onCompleteRef.current?.();
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
