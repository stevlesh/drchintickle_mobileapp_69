import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { tokens } from '../../theme/tokens';

/**
 * NeonNumber - Premium animated number display for achievement moments
 *
 * Features:
 * - Large gradient-filled number with Miami Vice colors
 * - Entrance animation with spring physics
 * - Glow shadow effects
 * - Configurable label text
 * - Falls back gracefully if MaskedView unavailable
 */
export default function NeonNumber({
  value,
  label = "NEW MAX",
  fontSize = 120,
  showAnimation = true,
  glowIntensity = 0.4
}) {
  const scaleAnim = useRef(new Animated.Value(showAnimation ? 0.8 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(showAnimation ? 0 : 1)).current;

  useEffect(() => {
    if (!showAnimation) return;

    // Entrance animation with spring physics
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value, showAnimation]);

  const displayValue = String(value).padStart(2, '0');

  // Fallback component for when MaskedView is unavailable
  const FallbackNumber = () => (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      {/* Glow shadow behind text */}
      <Text style={[
        styles.numberText,
        styles.glowShadow,
        {
          fontSize,
          textShadowRadius: fontSize * 0.15,
          opacity: glowIntensity
        }
      ]}>
        {displayValue}
      </Text>

      {/* Main number text */}
      <Text style={[
        styles.numberText,
        styles.mainNumber,
        { fontSize }
      ]}>
        {displayValue}
      </Text>

      {/* Label */}
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );

  // Try to use MaskedView for gradient text, fall back to solid color
  try {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Glow shadow behind gradient text */}
        <Text style={[
          styles.numberText,
          styles.glowShadow,
          {
            fontSize,
            textShadowRadius: fontSize * 0.15,
            opacity: glowIntensity
          }
        ]}>
          {displayValue}
        </Text>

        {/* Gradient-filled text using MaskedView */}
        <MaskedView
          maskElement={
            <Text style={[
              styles.numberText,
              { fontSize, color: 'black' } // Mask color
            ]}>
              {displayValue}
            </Text>
          }
        >
          <LinearGradient
            colors={[tokens.brand.secondary, tokens.brand.primary]} // cyan to pink
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.Text
              style={[
                styles.numberText,
                styles.gradientText,
                {
                  fontSize,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              {displayValue}
            </Animated.Text>
          </LinearGradient>
        </MaskedView>

        {/* Label */}
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
    );
  } catch (error) {
    console.warn('MaskedView not available, using fallback NeonNumber', error);
    return <FallbackNumber />;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontFamily: 'IBMPlexMono_700Bold', // Matches your existing number styling
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  glowShadow: {
    position: 'absolute',
    color: tokens.brand.primary, // Pink glow
    textShadowColor: tokens.brand.secondary, // Cyan shadow
    textShadowOffset: { width: 0, height: 0 },
  },
  mainNumber: {
    color: tokens.text.primary, // White text for fallback
    textShadowColor: tokens.brand.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  gradientText: {
    // Transparent color lets gradient show through
    color: 'transparent',
  },
  label: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 14,
    letterSpacing: 2,
    color: tokens.text.secondary,
    textTransform: 'uppercase',
    marginTop: tokens.spacing.sm,
    textShadowColor: tokens.brand.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});