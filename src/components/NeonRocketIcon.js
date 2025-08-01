import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const NeonRocketIcon = ({ size = 24, color = "#ff8c00", style = {} }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rocket launch animation - subtle upward drift
    Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: -2,
          duration: 1500,
          useNativeDriver: false, // Fix for web compatibility
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false, // Fix for web compatibility
        }),
        Animated.timing(drift, {
          toValue: -1,
          duration: 1000,
          useNativeDriver: false, // Fix for web compatibility
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false, // Fix for web compatibility
        }),
      ])
    ).start();

    // Pulsing glow animation for rocket
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 1800,
          useNativeDriver: false,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Animated.Image
        source={require('../assets/icons/streak.png')}
        style={[
          {
            width: size,
            height: size,
            objectFit: 'contain', // Replace deprecated resizeMode
            // Rocket-specific filter effects - bright and energetic
            filter: `hue-rotate(${color === '#ff8c00' ? '0' : color === '#ff1493' ? '300' : '0'}deg) brightness(1.5) drop-shadow(0 0 ${size/2}px ${color})`,
            transform: [{ scale }, { translateY: drift }],
          }
        ]}
      />
    </View>
  );
};

export default NeonRocketIcon; 