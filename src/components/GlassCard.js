import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/typography';

const GlassCard = ({ 
  children, 
  style = {}, 
  blurIntensity = 15,
  borderColor = colors.brightPink,
  glowColor = colors.brightPink,
  shadowIntensity = 0.4 
}) => {
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