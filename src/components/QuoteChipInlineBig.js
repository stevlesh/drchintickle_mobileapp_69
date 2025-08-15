// src/components/QuoteChipInlineBig.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/typography';

export default function QuoteChipInlineBig({ text }) {
  return (
    <View style={styles.wrap} accessible accessibilityLabel={`Quote: ${text}`}>
      {/* Opening quote near the first character */}
      <Text style={[styles.q, styles.qOpen]} accessible={false}>"</Text>

      <Text style={styles.body}>{text}</Text>

      {/* Closing quote near the last character */}
      <Text style={[styles.q, styles.qClose]} accessible={false}>"</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0,213,255,0.6)', // cyanA @ 60% for softer edge
  },
  body: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.white,
    textAlign: 'center',
    // keep some inner room so quotes don't collide on tiny screens
    paddingHorizontal: 4,
  },
  q: {
    position: 'absolute',
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 20,
    color: colors.electricCyan,
    opacity: 0.9,
    textShadowColor: 'rgba(0,183,230,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  qOpen: { top: 10, left: 12, transform: [{ translateY: -2 }] },
  qClose: { bottom: 10, right: 12, transform: [{ translateY: 2 }] },
});