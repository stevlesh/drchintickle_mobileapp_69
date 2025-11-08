import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { tokens, palette } from '../theme/tokens';

export default function UnderlineFrame({
  children,
  underlineColor = palette.electricCyan, // Electric cyan for structural consistency
  glowColor = null, // Defaults to underlineColor with opacity
  padding = 16,
  thickness = 2,
  underlineWidth = '100%', // Can be percentage or number
  style
}) {
  const computedGlowColor = glowColor || underlineColor;

  return (
    <View style={[
      styles.wrap,
      {
        padding,
        // Subtle glow effect for the underline
        shadowColor: computedGlowColor,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        // Android doesn't support colored shadows well, use elevation
        elevation: Platform.OS === 'android' ? 2 : 0,
      },
      style
    ]}>
      {children}

      {/* Bottom underline */}
      <View style={[
        styles.underline,
        {
          backgroundColor: underlineColor,
          height: thickness,
          width: underlineWidth,
          // Subtle glow effect
          shadowColor: computedGlowColor,
          shadowOpacity: 0.4,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 0 },
        }
      ]} />

      {/* Android extra glow layer for underline */}
      {Platform.OS === 'android' && (
        <View style={[
          styles.androidGlow,
          {
            backgroundColor: computedGlowColor,
            height: thickness,
            width: underlineWidth,
            opacity: 0.2,
            elevation: 4,
          }
        ]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.20)', // Slightly lighter than BracketFrame
    borderRadius: 8, // Softer corners
    overflow: 'visible',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: '-50%' }], // Center the underline
    borderRadius: 1, // Slightly rounded ends
  },
  androidGlow: {
    position: 'absolute',
    bottom: -1,
    left: '50%',
    transform: [{ translateX: '-50%' }],
    borderRadius: 1,
  }
});