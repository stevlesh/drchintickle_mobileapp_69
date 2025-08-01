import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SecondaryButton = ({ title, onPress, style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <LinearGradient
        colors={['#ec4899', '#a855f7', '#06b6d4']} // Pink-to-Cyan gradient for border
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBorder}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.text}>{title}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientBorder: {
    borderRadius: 12,
    padding: 2, // This creates the border effect
  },
  innerContainer: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  text: {
    color: '#67e8f9',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    textShadowColor: '#06b6d4',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});

export default SecondaryButton;