import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const NeonTrophyIcon = ({ size = 24, color = "#ffd700", style = {} }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Subtle pulsing animation for the icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: false, // Fix for web compatibility
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false, // Fix for web compatibility
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Animated.Image
        source={require('../assets/icons/sessions2.png')}
        style={[
          {
            width: size,
            height: size,
            objectFit: 'contain', // Replace deprecated resizeMode
            // Simple CSS filter for web compatibility
            filter: `hue-rotate(${color === '#ffd700' ? '0' : color === '#ff8c00' ? '30' : '0'}deg) brightness(1.3) drop-shadow(0 0 ${size/4}px ${color})`,
            transform: [{ scale }],
            opacity: glow,
          }
        ]}
      />
    </View>
  );
};

export default NeonTrophyIcon; 