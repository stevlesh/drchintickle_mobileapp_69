import React, { useState, useEffect } from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  // Fetch just stats (sessions, streak, current max) - no workout data
  const fetchUserStats = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error in fetchUserStats:', authError);
        return;
      }
      if (!user) {
        console.log('No user found in fetchUserStats');
        return;
      }
      
      console.log('fetchUserStats: Found user:', user.id);
      
      // Fetch profile with error handling
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return;
      }
      
      if (!profile) {
        console.log('No profile found for user:', user.id);
        return;
      }
      
      // Fetch workout sessions with error handling
      const { data: workoutSessions, error: sessionsError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false });
      
      if (sessionsError) {
        console.error('Workout sessions fetch error:', sessionsError);
        // Continue with empty sessions array
      }
      
      // Calculate stats
      const totalSessions = workoutSessions?.length || 0;
      
      // Extract workout dates for streak calculation
      const workoutDates = workoutSessions?.map(session => session.workout_date) || [];
      const currentStreak = calculateStreak(workoutDates);
      
      // For new users, show 0 as the current max until they complete the max test
      const userMax = profile.current_max_pullups !== null ? profile.current_max_pullups : 0;
      
      // Update only stats, keep existing workout data
      setUserStats(prev => ({
        ...prev,
        currentMax: userMax,
        totalSessions: totalSessions,
        currentStreak: currentStreak,
      }));
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };


  // Fetch complete data including workout info - used on initial load
  const fetchCompleteData = async () => {
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
      
      console.log('Next workout data:', nextWorkout);
      
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
      console.error('Error fetching complete data:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchCompleteData(); // Load everything on mount
    const { quote, context } = getDashboardQuote();
    setCurrentQuote(quote);
    setQuoteContext(context);
  }, []);

  // Add loading state to prevent multiple simultaneous fetches
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh complete data (stats + workout info) when screen comes into focus  
  useFocusEffect(
    React.useCallback(() => {
      if (!isRefreshing) {
        setIsRefreshing(true);
        fetchCompleteData().finally(() => setIsRefreshing(false)); // Refresh everything including workout patterns
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
        <NeonButton 
          title={needsMaxTest ? "COMPLETE MAX TEST FIRST" : "START NEXT WORKOUT"} 
          onPress={handleWorkoutPress}
          variant={needsMaxTest ? "secondary" : "primary"}
          style={styles.ctaButton}
        />

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
    paddingHorizontal: 4, // Match stats grid for alignment
  },
  ctaButton: {
    marginTop: 8, // 8px top margin (8px + 8px = 16px total gap from panel)
    marginBottom: 24, // 24px bottom margin for more space before quote
    marginHorizontal: 8,
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