import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '../../theme/tokens';
import { Sunglasses, Martini } from 'phosphor-react-native';

/**
 * NeonBadge - Premium achievement badge with Miami Vice personality
 *
 * Features:
 * - Tilted badge design for playful Miami Vice attitude
 * - Color variants for different achievement types
 * - Optional Miami Vice themed icons
 * - Consistent with your existing design tokens
 */
export default function NeonBadge({
  text,
  variant = 'baseline', // 'baseline' | 'pr' | 'tied'
  showIcon = false,
  iconType = 'sunglasses', // 'sunglasses' | 'martini'
  tilt = -2 // Degrees of playful tilt
}) {
  // Color scheme based on variant
  const getVariantColors = () => {
    switch (variant) {
      case 'pr': // Personal Record
        return {
          border: tokens.brand.primary, // Hot pink
          background: `${tokens.brand.primary}14`, // 8% opacity pink
          text: tokens.brand.primary,
        };
      case 'tied':
        return {
          border: tokens.color.neonPurple, // Electric purple
          background: `${tokens.color.neonPurple}14`, // 8% opacity purple
          text: tokens.color.neonPurple,
        };
      case 'baseline':
      default:
        return {
          border: tokens.brand.secondary, // Electric cyan
          background: `${tokens.brand.secondary}14`, // 8% opacity cyan
          text: tokens.brand.secondary,
        };
    }
  };

  const colors = getVariantColors();

  // Icon selection
  const renderIcon = () => {
    if (!showIcon) return null;

    const IconComponent = iconType === 'martini' ? Martini : Sunglasses;
    const iconSize = 16;

    return (
      <IconComponent
        size={iconSize}
        color={colors.text}
        weight="bold"
      />
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: colors.border,
          backgroundColor: colors.background,
          transform: [{ rotate: `${tilt}deg` }],
          shadowColor: colors.border,
        }
      ]}
    >
      {/* Left icon */}
      {showIcon && iconType === 'sunglasses' && renderIcon()}

      {/* Badge text */}
      <Text style={[styles.text, { color: colors.text }]}>
        {text}
      </Text>

      {/* Right icon */}
      {showIcon && iconType === 'martini' && renderIcon()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.lg,
    borderWidth: 1.5,
    alignSelf: 'center',

    // Subtle glow effect
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,

    // Subtle background for depth
    backdropFilter: 'blur(10px)', // For iOS
  },
  text: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '800',

    // Subtle text glow
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    textShadowColor: 'currentColor', // Uses text color
    textShadowOpacity: 0.3,
  },
});