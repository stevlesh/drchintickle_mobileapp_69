import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { tokens } from '../../theme/tokens';
import { neonPinkStops, halos, cyanBacklight } from './neonRings';

export default function NeonCountdown({
  seconds,
  onDone,
  onSkip,
  reducedMotion = false,
  size = 'md',
  totalSeconds = 120,
}) {
  const firedRef = useRef(false);

  // Handle countdown completion with debounce
  useEffect(() => {
    if (seconds <= 0 && !firedRef.current) {
      firedRef.current = true;
      onDone && onDone();
    }
  }, [seconds, onDone]);

  // Reset fired flag when rest restarts
  useEffect(() => {
    if (seconds > 0) {
      firedRef.current = false;
    }
  }, [seconds > 0]);

  const dims = size === 'sm' ? 84 : size === 'lg' ? 156 : 120;
  const fontSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;
  const strokeWidth = 12;
  const radius = Math.floor(((dims * 0.88) - strokeWidth) / 2) + 0.5;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(seconds, totalSeconds));
  const progress = clamped / totalSeconds;

  // SVG breathing animation
  const breathe = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reducedMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { 
          toValue: 0.6, 
          duration: 900, 
          easing: Easing.out(Easing.quad), 
          useNativeDriver: true 
        }),
        Animated.timing(breathe, { 
          toValue: 1.0, 
          duration: 900, 
          easing: Easing.in(Easing.quad), 
          useNativeDriver: true 
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reducedMotion]);

  return (
    <View style={[styles.wrap, { width: dims, height: dims }]}>
      {/* Pure SVG rings - no View backgrounds */}
      <Svg 
        width={dims} 
        height={dims} 
        style={StyleSheet.absoluteFill} 
        accessibilityRole="image"
        accessibilityLabel={`Rest progress ${Math.round((1 - progress) * 100)} percent`}
      >
        <Defs>
          <LinearGradient id="dcPink" x1="0" y1="0" x2="1" y2="1">
            {neonPinkStops.map(s => (
              <Stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </LinearGradient>
        </Defs>

        {/* Subtle track - shows full duration */}
        <Circle 
          cx={dims/2} 
          cy={dims/2} 
          r={radius}
          stroke="#FFFFFF"
          strokeOpacity={0.15}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Outer pink glow */}
        <Circle 
          cx={dims/2} 
          cy={dims/2} 
          r={radius}
          stroke={tokens.brand.primary} 
          strokeOpacity={0.3}
          strokeWidth={strokeWidth + 6}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round" 
          fill="none"
          transform={`rotate(-90 ${dims/2} ${dims/2})`} 
        />

        {/* Main pink border */}
        <Circle 
          cx={dims/2} 
          cy={dims/2} 
          r={radius}
          stroke={tokens.brand.primary} 
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round" 
          fill="none"
          transform={`rotate(-90 ${dims/2} ${dims/2})`} 
        />

        {/* Thin white progress line - on top */}
        <Circle 
          cx={dims/2} 
          cy={dims/2} 
          r={radius}
          stroke="#FFFFFF" 
          strokeWidth={2}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round" 
          fill="none"
          transform={`rotate(-90 ${dims/2} ${dims/2})`} 
        />
      </Svg>

      {/* Transparent center numerals with breathing animation */}
      <Animated.View 
        style={[
          styles.center, 
          { opacity: reducedMotion ? 1 : breathe }
        ]} 
        pointerEvents="none"
      >
        <Text
          style={[styles.time, { fontSize }]}
          accessibilityRole="text"
          accessibilityLabel={`Rest, ${Math.max(0, seconds)} seconds remaining`}
        >
          {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
        </Text>
        
        {onSkip && (
          <Text style={styles.skip}>SKIP</Text>
        )}
      </Animated.View>

      {/* Tap target for skip */}
      {onSkip && (
        <Pressable 
          onPress={onSkip} 
          style={StyleSheet.absoluteFill} 
          accessibilityRole="button" 
          accessibilityLabel="Skip rest" 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { 
    alignItems: 'center', 
    justifyContent: 'center',
    marginVertical: 16,
  },
  center: { 
    position: 'absolute', 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  time: { 
    fontFamily: 'IBMPlexMono_700Bold',
    fontWeight: '700', 
    letterSpacing: 1, 
    color: '#FFFFFF', 
    textShadowColor: '#FFFFFF', 
    textShadowRadius: 8,
  },
  skip: { 
    marginTop: 2, 
    letterSpacing: 2, 
    opacity: 0.9, 
    color: tokens.brand.primary,
    fontFamily: 'IBMPlexMono_700Bold',
    fontWeight: '700', 
    fontSize: 11,
  },
});