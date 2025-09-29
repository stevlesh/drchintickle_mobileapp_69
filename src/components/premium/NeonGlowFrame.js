import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '../../theme/tokens';

/**
 * NeonGlowFrame - Premium animated glow wrapper for special UI moments
 *
 * Wraps content with animated Miami Vice neon glow border
 * - Pulses between cyan and pink gradient
 * - Maintains your existing component content unchanged
 * - Uses your established token system
 */
export default function NeonGlowFrame({
  children,
  borderRadius = tokens.radius.lg,
  padding = tokens.spacing.sm,
  intensity = 0.6, // Controls glow opacity range
  style // Accept style prop
}) {
  const pulseAnim = useRef(new Animated.Value(intensity)).current;

  useEffect(() => {
    const createPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: intensity,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    createPulse();
  }, [intensity]);

  const glowBorderRadius = borderRadius + 4; // Subtle extension
  const innerBorderRadius = borderRadius;

  return (
    <View style={[styles.container, { borderRadius: glowBorderRadius }, style]}>
      {/* Animated glow border */}
      <Animated.View
        style={[
          styles.glowBorder,
          {
            borderRadius: glowBorderRadius,
            opacity: pulseAnim
          }
        ]}
      >
        <LinearGradient
          colors={[tokens.brand.secondary, tokens.brand.primary]} // cyan to pink
          start={{ x: 0, y: 0.1 }}
          end={{ x: 1, y: 0.9 }}
          style={[styles.gradientBorder, { borderRadius: glowBorderRadius }]}
        />
      </Animated.View>

      {/* Inner container with subtle background */}
      <View style={[
        styles.innerContainer,
        {
          borderRadius: innerBorderRadius,
          padding
        }
      ]}>
        {/* Content wrapper with original styling preserved */}
        <View style={[styles.contentWrapper, { borderRadius }]}>
          {children}
        </View>

        {/* Inner ring for depth - matches your existing card patterns */}
        <View style={[
          styles.innerRing,
          {
            borderRadius,
            borderColor: `${tokens.brand.secondary}73` // 45% opacity cyan
          }
        ]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'stretch', // Respect parent constraints
  },
  glowBorder: {
    position: 'absolute',
    top: -8,
    bottom: -8,
    left: -8,
    right: -8,
  },
  gradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  innerContainer: {
    position: 'relative',
    backgroundColor: 'transparent', // Let existing card backgrounds show through
  },
  contentWrapper: {
    overflow: 'hidden',
    flex: 1, // Allow content to determine size
  },
  innerRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    pointerEvents: 'none',
  },
});