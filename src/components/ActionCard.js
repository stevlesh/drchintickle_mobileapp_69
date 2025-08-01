import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

const ActionCard = ({ children, borderColor = '#a855f7', glowColor }) => {
  const cardGlowColor = glowColor || borderColor;
  
  return (
    <View style={[styles.container, { shadowColor: cardGlowColor }]}>
      <BlurView intensity={15} tint="dark" style={[styles.blurContainer, { borderColor }]}>
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8, // Android shadow
  },
  blurContainer: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    overflow: 'hidden',
  },
});

export default ActionCard;