import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Platform } from 'react-native';

const NeonPalm = ({ size = 80, color = "#ff69b4", style = {} }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        // Scale animation
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.1,
            duration: 900,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 900,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
        // Rotation animation
        Animated.sequence([
          Animated.timing(rotate, {
            toValue: 1,
            duration: 900,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(rotate, {
            toValue: -1,
            duration: 900,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(rotate, {
            toValue: 0,
            duration: 900,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
        // Glow animation
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1.2,
            duration: 1200,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(glow, {
            toValue: 0.8,
            duration: 1200,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      ])
    ).start();
  }, []);

  const rotation = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3deg', '0deg', '3deg'],
  });

  // Platform specific styles
  const imageStyle = Platform.OS === 'web' 
    ? {
        width: size,
        height: size,
        objectFit: 'contain',
        filter: `drop-shadow(0 0 ${glow.interpolate({
          inputRange: [0.8, 1.2],
          outputRange: ['8px', '12px']
        })} ${color})`,
        transform: [{scale}, {rotate: rotation}],
      }
    : {
        width: size,
        height: size,
        resizeMode: 'contain',
        tintColor: color,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glow,
        shadowRadius: 10,
        transform: [{scale}, {rotate: rotation}],
      };

  return (
    <Animated.Image
      source={require('../assets/palms/Palm3.png')}
      style={[imageStyle, style]}
    />
  );
};

const NeonPalmTree = ({ size = 80, color = "#ff69b4", style = {} }) => {
  return <NeonPalm size={size} color={color} style={style} />;
};

export default NeonPalmTree; 