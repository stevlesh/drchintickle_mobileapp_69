import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { tokens } from '../theme/tokens';

export default function BracketFrame({
  children,
  borderColor = tokens.brand.secondary,
  glowColor = null, // Defaults to borderColor with opacity
  radius = 12,
  bracketSize = 18,
  padding = 16,
  thickness = 2,
  style
}) {
  const computedGlowColor = glowColor || borderColor;

  return (
    <View style={[
      styles.wrap,
      {
        borderRadius: radius,
        padding,
        // Neon lift shadow
        shadowColor: computedGlowColor,
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
        // Android doesn't support colored shadows well, use elevation
        elevation: Platform.OS === 'android' ? 4 : 0,
      },
      style
    ]}>
      {/* Top-left corner */}
      <View style={[styles.corner, { top: 0, left: 0 }]}>
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: bracketSize,
          height: thickness,
          backgroundColor: borderColor,
        }} />
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: thickness,
          height: bracketSize,
          backgroundColor: borderColor,
        }} />
      </View>

      {/* Top-right corner */}
      <View style={[styles.corner, { top: 0, right: 0 }]}>
        <View style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: bracketSize,
          height: thickness,
          backgroundColor: borderColor,
        }} />
        <View style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: thickness,
          height: bracketSize,
          backgroundColor: borderColor,
        }} />
      </View>

      {/* Bottom-left corner */}
      <View style={[styles.corner, { bottom: 0, left: 0 }]}>
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: bracketSize,
          height: thickness,
          backgroundColor: borderColor,
        }} />
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: thickness,
          height: bracketSize,
          backgroundColor: borderColor,
        }} />
      </View>

      {/* Bottom-right corner */}
      <View style={[styles.corner, { bottom: 0, right: 0 }]}>
        <View style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: bracketSize,
          height: thickness,
          backgroundColor: borderColor,
        }} />
        <View style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: thickness,
          height: bracketSize,
          backgroundColor: borderColor,
        }} />
      </View>

      {/* Android extra glow layer */}
      {Platform.OS === 'android' && (
        <View style={[
          styles.androidGlow,
          {
            borderRadius: radius,
            shadowColor: computedGlowColor,
            elevation: 8,
            opacity: 0.3,
          }
        ]} />
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
    overflow: 'visible',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    pointerEvents: 'none',
  },
  androidGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    pointerEvents: 'none',
  }
});