import React, { useState, useEffect } from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import BackgroundContainer from '../components/BackgroundContainer';
import ProgressRing from '../components/ProgressRing';
import NeonHeader from '../components/NeonHeader';
import GlassCard from '../components/GlassCard';
import NeonButton from '../components/NeonButton';
import NeonBarButton from '../components/NeonBarButton';
import AnimatedBeachBallButton from '../components/AnimatedBeachBallButton';
import StatCard from '../components/StatCard';
import NeonIcon from '../components/NeonIcon';
import { colors, textStyles } from '../theme/typography';
import { tokens } from '../theme/tokens';
import { supabase } from '../lib/supabase';
import { bus } from '../lib/bus';
import { Trophy, RainbowCloud } from 'phosphor-react-native';
import WorkoutProgressTracker from '../components/WorkoutProgressTracker';
import { getQuote, getDashboardQuote } from '../utils/quotes';
import { generateWorkout } from '../utils/workoutApi';
import QuoteChipMeasured from '../components/QuoteChipMeasured';

const DashboardScreen = ({ navigation }) => {
  const [userStats, setUserStats] = useState({
    currentMax: 0,
    totalSessions: 0,
    currentStreak: 0,
    nextWorkout: {
      workoutNum: 1,
      type: 'max_test',
      pattern: null,
      target: null,
      setBreakdown: null,
      patternName: null,
      requiresMaxTest: false,
    }
  });
  const [currentQuote, setCurrentQuote] = useState(null);
  const [quoteContext, setQuoteContext] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard stats from server (replaces client-side calculations)
  const fetchDashboardStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats');

      if (error) throw error;
      if (!data) return null;

      // Generate workout plan based on server data
      const nextWorkout = await generateWorkout({
        workoutNum: data.current_workout_in_cycle || 1,
        userMax: data.current_max_pullups || 0,
        cycleStartMax: data.cycle_start_max || data.current_max_pullups || 0,
      });

      // Update all stats at once
      setUserStats({
        currentMax: data.current_max_pullups,
        totalSessions: data.total_sessions,
        currentStreak: data.current_streak,
        nextWorkout: nextWorkout,
      });

      console.log('Dashboard stats updated:', {
        sessions: data.total_sessions,
        streak: data.current_streak,
        workout: data.current_workout_in_cycle,
        hasWorkoutToday: data.has_workout_today
      });

      return data; // Return for retry logic
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return null;
    }
  };


  // Initial data load
  useEffect(() => {
    fetchDashboardStats(); // Load everything on mount
    const { quote, context } = getDashboardQuote();
    setCurrentQuote(quote);
    setQuoteContext(context);
  }, []);

  // Listen for workout completion with two-shot micro-retry
  useEffect(() => {
    const unsubscribe = bus.on('workout:completed', async ({ workoutDay }) => {
      console.log('🎯 Dashboard: Workout completed event received');

      // First attempt
      const p1 = await fetchDashboardStats();
      if (p1?.has_workout_today || p1?.latest_workout_day === workoutDay) {
        console.log('✅ Dashboard updated on first attempt');
        return;
      }

      // Wait and retry once
      console.log('⏳ Dashboard: Retrying in 350ms...');
      await new Promise(r => setTimeout(r, 350));
      await fetchDashboardStats();
      console.log('✅ Dashboard updated on retry');
    });

    return unsubscribe;
  }, []);


  // Refresh dashboard data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (!isRefreshing) {
        setIsRefreshing(true);
        fetchDashboardStats().finally(() => setIsRefreshing(false));
      }
      return () => {}; // cleanup function
    }, [])
  );

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleWorkoutPress = () => {
    // Check if this is a max test day (workout 1)
    const isMaxTestDay = userStats.nextWorkout.workoutNum === 1;
    
    // Navigate to WorkoutStack screen, then PreWorkout within it
    navigation.navigate('WorkoutStack', {
      screen: 'PreWorkout',
      params: {
        workoutNum: userStats.nextWorkout.workoutNum,
        workoutType: isMaxTestDay ? 'MAX TEST' : userStats.nextWorkout.patternName,
        pattern: isMaxTestDay ? 'MAX TEST' : userStats.nextWorkout.patternName,
        setBreakdown: isMaxTestDay ? null : userStats.nextWorkout.setBreakdown,
        targetReps: isMaxTestDay ? null : userStats.nextWorkout.totalReps || 0,
        totalWorkouts: 8,
        isMaxTestDay,
      }
    });
  }

  // Check if next workout is a max test day or requires max test
  const isMaxTestDay = userStats.nextWorkout.workoutNum === 1 || userStats.nextWorkout.requiresMaxTest;
  const needsMaxTest = userStats.nextWorkout.requiresMaxTest;


  return (
    <BackgroundContainer>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <NeonHeader 
          subtitle="THE ROAD TO 69 PULL-UPS IN ONE SET"
          titleSize={40}
          subtitleSize={14}
          style={styles.header}
        />

        {/* Progress Ring */}
        <ProgressRing 
          currentMax={userStats.currentMax} 
          targetMax={69} 
        />

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="trophy"
            count={userStats.totalSessions}
            label="SESSIONS"
            borderColor={colors.electricCyan}
            glowColor={colors.electricCyan}
          />
          <StatCard
            icon="rainbow"
            count={userStats.currentStreak}
            label="STREAK"
            borderColor={colors.electricCyan}
            glowColor={colors.electricCyan}
          />
        </View>

        {/* Workout Progress Tracker */}
        <View style={styles.trackerContainer}>
          <WorkoutProgressTracker 
            currentWorkoutNum={userStats.nextWorkout.workoutNum}
            workoutType={isMaxTestDay ? 'MAX TEST' : userStats.nextWorkout.patternName}
            totalWorkouts={8}
          />
        </View>

        {/* CTA Button */}
        <View style={styles.ctaButton}>
          <AnimatedBeachBallButton
            label={needsMaxTest ? "MAX ME DADDY" : "GET SWOLE"}
            onPress={handleWorkoutPress}
            showGloss={false}
            accessibilityLabel={needsMaxTest ? "Start max test workout" : "Start workout session"}
          />
        </View>

        {/* Motivational Quote */}
        <QuoteChipMeasured text={currentQuote || 'Pain is weakness leaving the body!'} />

        {/* Logout Button - For development */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 80, // Extra bottom padding for easier logout access
  },
  header: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
    marginBottom: 8, // 8px bottom margin
    paddingHorizontal: 4, // Reduced from 8px
  },
  trackerContainer: {
    marginTop: 8, // 8px top margin (8px + 8px = 16px total gap from stats)
    marginBottom: 8, // 8px bottom margin
    // Remove paddingHorizontal so palm trees span full width of stat cards
  },
  ctaButton: {
    marginTop: 12,
    marginBottom: 24,   // give the glow room to breathe
    marginHorizontal: 16,
    overflow: "visible", // CRITICAL: don't clip the neon ring shadow
  },
  quote: {
    alignItems: 'center',
    marginTop: 8, // 8px top margin (24px + 8px = 32px total gap from button)
    paddingVertical: 16,
    marginHorizontal: 8,
  },
  quoteText: {
    ...textStyles.quote,
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
    // Ensure no additional shadow effects
    textShadowRadius: 4,
  },
  quoteAuthor: {
    ...textStyles.quoteAuthor,
  },
  logoutButton: {
    alignSelf: 'center',
    marginTop: 20,
    padding: 10,
  },
  logoutText: {
    ...textStyles.smallText,
    fontFamily: 'IBMPlexMono_400Regular',
    color: colors.mediumGray,
  },
  quoteTextDirect: {
    ...textStyles.quote,
    fontFamily: 'IBMPlexMono_400Regular',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 8,
    fontSize: 16,
    textShadowColor: colors.neonYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    paddingHorizontal: 8,
  },
});

export default DashboardScreen;