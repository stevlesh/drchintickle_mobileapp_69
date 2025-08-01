import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, textStyles } from '../theme/typography';

const NeonButton = ({ 
  title, 
  onPress, 
  disabled = false, 
  style = {},
  textStyle = {},
  variant = 'primary' // primary, secondary, success, warning
}) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return [colors.hotPink, colors.brightPink, colors.purple];
      case 'secondary':
        return [colors.electricCyan, colors.lightBlue, colors.purple];
      case 'success':
        return [colors.lightBlue, colors.electricCyan, colors.purple];
      case 'warning':
        return [colors.neonYellow, colors.gold, colors.orange];
      default:
        return [colors.hotPink, colors.brightPink, colors.purple];
    }
  };

  const getShadowColor = () => {
    switch (variant) {
      case 'primary':
        return colors.hotPink;
      case 'secondary':
        return colors.electricCyan;
      case 'success':
        return colors.lightBlue;
      case 'warning':
        return colors.neonYellow;
      default:
        return colors.hotPink;
    }
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, style]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            shadowColor: getShadowColor(),
            shadowOpacity: disabled ? 0.2 : 0.8,
            shadowRadius: disabled ? 8 : 25,
            shadowOffset: { width: 0, height: 0 },
            // Enhanced glow for web
            filter: disabled ? 'none' : `drop-shadow(0 0 10px ${getShadowColor()}) drop-shadow(0 0 20px ${getShadowColor()}) drop-shadow(0 0 30px ${getShadowColor()}40)`,
          }
        ]}
      >
        <View style={[styles.content, disabled && styles.disabledContent]}>
          <Text style={[textStyles.buttonText, textStyle, disabled && styles.disabledText]}>
            {title}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 8, // Android shadow
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  disabledContent: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default NeonButton; 