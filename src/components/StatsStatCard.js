import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, RainbowCloud, Sunglasses, Cigarette } from 'phosphor-react-native';
import { colors } from '../theme/typography';

const StatsStatCard = ({ icon, count, label, sublabel, borderColor, glowColor, gradientColors }) => {
  // Icon mapping
  const iconMap = {
    'trophy': Trophy,
    'cloud': RainbowCloud,
    'sunglasses': Sunglasses,
    'cigarette': Cigarette
  };

  const IconComponent = iconMap[icon] || Trophy;

  return (
    <View style={[styles.shadowWrap, { shadowColor: glowColor }]}>
      <LinearGradient
        colors={gradientColors || ['#3e0066', '#8b005c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor }]}
      >
        <View style={styles.iconRow}>
          <IconComponent size={28} color={borderColor} weight="regular" />
          <Text style={[styles.label, { marginLeft: 6 }]}>{label}</Text>
        </View>

        <View style={styles.bottomSection}>
          <Text style={[styles.value, { color: borderColor, textShadowColor: borderColor }]}>
            {count}
          </Text>
          {sublabel && (
            <Text style={styles.sublabel}>{sublabel}</Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrap: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 16,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  card: {
    height: 85,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingTop: 4,
    paddingBottom: 6,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: -2,
  },
  label: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: colors.white,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bottomSection: {
    alignItems: 'center',
    gap: 1,
    marginTop: -4,
  },
  value: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 28,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    textAlign: 'center',
  },
  sublabel: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 9,
    color: colors.white,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default StatsStatCard;