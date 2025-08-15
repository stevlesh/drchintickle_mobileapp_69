import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/typography';
import { tokens } from '../theme/tokens';

const QuoteChipStacked = ({ text }) => {
  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityLabel={`Quote: ${text}`}
    >
      {/* Opening quote - top left */}
      <Text 
        style={[styles.quoteMarkOpening]}
        accessible={false}
      >
        "
      </Text>
      
      {/* Quote text */}
      <Text style={styles.quoteText}>
        {text}
      </Text>
      
      {/* Closing quote - bottom right */}
      <Text 
        style={[styles.quoteMarkClosing]}
        accessible={false}
      >
        "
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 213, 255, 0.6)', // tokens.color.cyanA at 0.6 opacity
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    position: 'relative',
    marginVertical: 6,
    marginHorizontal: 6,
  },
  quoteText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: 8, // Extra padding for long quotes to wrap nicely
  },
  quoteMarkOpening: {
    position: 'absolute',
    top: -6,
    left: -6,
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 20,
    color: 'rgba(0, 213, 255, 0.9)', // tokens.color.cyanA at 0.9 opacity
    shadowColor: 'rgba(0, 213, 255, 0.9)',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  quoteMarkClosing: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 20,
    color: 'rgba(0, 213, 255, 0.9)', // tokens.color.cyanA at 0.9 opacity
    shadowColor: 'rgba(0, 213, 255, 0.9)',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});

export default QuoteChipStacked;