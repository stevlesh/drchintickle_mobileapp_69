import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/typography';
import NeonPalmTree from './NeonPalmTree';

const BackgroundContainer = ({ children }) => {
  return (
    <LinearGradient
      colors={[
        colors.hotPink,    // Top - Hot Pink
        colors.purple,     // Middle - Purple  
        colors.darkPurple, // Lower middle - Dark Purple
        colors.deepPurple, // Bottom - Deep Purple
        colors.veryDark    // Very bottom - Very Dark
      ]}
      style={styles.container}
    >
      {/* Retro Grid Overlay */}
      <View style={styles.gridOverlay} />
      
      {/* Scattered Palm Trees - like raindrops */}
      <NeonPalmTree 
        size={120} 
        color={colors.brightPink} 
        style={styles.palmTopLeft}
      />
      <NeonPalmTree 
        size={100} 
        color={colors.purple} 
        style={styles.palmTopRight}
      />
      <NeonPalmTree 
        size={110} 
        color={colors.lightBlue} 
        style={styles.palmBottomLeft}
      />
      <NeonPalmTree 
        size={90} 
        color={colors.neonYellow} 
        style={styles.palmBottomRight}
      />
      
      {/* Additional scattered palm trees */}
      <NeonPalmTree 
        size={70} 
        color={colors.electricCyan} 
        style={styles.palmMidLeft}
      />
      <NeonPalmTree 
        size={85} 
        color={colors.brightPink} 
        style={styles.palmMidRight}
      />
      <NeonPalmTree 
        size={60} 
        color={colors.purple} 
        style={styles.palmTopCenter}
      />
      <NeonPalmTree 
        size={75} 
        color={colors.lightBlue} 
        style={styles.palmBottomCenter}
      />
      <NeonPalmTree 
        size={55} 
        color={colors.neonYellow} 
        style={styles.palmFarLeft}
      />
      <NeonPalmTree 
        size={65} 
        color={colors.electricCyan} 
        style={styles.palmFarRight}
      />
      
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.08,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.electricCyan,
    borderStyle: 'dashed',
  },
  palmTopLeft: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    opacity: 0.7,
    zIndex: -1,
  },
  palmTopRight: {
    position: 'absolute',
    top: '8%',
    right: '8%',
    opacity: 0.6,
    zIndex: -1,
  },
  palmBottomLeft: {
    position: 'absolute',
    bottom: '15%',
    left: '12%',
    opacity: 0.7,
    zIndex: -1,
  },
  palmBottomRight: {
    position: 'absolute',
    bottom: '12%',
    right: '5%',
    opacity: 0.6,
    zIndex: -1,
  },
  
  // Additional scattered palm trees - better distribution
  palmMidLeft: {
    position: 'absolute',
    top: '45%',
    left: '25%',
    opacity: 0.5,
    zIndex: -1,
  },
  palmMidRight: {
    position: 'absolute',
    top: '35%',
    right: '25%',
    opacity: 0.4,
    zIndex: -1,
  },
  palmTopCenter: {
    position: 'absolute',
    top: '20%',
    left: '60%',
    opacity: 0.3,
    zIndex: -1,
  },
  palmBottomCenter: {
    position: 'absolute',
    bottom: '35%',
    left: '45%',
    opacity: 0.5,
    zIndex: -1,
  },
  palmFarLeft: {
    position: 'absolute',
    top: '65%',
    left: '8%',
    opacity: 0.3,
    zIndex: -1,
  },
  palmFarRight: {
    position: 'absolute',
    top: '75%',
    right: '20%',
    opacity: 0.4,
    zIndex: -1,
  },
});

export default BackgroundContainer;