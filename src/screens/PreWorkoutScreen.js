import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Cigarette } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import BackgroundContainer from '../components/BackgroundContainer';
import NeonButton from '../components/NeonButton';
import NeonBarButton from '../components/NeonBarButton';
import VStack from '../components/VStack';
import { colors } from '../theme/typography';
import { tokens } from '../theme/tokens';
import { getQuote } from '../utils/quotes';
import { supabase } from '../lib/supabase';
import { generateWorkout } from '../utils/workoutApi';
import QuoteChipMeasured from '../components/QuoteChipMeasured';
import SetBreakdownCompactGrid from '../components/SetBreakdownCompactGrid';
import { bus } from '../lib/bus';

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
  
  // Refs for robust caching and race condition prevention
  const inflightRef = useRef(false);
  const lastFetchRef = useRef(0);
  const sequenceRef = useRef(0);
  const mountedRef = useRef(true);
  
  // Fetch workout data with TTL caching and race condition protection
  const fetchWorkoutDataSafe = async (force = false) => {
    const now = Date.now();
    const TTL = 15 * 1000; // 15 seconds
    
    // Check TTL unless forced
    if (!force && (now - lastFetchRef.current < TTL)) {
      console.log('⏭️ PreWorkout: Skipping fetch, within TTL');
      return;
    }
    
    // Prevent duplicate calls
    if (inflightRef.current) {
      console.log('⏭️ PreWorkout: Skipping fetch, already in flight');
      return;
    }
    
    const sequence = ++sequenceRef.current;
    inflightRef.current = true;
    
    console.log('🔄 PreWorkout: Fetching workout data (sequence:', sequence, ')');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mountedRef.current || sequence !== sequenceRef.current) return;
      
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!profile || !mountedRef.current || sequence !== sequenceRef.current) return;
      
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
      
      if (!mountedRef.current || sequence !== sequenceRef.current) return;
      
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
      
      lastFetchRef.current = now;
      
    } catch (error) {
      console.error('Error fetching workout data:', error);
      if (mountedRef.current && sequence === sequenceRef.current) {
        setWorkoutData(prev => ({ ...prev, loading: false }));
      }
    } finally {
      if (sequence === sequenceRef.current) {
        inflightRef.current = false;
      }
    }
  };
  
  // Fetch on mount and setup cleanup
  useEffect(() => {
    fetchWorkoutDataSafe();
    
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  // Listen for workout completion events for immediate invalidation
  useEffect(() => {
    const unsubscribe = bus.on('workout:completed', () => {
      console.log('🔄 PreWorkout: Workout completed, forcing refresh');
      fetchWorkoutDataSafe(true);
    });
    
    return unsubscribe;
  }, []);
  
  // Always fetch on focus (respects TTL unless forced)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 PreWorkout: Screen focused, checking for refresh');
      fetchWorkoutDataSafe();
    }, [])
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
                  <View style={styles.maxTestHeader}>
                    <Cigarette
                      size={28}
                      color={colors.electricCyan}
                      style={{ marginRight: 12 }}
                    />
                    <Text style={styles.maxTestHeaderText}>MAX TEST INSTRUCTIONS</Text>
                  </View>
                  <Text style={styles.maxTestInstructions}>
                    One set. All out. No half-reps. This isn't Planet Fitness. Your max sets the baseline for the next 8 workouts.
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
            <View style={styles.ctaButton}>
              <NeonBarButton 
                title="ACTIVATE SWOLE PATROL" 
                onPress={handleStartSession}
                fontFamily="IBMPlexMono_700Bold"
                colors={{
                  primary: tokens.brand.primary,       // #ff1493
                  secondary: tokens.brand.secondary,   // #00ffff
                  text: "#ffffff",
                }}
                disabled={false}
              />
            </View>
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
  ctaButton: {
    marginTop: 12,
    marginBottom: 24,   // give the glow room to breathe
    marginHorizontal: 16,
    overflow: "visible", // CRITICAL: don't clip the neon ring shadow
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
  maxTestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  maxTestHeaderText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
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