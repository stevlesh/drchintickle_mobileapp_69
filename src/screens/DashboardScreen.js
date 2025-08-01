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
            icon={require('../assets/icons/sessions3.png')}
            count={userStats.totalSessions}
            label="SESSIONS"
            borderColor={colors.gold}
            glowColor={colors.gold}
          />
          <StatCard
            icon={require('../assets/icons/streak2.png')}
            count={userStats.currentStreak}
            label="STREAK"
            borderColor={colors.orange}
            glowColor={colors.orange}
          />
        </View>

        {/* Next Workout Card */}
        <GlassCard 
          style={styles.workoutCard}
          borderColor={colors.electricCyan}
          glowColor={colors.electricCyan}
        >
          <Text style={styles.workoutHeader}>NEXT WORKOUT ({userStats.nextWorkout.workoutNum}/8)</Text>
          {/* Workout type with text shadow glow instead of background */}
          <Text style={styles.workoutType}>
            {isMaxTestDay ? 'MAX TEST DAY' : userStats.nextWorkout.patternName || 'Volume Workout'}
          </Text>
          {!isMaxTestDay && (
            <Text style={styles.workoutTarget}>
              TARGET: {userStats.nextWorkout.totalReps || 0} REPS
            </Text>
          )}
        </GlassCard>

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
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
    paddingHorizontal: 4, // Reduced from 8px
  },
  workoutCard: {
    alignItems: 'center',
    marginVertical: 24,
    marginHorizontal: 8,
  },
  workoutHeader: {
    ...textStyles.infoLabel,
    marginBottom: 8,
    color: colors.lightGray,
  },
  workoutType: {
    fontSize: 22,
    fontFamily: 'Orbitron_700Bold',
    color: colors.brightPink,
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    // Bright pink glow that follows text contours
    textShadowColor: colors.brightPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  workoutTarget: {
    ...textStyles.accentLabel,
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
    color: colors.mediumGray,
  },
  quoteTextDirect: {
    ...textStyles.quote,
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