import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import GlassCard from './GlassCard';
import { colors, textStyles } from '../theme/typography';

const StatCard = ({ icon, count, label, borderColor, glowColor }) => {
  return (
    <GlassCard 
      style={styles.card}
      borderColor={borderColor}
      glowColor={glowColor}
    >
      <View style={styles.row}>
        <Image 
          source={icon} 
          style={[styles.icon, { tintColor: borderColor }]}
          defaultSource={icon} // Fallback to same icon
          onError={(e) => console.log('Icon failed to load:', e.nativeEvent.error)}
        />
        <Text style={styles.count}>{count}</Text>
      </View>
      <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </Text>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 20,
    paddingHorizontal: 16, // Reduced from 24
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    minHeight: 120,
    minWidth: 100, // Ensure minimum width
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  icon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    ...Platform.select({
      web: {
        objectFit: 'contain',
      }
    })
  },
  count: {
    ...textStyles.heroNumber,
    fontSize: 18,
    color: colors.white,
    fontWeight: '600',
  },
  label: {
    ...textStyles.infoLabel,
    fontSize: 10, // Reduced from 12
    color: colors.white,
    letterSpacing: 0.5, // Reduced from 1
    textAlign: 'center',
    width: '100%', // Ensure label takes full width
  },
});

export default StatCard; 