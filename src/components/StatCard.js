import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, RainbowCloud } from 'phosphor-react-native';
import { colors } from '../theme/typography';

const StatCard = ({ icon, count, label, borderColor, glowColor, gradientColors }) => {
  // Icon mapping
  const IconComponent = icon === 'trophy' ? Trophy : RainbowCloud;

  return (
    <View style={[styles.shadowWrap, { shadowColor: glowColor }]}>
      <LinearGradient
        colors={gradientColors || ['#3e0066', '#8b005c']}  // Use themed gradient or fallback
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor }]}
      >
        <View style={styles.iconRow}>
          <IconComponent size={28} color={borderColor} weight="regular" />
          <Text style={[styles.label, { marginLeft: 6 }]}>{label}</Text>
        </View>

        <Text style={[styles.value, { color: borderColor, textShadowColor: borderColor }]}>
          {count}
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrap: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 16,
    shadowOpacity: 0.4,
    shadowRadius: 6,      // Tighter halo
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  card: {
    height: 100,          // Tighter than current 120
    borderRadius: 16,
    borderWidth: 1.5,     // Crisper line
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',   // centers the whole bundle horizontally
    width: 100,            // fixed width for consistent label alignment
  },
  label: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 14,
    color: colors.white,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 32,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    textAlign: 'center',
    width: '100%',
  },
});

export default StatCard; 