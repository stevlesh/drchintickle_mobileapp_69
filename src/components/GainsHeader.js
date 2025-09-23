import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from '../theme/typography';

const GainsHeader = () => {
  // Define colors for each letter: Cyan, Pink, Yellow, Pink, Cyan
  const letterColors = [
    colors.electricCyan, // G - Cyan
    colors.hotPink,      // A - Pink
    colors.neonYellow,   // I - Yellow
    colors.hotPink,      // N - Pink
    colors.electricCyan, // S - Cyan
  ];

  const letters = 'GAINS'.split('');

  return (
    <View style={styles.container}>
      <View style={styles.lettersContainer}>
        {letters.map((letter, index) => (
          <View key={index} style={styles.letterWrapper}>
            {/* White stroke/border text behind */}
            <Text
              style={[
                styles.letterStroke,
                {
                  color: colors.white,
                }
              ]}
            >
              {letter}
            </Text>
            {/* Colored letter on top */}
            <Text
              style={[
                styles.letter,
                {
                  color: letterColors[index],
                  textShadowColor: letterColors[index],
                }
              ]}
            >
              {letter}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: -12, // More negative margin to bring it even closer to Dr. ChinTickle
    marginBottom: 4, // Reduced from 8 to sit even closer to chart
    position: 'relative',
  },
  lettersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5, // Reduced from 10 to make it more compact
  },
  letterWrapper: {
    position: 'relative',
    marginHorizontal: 6,
  },
  letterStroke: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 6,
    textTransform: 'uppercase',
    position: 'absolute',
    // Create stroke effect with multiple shadows
    textShadowColor: colors.white,
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 0 },
  },
  letter: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 6,
    textTransform: 'uppercase',
    // Glow effect
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
});

export default GainsHeader;