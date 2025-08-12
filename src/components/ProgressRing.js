import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { colors, textStyles } from '../theme/typography';

const ProgressRing = ({ currentMax, targetMax = 69 }) => {
  // Ensure we have valid numbers
  const current = Number(currentMax) || 0;
  const target = Number(targetMax) || 69;
  
  // Debug logging
  console.log('ProgressRing props:', { currentMax, targetMax, current, target });
  
  // Adjusted sizing to prevent clipping
  const size = 240; // Increased to accommodate glow
  const strokeWidth = 14;
  const glowWidth = 10; // Extra width for glow
  const padding = glowWidth + 5; // Extra padding to prevent clipping
  
  // Calculate radius accounting for stroke and glow
  const radius = (size - (strokeWidth + glowWidth + padding) * 2) / 2;
  const center = size / 2;
  
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(current / target, 1);
  const strokeDashoffset = circumference * (1 - progress);
  
  console.log('ProgressRing calculated:', { progress, radius, center, circumference });

  // Determine what to display in the center of the ring
  const displayValue = current === 0 ? "TBD" : current;

  return (
    <View style={styles.container}>
      <View style={[styles.svgContainer, { width: size, height: size }]}>
        <Svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`}
          style={styles.svg}
        >
          <Defs>
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FF0AA6" />
              <Stop offset="100%" stopColor="#FF74FF" />
            </LinearGradient>
          </Defs>
          
          <G>
            {/* Outer Glow Circle - with proper centering */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#FF44C8"
              strokeOpacity={0.35}
              strokeWidth={strokeWidth + glowWidth}
              fill="none"
            />
            
            {/* Background Track Circle */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            
            {/* Progress Circle - with proper rotation */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="url(#progressGradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </G>
        </Svg>
        
        {/* Center Content - Properly positioned */}
        <View style={[styles.centerContent, { width: size, height: size }]}>
          <Text style={[
            styles.currentMaxText,
            displayValue === "TBD" && styles.tbdText
          ]}>
            {displayValue}
          </Text>
          <Text style={styles.targetText}>/ {target} REPS</Text>
        </View>
      </View>
      
      {current === 0 && (
        <Text style={styles.progressText}>
          COMPLETE MAX TEST TO START
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 32,
  },
  svgContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentMaxText: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 44,
    lineHeight: 52,
    color: colors.white,
    textAlign: 'center',
  },
  tbdText: {
    fontSize: 36,
    color: colors.electricCyan,
  },
  targetText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 14,
    lineHeight: 16,
    color: '#B7BACC',
    marginTop: 4,
    textAlign: 'center',
  },
  progressText: {
    fontFamily: 'IBMPlexMono_400Regular',
    marginTop: 16,
    color: colors.lightGray,
    textAlign: 'center',
  },
});

export default ProgressRing;