import React, { useState, useEffect } from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from '@react-navigation/native';
import BackgroundContainer from '../components/BackgroundContainer';
import ProgressRing from '../components/ProgressRing';
import NeonHeader from '../components/NeonHeader';
import GlassCard from '../components/GlassCard';
import NeonButton from '../components/NeonButton';
import StatCard from '../components/StatCard';
import NeonIcon from '../components/NeonIcon';
import { colors, textStyles } from '../theme/typography';
import { supabase } from '../lib/supabase';
import { CalendarBlank, LadderSimple, Target } from 'phosphor-react-native';
import { getQuote, getDashboardQuote } from '../utils/quotes';
import { generateWorkout } from '../utils/workoutApi';

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
    }
  });
  const [currentQuote, setCurrentQuote] = useState(null);
  const [quoteContext, setQuoteContext] = useState(null);

  // Calculate streak based on workout dates
  const calculateStreak = (workoutDates) => {
    if (!workoutDates || workoutDates.length === 0) return 0;
    
    // Sort dates in descending order (newest first)
    const sortedDates = [...workoutDates].sort((a, b) => new Date(b) - new Date(a));
    
    // Get today's date without time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if the most recent workout was today or yesterday
    const mostRecentDate = new Date(sortedDates[0]);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    // If the most recent workout wasn't today or yesterday, no current streak
    if (mostRecentDate < yesterday) {
      return 0;
    }
    
    // Count consecutive days
    let streak = 1;
    let currentDate = mostRecentDate;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i]);
      prevDate.setHours(0, 0, 0, 0);
      
      // Check if the previous date is exactly one day before current date
      const expectedPrevDate = new Date(currentDate);
      expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
      
      if (prevDate.getTime() === expectedPrevDate.getTime()) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const fetchUserStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!profile) return;
      
      // Fetch workout sessions
      const { data: workoutSessions } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false });
      
      // Calculate stats
      const totalSessions = workoutSessions?.length || 0;
      
      // Extract workout dates for streak calculation
      const workoutDates = workoutSessions?.map(session => session.workout_date) || [];
      const currentStreak = calculateStreak(workoutDates);
      
      // Determine next workout info
      const workoutNum = profile.current_workout_in_cycle || 1;
      
      // For new users, show 0 as the current max until they complete the max test
      const userMax = profile.current_max_pullups !== null ? profile.current_max_pullups : 0;
      const cycleStartMax = profile.cycle_start_max !== null ? profile.cycle_start_max : userMax;
      
      const nextWorkout = await generateWorkout({
        workoutNum,
        userMax,
        cycleStartMax,
      });
      
      console.log('Next workout data:', nextWorkout); // Add logging to debug
      
      setUserStats({
        currentMax: userMax,
        totalSessions: totalSessions,
        currentStreak: currentStreak,
        nextWorkout: {
          workoutNum,
          ...nextWorkout,
        },
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchUserStats();
    const { quote, context } = getDashboardQuote();
    setCurrentQuote(quote);
    setQuoteContext(context);
  }, []);

  // Refresh data when screen comes into focus (after completing a workout)
  useFocusEffect(
    React.useCallback(() => {
      fetchUserStats();
      return () => {}; // cleanup function
    }, [])
  );

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleWorkoutPress = () => {
    // Check if this is a max test day (workout 1)
    const isMaxTestDay = userStats.nextWorkout.workoutNum === 1;
    
    navigation.navigate('PreWorkout', {
      workoutNum: userStats.nextWorkout.workoutNum,
      workoutType: isMaxTestDay ? 'MAX TEST' : userStats.nextWorkout.patternName,
      pattern: isMaxTestDay ? 'MAX TEST' : userStats.nextWorkout.patternName,
      setBreakdown: isMaxTestDay ? null : userStats.nextWorkout.setBreakdown,
      targetReps: isMaxTestDay ? null : userStats.nextWorkout.totalReps || 0,
      totalWorkouts: 8,
      isMaxTestDay,
    });
  }

  // Check if next workout is a max test day
  const isMaxTestDay = userStats.nextWorkout.workoutNum === 1;

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
            borderColor={colors.gold}
            glowColor={colors.gold}
          />
          <StatCard
            icon="rainbow"
            count={userStats.currentStreak}
            label="STREAK"
            borderColor={colors.orange}
            glowColor={colors.orange}
          />
        </View>

        {/* Next Workout Panel - Horizontal Rows */}
        <View style={[styles.panelShadow, { shadowColor: colors.electricCyan }]}>
          <LinearGradient
            colors={['#1d1440', '#301058']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.panel, { borderColor: colors.electricCyan }]}
          >
            {/* Next Workout Row */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <CalendarBlank size={18} color={colors.electricCyan} weight="regular" />
                <Text style={styles.rowLabel}>NEXT WORKOUT</Text>
              </View>
              <Text style={styles.rowValue}>{userStats.nextWorkout.workoutNum} / 8</Text>
            </View>

            {/* Workout Type Row */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <LadderSimple size={18} color={colors.electricCyan} weight="regular" />
                <Text style={styles.rowLabel}>WORKOUT TYPE</Text>
              </View>
              <Text style={styles.rowValue}>
                {isMaxTestDay ? 'MAX TEST' : userStats.nextWorkout.patternName || 'VOLUME'}
              </Text>
            </View>

            {/* Target Reps Row */}
            <View style={[styles.row, { marginBottom: 0 }]}>
              <View style={styles.rowLeft}>
                <Target size={18} color={colors.electricCyan} weight="regular" />
                <Text style={styles.rowLabel}>TARGET REPS</Text>
              </View>
              <Text style={styles.rowValue}>
                {isMaxTestDay ? 'MAX' : (userStats.nextWorkout.totalReps || 0)}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* CTA Button */}
        <NeonButton 
          title="START NEXT WORKOUT" 
          onPress={handleWorkoutPress}
          variant="primary"
          style={styles.ctaButton}
        />

        {/* Motivational Quote - no card, just neon text */}
        <Text style={styles.quoteTextDirect}>
          {currentQuote ? `"${currentQuote}"` : '"Pain is weakness leaving the body!"'}
        </Text>

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
  },
  header: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
    paddingHorizontal: 4, // Reduced from 8px
  },
  panelShadow: {
    marginVertical: 24,
    marginHorizontal: 8,
    borderRadius: 16,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  panel: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLabel: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  rowValue: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 16,
    color: colors.electricCyan,
    textAlign: 'right',
    flexShrink: 1,
    maxWidth: '60%',
  },
  ctaButton: {
    marginVertical: 24,
    marginHorizontal: 8,
  },
  quote: {
    alignItems: 'center',
    marginTop: 32,
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