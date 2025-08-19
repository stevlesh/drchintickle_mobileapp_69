import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Stop, G } from 'react-native-svg';
import { colors, textStyles } from '../theme/typography';
import { tokens } from '../theme/tokens';

const ProgressRing = ({ currentMax, targetMax = 69 }) => {
  // Cyan token fallback for backlight effect
  const CYAN = (tokens?.color?.cyanA) 
            || (colors?.electricCyan) 
            || '#00D5FF'; // final fallback

  // Ensure we have valid numbers
  const current = Number(currentMax) || 0;
  const target = Number(targetMax) || 69;
  
  // Debug logging temporarily enabled
  // console.log('ProgressRing props:', { currentMax, targetMax, current, target });
  
  // Simplified sizing to match neon spec - pad = thickness * 2 for halo clearance
  const innerSize = 170; // Inner diameter of the arc (not including halo padding)
  const thickness = 16;  // Arc stroke width - increased for more pop
  const pad = thickness * 2; // Halo clearance
  const size = innerSize + pad * 2; // Padded viewBox (204px)
  
  // Calculate radius and center
  const radius = (innerSize - thickness) / 2; // Arc radius: (170-16)/2 = 77
  const center = size / 2; // Center: 204/2 = 102
  
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(current / target, 1);
  const strokeDashoffset = circumference * (1 - progress);
  
  // Calculate start/end coordinates for cap glows
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + progress * 2 * Math.PI;
  const startX = center + radius * Math.cos(startAngle);
  const startY = center + radius * Math.sin(startAngle);
  const endX = center + radius * Math.cos(endAngle);
  const endY = center + radius * Math.sin(endAngle);
  
  // Calculations completed - logging removed to prevent spam

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
              <Stop offset="0%" stopColor={tokens.color.pinkA} />
              <Stop offset="100%" stopColor={tokens.color.pinkB} />
            </LinearGradient>
            
            <RadialGradient id="capGlowStart" cx={startX} cy={startY} r={thickness * 1.25} gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor={tokens.color.pinkB} stopOpacity="0.35" />
              <Stop offset="60%" stopColor={tokens.color.pinkGlow} stopOpacity="0.18" />
              <Stop offset="100%" stopColor={tokens.color.pinkGlow} stopOpacity="0" />
            </RadialGradient>

            <RadialGradient id="capGlowEnd" cx={endX} cy={endY} r={thickness * 1.25} gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor={tokens.color.pinkA} stopOpacity="0.40" />
              <Stop offset="60%" stopColor={tokens.color.pinkGlow} stopOpacity="0.20" />
              <Stop offset="100%" stopColor={tokens.color.pinkGlow} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          
          <G>
            {/* Enhanced halos for more pop (do not clip due to padded viewBox) */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={tokens.color.pinkA}
              strokeWidth={thickness * 1.6}
              opacity={0.15}
              fill="none"
            />
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={tokens.color.pinkGlow}
              strokeWidth={thickness * 2.2}
              opacity={0.10}
              fill="none"
            />
            {/* New bright inner halo - very close to arc for intense glow */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={tokens.color.pinkB}
              strokeWidth={thickness * 1.2}
              opacity={0.20}
              fill="none"
            />
            
            {/* Background Track Circle - darker for maximum contrast */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#FFFFFF04"
              strokeWidth={thickness}
              fill="none"
            />
            
            {/* Cyan backlight - progress arc only, subtle, behind halos */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={CYAN}
              strokeWidth={thickness * 2.4}
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              opacity={0.035}
              fill="none"
              transform={`rotate(-90 ${center} ${center})`}
            />
            
            {/* Progress Circle - with inner shadow effect */}
            {/* Inner shadow - slightly smaller radius for depth */}
            <Circle
              cx={center}
              cy={center}
              r={radius - 1}
              stroke="rgba(0, 0, 0, 0.3)"
              strokeWidth={thickness - 2}
              fill="none"
              strokeDasharray={`${circumference * (radius - 1) / radius}`}
              strokeDashoffset={circumference * (radius - 1) / radius * (1 - progress)}
              strokeLinecap="butt"
              transform={`rotate(-90 ${center} ${center})`}
            />
            {/* Main progress arc */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="url(#progressGradient)"
              strokeWidth={thickness}
              fill="none"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${center} ${center})`}
            />
            
            {/* Cap glows - soft feather at start/end; only render when progress > 0 */}
            {progress > 0 && (
              <>
                <Circle cx={startX} cy={startY} r={thickness * 1.25} fill="url(#capGlowStart)" />
                <Circle cx={endX} cy={endY} r={thickness * 1.25} fill="url(#capGlowEnd)" />
              </>
            )}
            
            {/* White filament - thin inner highlight inside the tube */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#FFFFFF"
              strokeWidth={thickness * 0.26}
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              opacity={0.55}
              fill="none"
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