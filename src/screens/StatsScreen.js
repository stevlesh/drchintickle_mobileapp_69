import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import BackgroundContainer from '../components/BackgroundContainer';
import NeonHeader from '../components/NeonHeader';
import GainsTitleBand from '../components/GainsTitleBand';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import StatsStatCard from '../components/StatsStatCard';
import MaxTestChart from '../components/MaxTestChart';
import { colors } from '../theme/typography';
import { tokens, palette } from '../theme/tokens';
import { supabase } from '../lib/supabase';
import { getTimezone } from '../utils/timezone';

const { width } = Dimensions.get('window');

const StatsScreen = ({ navigation }) => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatsData = async () => {
    try {
      setLoading(true);
      const timezone = getTimezone();
      const { data, error } = await supabase.rpc('get_stats_data', {
        p_tz: timezone
      });

      if (error) throw error;
      setStatsData(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStatsData();
    }, [])
  );

  if (loading || !statsData) {
    return (
      <BackgroundContainer>
        <NeonHeader
          titleSize={40}
          style={styles.header}
        />
        <GainsTitleBand useGradient={true} topGap={6} />
      </BackgroundContainer>
    );
  }

  const maxTestHistory = statsData.max_test_history || [];
  const currentCycle = statsData.current_cycle || {};
  const consistency = statsData.training_consistency || {};

  // Calculate new stat card values
  const S = 8; // Sessions per cycle (always 8)
  const w = currentCycle.workout_num || 1; // Current workout (1-based)
  const completedCycles = Math.max(0, (currentCycle.cycle_num || 1) - 1);
  const sessionsRemaining = Math.max(0, S - (w - 1)); // Inclusive of today

  // Calculate proper consistency percentage
  const daysSinceStart = statsData.days_since_start || 0;
  const completedDays = consistency.completed_days || 0;
  const consistencyPercentage = daysSinceStart > 0
    ? ((completedDays / daysSinceStart) * 100).toFixed(1)
    : '0.0';


  // Debug logging
  console.log('Stats Debug:', {
    dataLength: maxTestHistory.length,
    currentCycle,
    completedCycles,
    sessionsRemaining,
    statsData
  });

  return (
    <BackgroundContainer>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <NeonHeader
          titleSize={40}
          style={styles.header}
        />

        <GainsTitleBand useGradient={true} topGap={6} />

        {/* Hero Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Max Set Progress</Text>
          <MaxTestChart maxTestHistory={maxTestHistory} />
        </View>

        {/* Stats Cards Row 1: Completed Cycles + Remaining Sessions */}
        <View style={styles.statsRow}>
          <StatsStatCard
            icon="sunglasses"
            count={completedCycles}
            label="COMPLETED"
            sublabel="workout cycles"
            borderColor="#FF4DA6"
            glowColor="#FF4DA6"
            gradientColors={tokens.gradient.statPink}
          />

          <StatsStatCard
            icon="cigarette"
            count={sessionsRemaining}
            label="REMAINING"
            sublabel="sessions in cycle"
            borderColor="#FF4DA6"
            glowColor="#FF4DA6"
            gradientColors={tokens.gradient.statPink}
          />
        </View>


        {/* Stats Card Row 3: Training Consistency (full width) */}
        <View style={styles.consistencyRow}>
          <GlassCard
            borderColor="#FFA94D"
            glowColor="#FFA94D"
            style={styles.consistencyCard}>
            <View style={styles.consistencyWrapper}>
              <View style={styles.consistencyContent}>
                {/* Circular percentage on the left */}
                <View style={styles.circleContainer}>
                  <Text style={styles.circlePercentage}>
                    {consistencyPercentage}%
                  </Text>
                </View>

                {/* Text content on the right */}
                <View style={styles.textSection}>
                  <Text style={styles.consistencyTitle}>TRAINING CONSISTENCY</Text>
                  <Text style={styles.consistencySubtext}>
                    {completedDays} of {daysSinceStart} days trained
                  </Text>
                </View>
              </View>
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  chartCard: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: tokens.component.glassPanel.background,
    borderWidth: 1.5,
    borderColor: '#FF77FF',
    shadowColor: '#FF77FF',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  chartTitle: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 18,
    color: palette.warmWhite,
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: colors.electricCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  consistencyRow: {
    marginBottom: 20,
  },
  consistencyCard: {
  },
  consistencyWrapper: {
    marginVertical: -10,
  },
  consistencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 30,
  },
  circleContainer: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 2.5,
    borderColor: '#FFA94D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFA94D',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  circlePercentage: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
    textShadowColor: '#FFA94D',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  textSection: {
    justifyContent: 'center',
    marginLeft: 20,
  },
  consistencyTitle: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 16,
    color: palette.warmWhite,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  consistencySubtext: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: palette.warmWhite,
    opacity: 0.7,
    textTransform: 'lowercase',
  },
});

export default StatsScreen;