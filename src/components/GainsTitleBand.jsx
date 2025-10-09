// src/components/GainsTitleBand.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, AccessibilityInfo, StyleSheet as RNStyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { G, Circle, Line } from 'react-native-svg';

const AnimatedLinear = Animated.createAnimatedComponent(LinearGradient);

const COLORS = {
  cyan:   '#00E5FF',
  pink:   '#FF2D92',
  mango:  '#FFC857',
  purple: '#6F0C8E',
  deep:   '#2D0066',
};

export default function GainsTitleBand({
  useBgGradient = false,   // keep false on Stats screen
  useGradient   = true,    // gradient GAINS by default
  fontSize      = 36,
  letterSpacing = 6,
  sunSize       = 160,
  topGap        = 0,
}) {
  const shimmer = useRef(new Animated.Value(0)).current;
  const started = useRef(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [textW, setTextW] = useState(0);
  const DEBUG_SHIMMER = false; // set true to verify, then back to false

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    // Optional live updates:
    // const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    // return () => sub.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion || started.current) return;
    started.current = true;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => {
      loop.stop();
      started.current = false;
    };
  }, [reduceMotion, shimmer]);

  const shimmerH = Math.round(fontSize * 1.15);
  const shimmerW = Math.round((DEBUG_SHIMMER ? 1.8 : 1.2) * fontSize);
  const shimmerTop = Math.round((fontSize - shimmerH) / 2);

  const travel = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-shimmerW, Math.max(220, textW) + shimmerW], // full sweep
  });

  const MaskText = (
    <Text style={[styles.gainsMask, { fontSize, letterSpacing }]}>GAINS</Text>
  );

  return (
    <View style={[styles.wrap, { marginTop: topGap }]}>
      {useBgGradient && (
        <LinearGradient
          pointerEvents="none"
          colors={[COLORS.deep, COLORS.purple, COLORS.pink]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={RNStyleSheet.absoluteFill}
        />
      )}

      {/* Poster band: GAINS */}
      <View style={styles.band}>
        <View style={styles.gainsRow}>
          <View style={{
            shadowColor: '#00FFFF',
            shadowOpacity: 1.0,
            shadowRadius: 40,
            shadowOffset: { width: 0, height: 0 },
          }}>
            <MaskedView maskElement={MaskText} style={{ alignSelf: 'center' }}>
              {/* base gradient text */}
              <LinearGradient colors={['#FF77FF', '#FF4DA6', '#FFA94D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text
                  style={[styles.gainsBase, {
                    fontSize,
                    letterSpacing,
                    opacity: 0,
                    textShadowColor: '#FFFFFF',
                    textShadowRadius: 12,
                    textShadowOffset: { width: 0, height: 0 },
                  }]}
                  onLayout={e => {
                    const w = Math.round(e.nativeEvent.layout.width);
                    if (w && w !== textW) setTextW(w);
                  }}
                >
                  GAINS
                </Text>
              </LinearGradient>

            {/* shimmering highlight — SAME MaskedView, sits on top */}
            {!reduceMotion && (
              <Animated.View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: shimmerTop,
                  height: shimmerH,
                  width: shimmerW,
                  transform: [{ translateX: travel }, { rotate: '12deg' }],
                  zIndex: 2,
                }}
              >
                <LinearGradient
                  colors={[
                    'rgba(255,255,255,0)',
                    DEBUG_SHIMMER ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.36)',
                    'rgba(255,255,255,0)',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            )}
            </MaskedView>
          </View>
        </View>
      </View>

      <View style={styles.bracket} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingBottom: 10, position: 'relative' },
  band: { alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible', marginBottom: 2 },
  sun: { position: 'absolute', alignSelf: 'center', top: -6, zIndex: 0, opacity: 0.45 },
  gainsRow: { alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, overflow: 'visible' },
  gainsBase: {
    fontFamily: 'IBMPlexMono_700Bold',
    textAlign: 'center',
    includeFontPadding: false,
  },
  gainsMask: {
    fontFamily: 'IBMPlexMono_700Bold',
    textAlign: 'center',
    includeFontPadding: false,
    color: '#000',
  },
  bracket: {
    alignSelf: 'center',
    width: '78%',
    height: 2,
    marginTop: 8,
    borderRadius: 2,
    backgroundColor: '#00FFFF',
    opacity: 0.55,
  },
});