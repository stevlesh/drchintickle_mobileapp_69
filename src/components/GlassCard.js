import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/typography';
import { createNeonCard } from '../theme/tokens';

// Helper for adding alpha to hex colors
const withAlpha = (hex, alpha) => `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;

const GlassCard = ({
  children,
  style = {},
  variant = 'glass',
  blurIntensity = 15,
  borderColor = colors.brightPink,
  glowColor = colors.brightPink,
  borderWidth = 2,
  glowIntensity = 1.3,
  shadowIntensity = 0.4
}) => {
  // Subtle flicker animation
  const flickerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const flicker = () => {
      Animated.sequence([
        Animated.timing(flickerOpacity, {
          toValue: 0.75,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(flickerOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(flickerOpacity, {
          toValue: 0.9,
          duration: 30,
          useNativeDriver: true,
        }),
        Animated.timing(flickerOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    // Random flicker every 3-8 seconds
    const randomFlicker = () => {
      const delay = Math.random() * 5000 + 3000; // 3-8 seconds
      setTimeout(() => {
        flicker();
        randomFlicker();
      }, delay);
    };

    randomFlicker();
  }, [flickerOpacity]);
  // Neon variant - dual-layer glow system with under-fill
  if (variant === 'neon') {
    const r1 = 18 * glowIntensity;   // inner glow (crisp)
    const r2 = 34 * glowIntensity;   // outer halo (soft)

    return (
      <View style={[styles.container, style]}>
        {/* Outer halo - soft spread */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: 18,
              shadowColor: glowColor,
              shadowOpacity: 0.85, // Boosted from 0.55 for more intensity
              shadowRadius: r2,
              shadowOffset: { width: 0, height: 0 },
              elevation: 0, // Prevent Android elevation interference
            },
          ]}
        />
        
        {/* Inner glow - crisp ring */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: 18,
              shadowColor: glowColor,
              shadowOpacity: 1.0, // Max intensity for electric effect
              shadowRadius: r1,
              shadowOffset: { width: 0, height: 0 },
              elevation: 0,
            },
          ]}
        />
        
        {/* Android duplicate layers for stronger glow */}
        {Platform.OS === 'android' && (
          <>
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                {
                  borderRadius: 18,
                  shadowColor: glowColor,
                  shadowOpacity: 0.85, // Boosted for electric effect
                  shadowRadius: r2,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 0,
                },
              ]}
            />
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                {
                  borderRadius: 18,
                  shadowColor: glowColor,
                  shadowOpacity: 0.85, // Boosted for electric effect
                  shadowRadius: r1,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 0,
                },
              ]}
            />
          </>
        )}
        
        {/* Subtle purple under-fill - creates atmosphere without blocking transparency */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: 18, overflow: 'hidden' },
          ]}
        >
          <LinearGradient
            colors={[withAlpha(glowColor, 0.15), 'transparent']} 
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
        
        {/* Core card container */}
        <View
          style={{
            borderWidth,
            borderColor,
            borderRadius: 18,
            backgroundColor: 'transparent',
            shadowColor: glowColor,
            shadowOpacity: 0.45,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 0 }, // Critical: even halo around all edges
          }}
        >
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </View>
    );
  }

  // Glass variant (existing behavior)
  // Platform-specific styles for better rendering
  const webStyles = Platform.OS === 'web' ? {
    boxShadow: `0 0 15px ${glowColor}`,
    backgroundColor: 'rgba(0,0,0,0.4)',
  } : {};

  // Enhanced mobile styles
  const mobileStyles = Platform.OS !== 'web' ? {
    shadowColor: glowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: shadowIntensity * 1.5, // Increase shadow opacity on mobile
    shadowRadius: 12,
    elevation: 10, // Increase elevation for Android
  } : {};

  return (
    <View style={[style, styles.container]}>
      {/* Background gradient */}
      <LinearGradient
        colors={[
          `${colors.hotPink}20`, // 20% opacity
          `${colors.veryDark}80`,  // 80% opacity
          `${colors.purple}20`     // 20% opacity
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]}
      />

      {/* Glass blur effect */}
      <BlurView
        intensity={blurIntensity}
        tint="dark"
        style={[
          StyleSheet.absoluteFillObject,
          { borderRadius: 16 },
          webStyles,
          mobileStyles
        ]}
      />

      {/* Broken neon border overlay - flickering bar sign vibe */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 16,
          borderWidth: borderWidth,
          borderColor: borderColor,
          opacity: flickerOpacity,
        }}
      />

      {/* Missing corner sections - like broken neon */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -1,
          left: -1,
          width: 20,
          height: 20,
          backgroundColor: 'transparent',
          borderTopLeftRadius: 16,
          borderWidth: 3,
          borderColor: 'rgba(0,0,0,0.8)', // Dark to "break" the corner
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -1,
          right: -1,
          width: 15,
          height: 25,
          backgroundColor: 'transparent',
          borderTopRightRadius: 16,
          borderWidth: 2,
          borderColor: 'rgba(0,0,0,0.9)',
          borderLeftColor: 'transparent',
          borderBottomColor: 'transparent',
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -1,
          right: -1,
          width: 18,
          height: 18,
          backgroundColor: 'transparent',
          borderBottomRightRadius: 16,
          borderWidth: 2.5,
          borderColor: 'rgba(0,0,0,0.85)',
          borderLeftColor: 'transparent',
          borderTopColor: 'transparent',
        }}
      />

      {/* Flickering section - intermittent border */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 20,
          left: 30,
          width: 40,
          height: 3,
          backgroundColor: 'rgba(0,0,0,0.9)',
          borderRadius: 1,
        }}
      />

      {/* Dim section - like dying neon */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 15,
          right: 25,
          width: 35,
          height: 2,
          backgroundColor: `${borderColor}40`, // Much dimmer
          borderRadius: 1,
        }}
      />

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
  },
  content: {
    padding: 20,
    position: 'relative',
    zIndex: 1,
  },
});

export default GlassCard; 