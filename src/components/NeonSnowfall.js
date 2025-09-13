import React, { useEffect, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { Snowflake } from 'phosphor-react-native';
import { colors } from '../theme/typography';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const NeonSnowfall = ({ count = 15 }) => {
  const [snowflakes, setSnowflakes] = useState([]);

  // Neon color palette for Miami Vice snow
  const neonColors = [
    colors.electricCyan,   // Electric cyan
    colors.hotPink,        // Hot pink
    colors.neonYellow,     // Neon yellow
    colors.purple,         // Neon purple
    colors.lightBlue,      // Light blue
  ];

  useEffect(() => {
    // Generate initial snowflakes
    const initialSnowflakes = Array.from({ length: count }, (_, index) => ({
      id: index,
      animValue: new Animated.Value(-50), // Start above screen
      x: Math.random() * (screenWidth - 30), // Random horizontal position
      color: neonColors[Math.floor(Math.random() * neonColors.length)],
      duration: 3000 + Math.random() * 2000, // Random fall speed (3-5s) - much slower
      delay: Math.random() * 2000, // Random delay before starting
    }));

    setSnowflakes(initialSnowflakes);

    // Start animations with delays
    initialSnowflakes.forEach((snowflake) => {
      const animate = () => {
        snowflake.animValue.setValue(-50);
        Animated.timing(snowflake.animValue, {
          toValue: screenHeight + 50,
          duration: snowflake.duration,
          useNativeDriver: true,
          delay: snowflake.delay,
        }).start(() => {
          // Restart animation when complete (continuous snowfall)
          setTimeout(animate, Math.random() * 3000); // Random restart delay
        });
      };
      animate();
    });

    // Cleanup function
    return () => {
      initialSnowflakes.forEach((snowflake) => {
        snowflake.animValue.stopAnimation();
      });
    };
  }, [count]);

  return (
    <View style={styles.container} pointerEvents="none">
      {snowflakes.map((snowflake) => (
        <Animated.View
          key={snowflake.id}
          style={[
            styles.snowflake,
            {
              left: snowflake.x,
              transform: [{ translateY: snowflake.animValue }],
            },
          ]}
        >
          <Snowflake
            size={42}
            color={snowflake.color}
            style={{
              textShadowColor: snowflake.color,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 8,
            }}
          />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  snowflake: {
    position: 'absolute',
    zIndex: 1, // Behind UI elements but in front of background
  },
});

export default NeonSnowfall;