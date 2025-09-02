import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/typography';

export default function LoadingScreen() {
  // Simple splash screen - App.js handles all routing logic

  return (
    <LinearGradient
      colors={[
        colors.hotPink,
        colors.purple,
        colors.darkPurple,
        colors.deepPurple,
        colors.veryDark
      ]}
      style={styles.container}
    >
      <Text style={styles.title}>DR. CHINTICKLE</Text>
      <Text style={styles.subtitle}>THE ROAD TO 69 PULL-UPS IN ONE SET</Text>
      <Text style={styles.quote}>"GREATNESS IS EARNED, NOT GIVEN"</Text>
      <ActivityIndicator size="large" color={colors.electricCyan} style={styles.spinner} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontFamily: 'Pacifico_400Regular',
    color: colors.white,
    letterSpacing: 2,
    marginBottom: 12,
    textShadowColor: colors.electricCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Orbitron_400Regular',
    color: colors.lightGray,
    letterSpacing: 1.5,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  quote: {
    fontSize: 16,
    fontFamily: 'Righteous_400Regular',
    color: colors.neonYellow,
    letterSpacing: 1,
    marginBottom: 40,
    textShadowColor: colors.neonYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    fontStyle: 'italic',
  },
  spinner: {
    marginTop: 20,
  },
});