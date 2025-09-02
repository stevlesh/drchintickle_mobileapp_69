import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import BackgroundContainer from '../components/BackgroundContainer';
import NeonButton from '../components/NeonButton';
import VStack from '../components/VStack';
import { colors } from '../theme/typography';
import { tokens } from '../theme/tokens';
import { getQuote } from '../utils/quotes';
import { supabase } from '../lib/supabase';
import { generateWorkout } from '../utils/workoutApi';
import QuoteChipMeasured from '../components/QuoteChipMeasured';
import SetBreakdownCompactGrid from '../components/SetBreakdownCompactGrid';

const PreWorkoutScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  
  // State for workout data fetched from database
  const [workoutData, setWorkoutData] = useState({
    workoutNum: 1,
    totalWorkouts: 8,
    workoutType: 'MAX TEST',
    pattern: 'MAX TEST',
    setBreakdown: null,
    targetReps: null,
    isMaxTestDay: true,
    loading: true,
  });
  
  const quote = getQuote('preWorkout');
  const nextSetIndex = 0;
  
  // Fetch current workout data from database
  const fetchWorkoutData = async () => {
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
      
      // Determine if this is a max test day
      const isMaxTestDay = workoutNum === 1;
      
      setWorkoutData({
        workoutNum,
        totalWorkouts: 8,
        workoutType: isMaxTestDay ? 'MAX TEST' : nextWorkout.patternName,
        pattern: isMaxTestDay ? 'MAX TEST' : nextWorkout.patternName,
        setBreakdown: isMaxTestDay ? null : nextWorkout.setBreakdown,
        targetReps: isMaxTestDay ? null : nextWorkout.totalReps,
        isMaxTestDay,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching workout data:', error);
      setWorkoutData(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Prevent double invocation (React StrictMode, network retries, etc.)
  const didRunRef = useRef(false);
  
  // Fetch data on mount with double-invocation guard
  useEffect(() => {
    if (didRunRef.current) return; // Guard against StrictMode double invoke
    didRunRef.current = true;
    fetchWorkoutData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Only refetch on focus if route params indicate data should be refreshed
  useFocusEffect(
    React.useCallback(() => {
      // Check if we should refresh data based on route params
      const shouldRefresh = route?.params?.shouldRefresh;
      if (shouldRefresh) {
        console.log('🔄 PreWorkout: Refreshing data due to route param');
        fetchWorkoutData();
        // Clear the refresh flag to prevent repeated refreshes
        if (navigation.setParams) {
          navigation.setParams({ shouldRefresh: false });
        }
      } else {
        console.log('⏭️ PreWorkout: Skipping refresh, using cached data');
      }
      return () => {};
    }, [route?.params?.shouldRefresh])
  );

  const handleStartSession = () => {
    const timerStart = Date.now();
    navigation.navigate('Workout', {
      workoutNum: workoutData.workoutNum,
      totalWorkouts: workoutData.totalWorkouts,
      workoutType: workoutData.workoutType,
      pattern: workoutData.pattern,
      setBreakdown: workoutData.setBreakdown,
      targetReps: workoutData.targetReps,
      timerStart,
      isMaxTestDay: workoutData.isMaxTestDay,
    });
  };


  return (
    <BackgroundContainer>
      <ScrollView contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 86, minHeight: '100%', justifyContent: 'flex-start' }
      ]}>
        {/* Show loading or content */}
        {workoutData.loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>LOADING WORKOUT...</Text>
          </View>
        ) : (
          <VStack space={16}>
            {/* Set Breakdown Card */}
            {workoutData.isMaxTestDay ? (
              <View style={[styles.neonCardShadow, { shadowColor: tokens.border.primary }]}>
                <LinearGradient
                  colors={tokens.component.neonCard.background}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.setBreakdownCard}
                >
                  <Text style={styles.cardLabel}>MAX TEST INSTRUCTIONS</Text>
                  <Text style={styles.maxTestInstructions}>
                    Perform a single set of as many pull-ups as you can with good form.
                    This will set your baseline for the next workouts in the cycle.
                  </Text>
                </LinearGradient>
              </View>
            ) : (
              <SetBreakdownCompactGrid
                data={workoutData.setBreakdown?.map((reps, idx) => ({
                  k: `S${idx + 1}`,
                  v: reps.toString(),
                  next: idx === nextSetIndex,
                })) || []}
              />
            )}

            {workoutData.isMaxTestDay && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLbl}>GOAL</Text>
                <Text style={styles.totalVal}>MAX</Text>
              </View>
            )}

            {/* Quote */}
            <QuoteChipMeasured text={quote || 'Pain is weakness leaving the body!'} />

            {/* CTA Button */}
            <NeonButton 
              title="START SESSION" 
              onPress={handleStartSession}
              variant="primary"
            />
          </VStack>
        )}
      </ScrollView>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  // Simple container like Dashboard
  container: {
    padding: 24,
  },
  // Neon Card
  neonCardShadow: {
    borderRadius: 16,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  setBreakdownCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: tokens.border.primary,
    padding: 16,
  },
  cardLabel: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: colors.mediumGray,
    textTransform: 'uppercase',
    marginBottom: 12,
    textAlign: 'center',
  },
  maxTestInstructions: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Total Reps
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  // Start button removed - no longer needed with VStack
  totalLbl: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 12,
    color: '#FFF',
    marginRight: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  totalVal: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 22,
    color: colors.electricCyan,
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 16,
    color: colors.electricCyan,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default PreWorkoutScreen;