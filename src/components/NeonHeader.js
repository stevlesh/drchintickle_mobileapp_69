import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, textStyles } from '../theme/typography';
import NeonPalmTree from './NeonPalmTree';

const NeonHeader = ({ 
  subtitle, 
  showPalmTrees = true, 
  style = {},
  titleSize = 42,
  subtitleSize = 14,
}) => {
  // Platform-specific text styles
  const titleStyles = [
    styles.title,
    { fontSize: titleSize },
    Platform.OS === 'web' ? styles.titleWeb : styles.titleMobile
  ];
  
  const subtitleStyles = [
    styles.subtitle,
    { fontSize: subtitleSize },
    Platform.OS === 'web' ? styles.subtitleWeb : styles.subtitleMobile
  ];

  return (
    <View style={[styles.container, style]}>
      {/* Palm trees flanking the title */}
      {showPalmTrees && (
        <>
          <NeonPalmTree 
            size={40} 
            color={colors.lightBlue} 
            style={styles.palmLeft}
          />
          <NeonPalmTree 
            size={40} 
            color={colors.brightPink} 
            style={styles.palmRight}
          />
        </>
      )}
      
      {/* Main Title - using only text shadows */}
      <Text style={titleStyles}>
        Dr. ChinTickle
      </Text>
      
      {/* Subtitle */}
      {subtitle && (
        <Text style={subtitleStyles}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  palmLeft: {
    position: 'absolute',
    left: -10,
    top: 15,
    opacity: 0.7,
    zIndex: -1,
  },
  palmRight: {
    position: 'absolute',
    right: -10,
    top: 15,
    opacity: 0.7,
    zIndex: -1,
  },
  title: {
    fontFamily: 'Pacifico_400Regular',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
    // Basic styling
    letterSpacing: 2,
    fontStyle: 'italic',
    transform: [{ rotate: '-2deg' }],
  },
  // Mobile-specific title styles with enhanced glow
  titleMobile: {
    // Stronger text shadow for better glow
    textShadowColor: colors.electricCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    // Add shadow properties for additional glow
    shadowColor: colors.electricCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // Web-specific title styles - ORIGINAL
  titleWeb: {
    filter: `drop-shadow(0 0 10px ${colors.electricCyan}) drop-shadow(0 0 20px ${colors.electricCyan})`,
  },
  subtitle: {
    fontFamily: 'Orbitron_400Regular',
    color: colors.lightBlue,
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 4,
    opacity: 0.9,
  },
  // Mobile-specific subtitle styles
  subtitleMobile: {
    textShadowColor: colors.lightBlue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  // Web-specific subtitle styles - ORIGINAL
  subtitleWeb: {
    filter: `drop-shadow(0 0 5px ${colors.lightBlue})`,
  },
});

export default NeonHeader; 