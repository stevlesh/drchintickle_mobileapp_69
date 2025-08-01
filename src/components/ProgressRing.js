import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, textStyles } from '../theme/typography';

const ProgressRing = ({ currentMax, targetMax = 69 }) => {
  // Ensure we have valid numbers
  const current = Number(currentMax) || 0;
  const target = Number(targetMax) || 69;
  
  // Debug logging
  console.log('ProgressRing props:', { currentMax, targetMax, current, target });
  
  const size = 192; // 12rem = 192px
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(current / target, 1);
  const strokeDasharray = `${progress * circumference} ${circumference}`;
  const strokeDashoffset = circumference * (1 - progress);
  
  console.log('ProgressRing calculated:', { progress, strokeDasharray, strokeDashoffset });

  // Determine what to display in the center of the ring
  const displayValue = current === 0 ? "TBD" : current;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.hotPink} />
            <Stop offset="50%" stopColor={colors.brightPink} />
            <Stop offset="100%" stopColor={colors.purple} />
          </LinearGradient>
        </Defs>
        
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`${colors.white}20`} // 20% opacity
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          // Enhanced glow effect for mobile compatibility
          style={{
            filter: 'drop-shadow(0 0 8px rgba(255, 105, 180, 0.8))',
            shadowColor: '#ff69b4',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 12,
          }}
        />
      </Svg>
      
      {/* Center Content - Properly positioned */}
      <View style={styles.centerContent}>
        <Text style={[
          styles.currentMaxText,
          displayValue === "TBD" && styles.tbdText
        ]}>
          {displayValue}
        </Text>
        <Text style={styles.targetText}>/ {target} REPS</Text>
      </View>
      
      <Text style={styles.progressText}>
        {current === 0 ? "COMPLETE MAX TEST TO START" : `${(progress * 100).toFixed(1)}% TO LEGEND STATUS`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 32,
    position: 'relative',
  },
  svg: {
    // No additional styling needed
  },
  centerContent: {
    position: 'absolute',
    top: 32, // Account for container padding
    left: 0,
    right: 0,
    height: 192, // Same as SVG size
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentMaxText: {
    ...textStyles.heroNumber,
    fontSize: 48,
    lineHeight: 56,
    color: colors.white,
    textShadowColor: colors.hotPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
    textAlign: 'center',
  },
  tbdText: {
    fontSize: 36, // Slightly smaller for "TBD"
    color: colors.electricCyan, // Different color to indicate it's not a number
  },
  targetText: {
    ...textStyles.infoLabel,
    fontSize: 14,
    lineHeight: 16,
    color: colors.mediumGray,
    marginTop: 0,
    textAlign: 'center',
  },
  progressText: {
    ...textStyles.infoLabel,
    marginTop: 16,
    color: colors.lightGray,
    textAlign: 'center',
  },
});

export default ProgressRing;