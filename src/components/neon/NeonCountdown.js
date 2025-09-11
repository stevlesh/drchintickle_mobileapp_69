import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '../../theme/tokens';

export default function NeonCountdown({
  seconds,
  onDone,
  onSkip,
  reducedMotion = false,
  size = 'md',
}) {
  const [pulse, setPulse] = useState(0.5);
  const firedRef = useRef(false);

  // Handle countdown completion with debounce
  useEffect(() => {
    if (seconds <= 0 && !firedRef.current) {
      firedRef.current = true;
      onDone && onDone();
    }
  }, [seconds, onDone]);

  // Reset fired flag when rest restarts (heuristic: size change or seconds jump up)
  useEffect(() => {
    if (seconds > 0) {
      firedRef.current = false;
    }
  }, [seconds > 0]);

  // Lightweight breathe animation
  useEffect(() => {
    if (reducedMotion) {
      setPulse(0.5); // Static middle value
      return;
    }
    
    let raf;
    const t0 = Date.now();
    
    const loop = () => {
      const t = (Date.now() - t0) / 1000;
      setPulse(0.5 + 0.5 * Math.sin(t * Math.PI)); // ~0.5Hz breathe
      raf = requestAnimationFrame(loop);
    };
    
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  const dims = size === 'sm' ? 84 : size === 'lg' ? 156 : 120;
  const fontSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;

  return (
    <View style={[styles.wrap, { width: dims, height: dims }]}>
      {/* Animated cyan glow */}
      <View
        style={[
          styles.glow,
          {
            opacity: reducedMotion ? 0.25 : 0.35 + 0.35 * pulse,
            shadowRadius: 20 + (reducedMotion ? 0 : 20 * pulse),
          },
        ]}
      />
      
      {/* Inner circle with timer */}
      <View style={styles.circle}>
        <Text
          style={[styles.time, { fontSize }]}
          accessibilityRole="text"
          accessibilityLabel={`Rest, ${Math.max(0, seconds)} seconds remaining`}
        >
          {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
        </Text>
        
        {/* Skip button inside the circle */}
        {onSkip && (
          <Pressable onPress={onSkip} accessibilityRole="button" style={styles.skip}>
            <Text style={styles.skipTxt}>SKIP</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { 
    alignItems: 'center', 
    justifyContent: 'center',
    marginVertical: 16,
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: tokens.brand.secondary + '33', // cyan with 20% opacity
    shadowColor: tokens.brand.secondary,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
  },
  circle: {
    width: '88%',
    height: '88%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: tokens.brand.secondary,
    backgroundColor: tokens.component.neonCard.background[0] + 'A6', // 65% opacity
  },
  time: { 
    fontFamily: 'IBMPlexMono_700Bold',
    fontWeight: '700', 
    color: tokens.text.primary,
  },
  skip: { 
    position: 'absolute', 
    bottom: 10, 
    paddingHorizontal: 12, 
    paddingVertical: 6,
    borderRadius: 4,
  },
  skipTxt: { 
    color: tokens.brand.primary,
    fontFamily: 'IBMPlexMono_700Bold',
    fontWeight: '700', 
    letterSpacing: 1,
    fontSize: 11,
  },
});