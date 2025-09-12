import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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
    <View style={[styles.container, style]}>
      {/* Background gradient */}
      <LinearGradient
        colors={[
          `${colors.hotPink}20`, // 20% opacity
          `${colors.veryDark}80`,  // 80% opacity
          `${colors.purple}20`     // 20% opacity
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Glass blur effect */}
      <BlurView
        intensity={blurIntensity}
        tint="dark"
        style={[
          StyleSheet.absoluteFillObject,
          styles.blurView,
          {
            borderColor: `${borderColor}80`, // 80% opacity for border
          },
          webStyles,
          mobileStyles
        ]}
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
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  blurView: {
    borderRadius: 16,
    borderWidth: 1,
  },
  content: {
    padding: 20,
    position: 'relative',
    zIndex: 1,
  },
});

export default GlassCard; 