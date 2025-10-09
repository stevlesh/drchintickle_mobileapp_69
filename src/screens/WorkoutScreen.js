import React, { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, AppState, ScrollView, Animated, Easing } from 'react-native'
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BackgroundContainer from '../components/BackgroundContainer'
import NeonBarButton from '../components/NeonBarButton'
import NeonIcon from '../components/NeonIcon'
import { Cheers } from 'phosphor-react-native'
import SetBreakdownCompactGrid from '../components/SetBreakdownCompactGrid'
import WorkoutProgressTracker from '../components/WorkoutProgressTracker'
import QuoteChipMeasured from '../components/QuoteChipMeasured'
import NeonSnowfall from '../components/NeonSnowfall'
import AnimatedKissMark from '../components/AnimatedKissMark'
// Premium components for Max Test completion
import NeonGlowFrame from '../components/premium/NeonGlowFrame'
import NeonNumber from '../components/premium/NeonNumber'
import NeonBadge from '../components/premium/NeonBadge'
import { useReduceMotion } from '../hooks/useReduceMotion'
import { colors, textStyles } from '../theme/typography'
import { tokens } from '../theme/tokens'
import { getQuoteWithAuthor, getQuote } from '../utils/quotes'
import { supabase } from '../lib/supabase';
import { bus } from '../lib/bus';
import { scheduleRestCompleteNotification, cancelRestNotification } from '../utils/restNotifications';

// Helper to get pattern label for display
const getPatternLabel = (patternType, isMaxTest = false) => {
  if (isMaxTest) return 'MAX TEST';

  const patternMap = {
    'PYRAMID': 'PYRAMID',
    'REVERSE_PYRAMID': 'DESCENDING',
    'EQUAL_SETS': 'EQUAL SETS',
    'EQUAL': 'EQUAL SETS',
    'ASCENDING': 'ASCENDING',
    'DESCENDING': 'DESCENDING',
  };

  return patternMap[patternType?.toUpperCase()] || patternType?.toUpperCase() || 'VOLUME';
};

export default function WorkoutScreen({ navigation, route }) {
  // Safe area insets for proper device compatibility
  const insets = useSafeAreaInsets();
  
  // Accept params from navigation
  const {
    workoutNum = 2,
    totalWorkouts = 8,
    workoutType = 'PYRAMID',
    pattern = 'PYRAMID',
    setBreakdown,
    timerStart = null,
    targetReps = 0,
  } = route?.params || {};

  // Derive isMaxTestDay from workoutNum (workout 1 is always max test)
  const isMaxTestDay = workoutNum === 1;


  // Prefetch previous max data for MAX TEST comparison
  useEffect(() => {
    if (isMaxTestDay) {
      const fetchPreviousMax = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data, error } = await supabase
            .from('workout_sessions')
            .select('completed_reps, workout_date')
            .eq('user_id', user.id)
            .eq('workout_type', 'max_test')
            .order('workout_date', { ascending: false })
            .limit(1)
            .single();

          setPreviousMaxData({
            max: data?.completed_reps || null,
            date: data?.workout_date || null,
            loading: false
          });
        } catch (error) {
          console.log('Previous max fetch (expected for first-time users):', error);
          setPreviousMaxData({ max: null, date: null, loading: false });
        }
      };

      fetchPreviousMax();
    }
  }, [isMaxTestDay]);

  // Remove fallback array - must use server data
  if (!setBreakdown && !isMaxTestDay) {
    console.error('❌ WorkoutScreen: No setBreakdown provided for non-max test workout');
  }
  
  // Calculate total reps if not provided
  const calculatedTargetReps = targetReps || (setBreakdown ? setBreakdown.reduce((a, b) => a + b, 0) : 0);

  const [currentSet, setCurrentSet] = useState(1);
  const [totalSets] = useState(isMaxTestDay ? 1 : (setBreakdown?.length || 8));
  const [repsCompleted, setRepsCompleted] = useState([]);
  const [pageState, setPageState] = useState('active_set'); // 'active_set', 'resting', 'summary'
  const targetRepsArr = isMaxTestDay ? [0] : (setBreakdown || []);
  const [currentReps, setCurrentReps] = useState(isMaxTestDay ? 0 : (targetRepsArr[0] || 0)); // For max test day, start at 0; otherwise, default to set 1 target
  const [restTimeLeft, setRestTimeLeft] = useState(0); // Computed from deadline
  const [workoutDuration, setWorkoutDuration] = useState(0); // Workout duration in seconds
  const [currentQuote, setCurrentQuote] = useState(null);
  const [deadline, setDeadline] = useState(null); // Deadline-based timer for rest
  const [restArmed, setRestArmed] = useState(false); // Blocks auto-complete until first recompute

  // MAX TEST completion data and session key for idempotency
  const [maxTestData, setMaxTestData] = useState(null);
  const [previousMaxData, setPreviousMaxData] = useState({ max: null, date: null, loading: true });
  const sessionKeyRef = useRef(null);

  // Kiss mark animation state
  const [showKissMark, setShowKissMark] = useState(false);
  
  // Animation for rep number pulse and flicker
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const flickerAnim = useRef(new Animated.Value(1)).current;
  
  // Pulse animation disabled - user wants only subtle flicker
  // useEffect(() => {
  //   Animated.sequence([
  //     Animated.timing(pulseAnim, { 
  //       toValue: 1, 
  //       duration: 120, 
  //       easing: Easing.out(Easing.quad), 
  //       useNativeDriver: true 
  //     }),
  //     Animated.timing(pulseAnim, { 
  //       toValue: 0, 
  //       duration: 140, 
  //       easing: Easing.in(Easing.quad), 
  //       useNativeDriver: true 
  //     }),
  //   ]).start();
  // }, [currentReps]);

  // Ultra subtle flicker animation - barely noticeable
  useEffect(() => {
    const flicker = () => {
      Animated.sequence([
        Animated.timing(flickerAnim, { toValue: 0.9995, duration: 50, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => flicker(), 60000 + Math.random() * 120000); // 1-3 minutes between flickers
      });
    };
    flicker();
  }, []);
  
  // Get reduce motion preference
  const reduceMotion = useReduceMotion();
  
  // References for timers
  const workoutTimerRef = useRef(null);
  const workoutStartTimeRef = useRef(Date.now());
  const appStateRef = useRef(AppState.currentState);
  const REST_DURATION_SEC = 120; // 2 minutes rest

  // Generate session key when workout starts
  useEffect(() => {
    // Generate UUID v4 compatible session key
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      sessionKeyRef.current = crypto.randomUUID();
    } else {
      // Fallback for older environments
      sessionKeyRef.current = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    if (__DEV__) {
      console.log('WorkoutScreen params:', { workoutNum, workoutType });
      console.log('WorkoutScreen session key:', sessionKeyRef.current);
    }
  }, [workoutNum, workoutType]);

  // Update workout duration timer
  const updateWorkoutDuration = useCallback(() => {
    const elapsedSeconds = Math.floor((Date.now() - workoutStartTimeRef.current) / 1000);
    setWorkoutDuration(elapsedSeconds);
  }, []);

  // Start rest period with proper state initialization + notification
  const startRest = useCallback(async (seconds = REST_DURATION_SEC) => {
    const dl = Date.now() + seconds * 1000;
    setDeadline(dl);
    setRestTimeLeft(seconds);   // Show full duration immediately (not 0!)
    // Arm immediately for normal durations, delay only for very short rests
    setRestArmed(seconds > 2);  // Arm immediately if > 2 seconds
    setPageState('resting');    // Render rest UI

    // Schedule notification for when rest completes (Phase 2 will add custom sound)
    await scheduleRestCompleteNotification(seconds);
  }, []);

  // Initialize workout timer
  useEffect(() => {
    // Store the workout start time
    workoutStartTimeRef.current = Date.now();
    
    // Start workout duration timer
    updateWorkoutDuration();
    workoutTimerRef.current = setInterval(updateWorkoutDuration, 1000);

    return () => {
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    };
  }, [updateWorkoutDuration]);
  
  // Handle rest countdown from deadline
  useEffect(() => {
    if (!deadline) return;

    const interval = setInterval(() => {
      const ms = Math.max(0, deadline - Date.now());
      const secs = Math.ceil(ms / 1000);
      setRestTimeLeft(secs);

      // Auto-advance when timer hits zero (with safety guards)
      if (secs === 0 && restArmed && pageState === 'resting') {
        clearInterval(interval); // Prevent double-firing
        handleRestComplete();
        return;
      }

      // Only arm if not already armed (handles short rest edge case)
      setRestArmed(prev => prev || true);
    }, 250);

    return () => clearInterval(interval);
  }, [deadline, restArmed, pageState, handleRestComplete]);
  
  // Handle app state changes for workout duration
  useFocusEffect(
    useCallback(() => {
      const subscription = AppState.addEventListener('change', updateWorkoutDuration);
      updateWorkoutDuration();
      
      return () => {
        subscription?.remove?.();
      };
    }, [updateWorkoutDuration])
  );

  // Handle rest completion (guards with restArmed)
  const handleRestComplete = useCallback(async () => {
    if (!restArmed) return; // Prevent premature transitions
    setDeadline(null);
    setRestArmed(false);
    setPageState('active_set');

    // Cancel notification when rest completes naturally
    await cancelRestNotification();
  }, [restArmed]);

  // Handle rest skip - cancel notification when user manually starts set early
  const handleSkipRest = useCallback(async () => {
    if (pageState !== 'resting') return;
    setDeadline(null);
    setRestArmed(false);
    setPageState('active_set');

    // Cancel notification since user started set early
    await cancelRestNotification();
  }, [pageState]);

  // Removed buggy monitor effect - let NeonCountdown be single authority

  // Get context-aware quotes based on workout state
  useEffect(() => {
    let context = 'workout';
    if (pageState === 'resting') context = 'workout'; // Use workout quotes for rest
    if (pageState === 'summary') context = 'completion';
    const quote = getQuote(context);
    setCurrentQuote(quote);
  }, [pageState]);

  const handleCompleteSet = async () => {
    // Cancel any pending rest notification from previous set
    await cancelRestNotification();

    // 🎯 TRIGGER KISS MARK ANIMATION
    setShowKissMark(true);

    // Add current reps to completed array
    setRepsCompleted(prev => [...prev, currentReps])

    if (currentSet < totalSets) {
      setCurrentSet(currentSet + 1)
      setCurrentReps(targetRepsArr[currentSet]) // Set next set's target

      // Start rest period using proper function (includes notification)
      await startRest(REST_DURATION_SEC);
    } else {
      setPageState('summary')
      setDeadline(null);
      setRestArmed(false);
    }
  }

  // Handle MAX TEST commit (called from TIME 2 PARTY button)
  const handleMaxTestCommit = async () => {
    // Calculate final metrics (freeze once)
    const finalDurationSeconds = Math.floor((Date.now() - workoutStartTimeRef.current) / 1000);
    const completedReps = repsCompleted.reduce((a, b) => a + b, 0);

    // VALIDATION: Prevent state loss from component re-mounts
    const finalReps = completedReps > 0 ? completedReps : currentReps;

    // DEBUG: Log all values to understand what's happening
    console.log('🔍 MAX TEST DEBUG:', {
      repsCompleted,
      completedReps,
      currentReps,
      finalReps,
      sessionKey: sessionKeyRef.current
    });

    if (finalReps <= 0) {
      alert('Error: No reps recorded. Please adjust your reps and try again.');
      return;
    }

    const occurredAt = new Date().toISOString();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    try {
      // Single atomic RPC call handles both max test recording AND cycle progression
      const rpcParams = {
        p_reps: finalReps, // Use validated reps
        p_duration_sec: finalDurationSeconds,
        p_occurred_at: occurredAt,
        p_session_key: sessionKeyRef.current,
        p_sets_data: JSON.stringify(repsCompleted.length > 0 ? repsCompleted : [finalReps])
      };

      console.log('🚀 RPC Parameters being sent:', rpcParams);

      const { data, error } = await supabase.rpc('record_max_test_and_progress', rpcParams);

      if (error) {
        console.error('❌ MAX TEST RPC Error:', error);
        // Show error but allow retry
        return;
      } else if (data && data.length > 0) {
        console.log('✅ MAX TEST RPC Success:', data);
        const result = data[0];
        console.log(`✅ MAX TEST complete: ${result.new_max} reps (${result.delta > 0 ? '+' : ''}${result.delta})`);
        console.log(`🚀 Advanced to cycle ${result.next_cycle_num}, workout ${result.next_workout_num}`);
      }

      // Navigate back to dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });

    } catch (error) {
      console.error('MAX TEST commit error:', error);
    }
  };

  const handleFinishWorkout = async () => {
    // Clear workout timer
    if (workoutTimerRef.current) {
      clearInterval(workoutTimerRef.current);
      workoutTimerRef.current = null;
    }

    // Calculate final metrics (freeze once)
    const finalDurationSeconds = Math.floor((Date.now() - workoutStartTimeRef.current) / 1000);
    const completedReps = repsCompleted.reduce((a, b) => a + b, 0);
    const occurredAt = new Date().toISOString();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    try {
      if (isMaxTestDay) {
        // For MAX TEST, just show summary - RPC will be called when user presses "TIME 2 PARTY"
        console.log('✅ MAX TEST summary ready - waiting for user to commit');
      } else {
        // Regular volume workout
        const durationMinutes = Math.round(finalDurationSeconds / 60);

        await supabase.from('workout_sessions').insert({
          user_id: user.id,
          workout_date: occurredAt,
          workout_type: 'volume',
          target_reps: calculatedTargetReps,
          completed_reps: completedReps,
          sets_data: JSON.stringify(repsCompleted),
          duration_minutes: durationMinutes,
          duration_sec: finalDurationSeconds,
          session_key: sessionKeyRef.current
        });

        // Progress regular workout cycle
        const { error: progressError } = await supabase.rpc('complete_workout');
        if (progressError) {
          console.error('Error progressing workout cycle:', progressError);
        }
      }

      // Pre-generate next workout (use progression data from RPC if MAX TEST)
      try {
        const { generateWorkout } = await import('../utils/workoutApi');

        let nextCycle, nextWorkout, userMax, cycleStartMax;

        if (isMaxTestDay && maxTestData) {
          // Use data from RPC response
          nextCycle = maxTestData.nextCycle;
          nextWorkout = maxTestData.nextWorkout;
          userMax = maxTestData.newMax; // New max just set
          cycleStartMax = maxTestData.newMax;
        } else {
          // Get from database for regular workouts
          const { data: profile } = await supabase
            .from('profiles')
            .select('cycle_num, current_workout_in_cycle, current_max_pullups, cycle_start_max')
            .eq('id', user.id)
            .single();

          nextCycle = profile?.cycle_num;
          nextWorkout = profile?.current_workout_in_cycle;
          userMax = profile?.current_max_pullups;
          cycleStartMax = profile?.cycle_start_max;
        }

        const nextPlan = await generateWorkout({
          userId: user.id,
          cycleNum: nextCycle,
          workoutNum: nextWorkout,
          userMax,
          cycleStartMax
        });

        console.log('🎯 Pre-generated next workout:', nextPlan.patternName || 'Max Test');
      } catch (pregenError) {
        console.warn('⚠️ Failed to pre-generate next workout:', pregenError);
      }

    } catch (error) {
      console.error('Error saving workout:', error);
    }

    // Navigate
    navigation.reset({
      index: 0,
      routes: [{ name: 'PreWorkout' }]
    });
    navigation.navigate('Home');

    // Emit completion event
    setTimeout(() => {
      bus.emit('workout:completed', {
        at: Date.now(),
        workoutDay: isMaxTestDay ? 1 : (workoutNum + 1)
      });
    }, 100);
  }

  const handleBackToDashboard = () => {
    // Clear workout timer
    if (workoutTimerRef.current) {
      clearInterval(workoutTimerRef.current);
      workoutTimerRef.current = null;
    }
    
    // Clear rest state (deadline-based timer cleans up automatically via useEffect)
    setDeadline(null);
    setRestArmed(false);
    
    // Reset the WorkoutStack to PreWorkout screen first
    navigation.reset({
      index: 0,
      routes: [{ name: 'PreWorkout' }],
    });
    
    // Then navigate to Home tab
    navigation.navigate('Home')
  }

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Time helpers for clean display
  const pad2 = (n) => String(n).padStart(2, '0');
  const mmss = (s) => `${pad2(Math.floor(s/60))}:${pad2(s%60)}`;

  // Reusable duration chip component
  const DurationChip = ({ label, seconds }) => (
    <View 
      accessible 
      accessibilityRole="text" 
      accessibilityLabel={`${label}, ${Math.floor(seconds/60)} minutes ${seconds%60} seconds`}
    >
      <View style={styles.durationChip}>
        <Text style={styles.durationDot}>•</Text>
        <Text style={styles.durationLabel}>{label}</Text>
        <Text style={styles.durationTime}>{mmss(seconds)}</Text>
      </View>
    </View>
  );

  const renderActiveSet = () => {
    return (
      <>
        {/* HEADER - Title + Subheader pills grouped */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>
            {isMaxTestDay ? 'MAX TEST DAY' : workoutType}
          </Text>

          {/* Subheader row = two matching pills */}
          <View style={styles.subheaderRow}>
            {!isMaxTestDay ? (
              <View style={styles.setPill}>
                <Text style={styles.setPillText}>SET {currentSet} OF {totalSets}</Text>
              </View>
            ) : (
              <View style={styles.setPill}>
                <Text style={styles.setPillText}>MAX TEST</Text>
              </View>
            )}
            
            <View style={styles.pill}>
              <Text style={styles.pillTextDim}>• WORKOUT</Text>
              <Text style={styles.pillText}>{mmss(workoutDuration)}</Text>
            </View>
          </View>
        </View>

        {/* CONTROL - Corner bracket counter with micro-label */}
        <View style={styles.controlSection}>
          <View style={styles.kpiRow}>
            <TouchableOpacity 
              style={styles.stepCircle} 
              onPress={() => setCurrentReps(Math.max(0, currentReps - 1))}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.stepGlyph, { marginTop: 1 }]}>−</Text>
            </TouchableOpacity>
            
            <View style={styles.repContainer}>
              {/* Expanded corner brackets */}
              <View style={[styles.cornerBracket, styles.topLeft]} />
              <View style={[styles.cornerBracket, styles.topRight]} />
              <View style={[styles.cornerBracket, styles.bottomLeft]} />
              <View style={[styles.cornerBracket, styles.bottomRight]} />
              
              
              {/* Large rep number with pulse and flicker animation */}
              <Animated.Text style={[
                styles.repTarget, 
                { 
                  opacity: flickerAnim,
                  // transform removed - no pulse animation
                }
              ]}>
                {String(currentReps).padStart(2, '0')}
              </Animated.Text>
              
              {/* Bottom-center bridge micro-label */}
              {!isMaxTestDay && (
                <View style={styles.bridge}>
                  <Text style={styles.bridgeText}>
                    TARGET: {targetRepsArr[currentSet - 1]}
                  </Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.stepCircle} 
              onPress={() => setCurrentReps(currentReps + 1)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.stepGlyph}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <NeonBarButton
            title={isMaxTestDay ? "COMPLETE MAX TEST" : "SMOKED HER"}
            onPress={handleCompleteSet}
            colors={{
              primary: tokens.brand.primary,
              secondary: tokens.brand.secondary
            }}
            height={52}
          />
        </View>
      </>
    );
  };

  const renderResting = () => {
    // Format timer as M:SS
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    // Map data for SetBreakdownCompactGrid
    const data = targetRepsArr.map((v, i) => ({
      k: `S${i+1}`,
      v,
      next: (i + 1) === currentSet
    }));

    return (
      <>
        {/* HEADER - Matches Active state structure exactly */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>REST TIME</Text>
          <View style={styles.subheaderRow}>
            <View style={styles.setPill}>
              <Text style={styles.setPillText}>SET {currentSet} OF {totalSets}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillTextDim}>• WORKOUT</Text>
              <Text style={styles.pillText}>{mmss(workoutDuration)}</Text>
            </View>
          </View>
        </View>

        {/* CONTROL SECTION - Twin of Active but with timer */}
        <View style={styles.controlSection}>
          <View style={styles.restTimerContainer}>
            {/* Corner brackets - wider for timer */}
            <View style={[styles.cornerBracket, styles.topLeft]} />
            <View style={[styles.cornerBracket, styles.topRight]} />
            <View style={[styles.cornerBracket, styles.bottomLeft]} />
            <View style={[styles.cornerBracket, styles.bottomRight]} />


            {/* Timer display - styled like rep number */}
            <Text style={styles.restTimerText}>{formatTime(restTimeLeft)}</Text>

            {/* Skip button in bridge position */}
            <TouchableOpacity
              style={[styles.bridge, styles.skipBridge]}
              onPress={handleSkipRest}
              hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
            >
              <Text style={styles.bridgeText}>SKIP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Set Breakdown Grid - keep as is */}
        <SetBreakdownCompactGrid data={data} />

        {/* Motivational Quote - keep as is */}
        <View style={{ marginTop: 12 }}>
          <QuoteChipMeasured
            text={currentQuote || 'Rest today, conquer tomorrow!'}
            style={{ alignSelf: 'center' }}
          />
        </View>

        {/* NO MORE "NEXT SET" BUTTON - Skip is in bridge position now */}
      </>
    );
  }

  // InfoChip helper component
  const InfoChip = ({ label, value }) => (
    <View style={styles.infoChip}>
      <Text style={styles.infoChipLabel}>{label}</Text>
      <Text style={styles.infoChipValue}>{value}</Text>
    </View>
  );

  // Function to render MAX TEST completion summary with PREMIUM components
  const renderMaxTestSummary = () => {
    // Use local completed reps as the new max
    const newMax = repsCompleted.reduce((a, b) => a + b, 0);
    const previousMax = previousMaxData.max;
    const previousDate = previousMaxData.date;
    const isFirstEver = previousMax === null;
    const delta = isFirstEver ? 0 : newMax - previousMax;
    const isPR = !isFirstEver && newMax > previousMax;
    const isTied = !isFirstEver && newMax === previousMax;

    return (
      <>
        {/* Header & Subheader */}
        <View style={[styles.headerRow, styles.summaryHeaderRow]}>
          <Text style={styles.workoutCompleteTitle}>MAX TEST COMPLETE</Text>
        </View>

        <View style={[styles.subHeaderRow, styles.summarySubHeaderRow]}>
          <Text style={styles.summaryPatternLabel}>MAX TEST</Text>
          <DurationChip label="WORKOUT" seconds={workoutDuration} />
        </View>

        {/* PREMIUM MAX TEST Result Card with NeonGlowFrame */}
        <NeonGlowFrame
          borderRadius={tokens.radius.lg}
          padding={tokens.spacing.sm}
          intensity={0.7} // Higher intensity for achievement moments
          style={{ marginTop: tokens.spacing.md }}
        >
          <LinearGradient
            colors={tokens.component.neonCard.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumResultCard}
          >
            {/* PREMIUM Number Display with NeonNumber */}
            <View style={styles.premiumNumberSection}>
              <NeonNumber
                value={newMax}
                label="NEW MAX"
                fontSize={100}
                showAnimation={true}
                glowIntensity={0.5}
              />
            </View>

            {/* Achievement Badge Section */}
            <View style={styles.premiumBadgeSection}>
              {previousMaxData.loading ? (
                <Text style={styles.maxTestLoadingText}>CALCULATING...</Text>
              ) : isFirstEver ? (
                <NeonBadge
                  text="BASELINE ESTABLISHED"
                  variant="baseline"
                  showIcon={true}
                  iconType="sunglasses"
                  tilt={-1.5}
                />
              ) : isPR ? (
                <NeonBadge
                  text="NEW PERSONAL RECORD"
                  variant="pr"
                  showIcon={true}
                  iconType="martini"
                  tilt={2}
                />
              ) : isTied ? (
                <NeonBadge
                  text="TIED PERSONAL RECORD"
                  variant="tied"
                  showIcon={true}
                  iconType="sunglasses"
                  tilt={-1}
                />
              ) : (
                /* Show previous max info for regression */
                <View style={styles.premiumPreviousInfo}>
                  <Text style={styles.maxTestPreviousText}>PREVIOUS: {previousMax}</Text>
                  {previousDate && (
                    <Text style={styles.maxTestDateText}>
                      DATE: {new Date(previousDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              )}
            </View>

          </LinearGradient>
        </NeonGlowFrame>

        {/* Quote */}
        <View style={{ marginTop: tokens.spacing.lg }}>
          <QuoteChipMeasured text={currentQuote || "You showed up. That's what counts."} />
        </View>

        {/* CTA - CRITICAL: TIME 2 PARTY button commits to Supabase */}
        <View style={{ marginTop: 12, marginBottom: 20 }}>
          <NeonBarButton
            title="TIME 2 PARTY"
            onPress={handleMaxTestCommit}
            colors={{ primary: tokens.brand.primary, secondary: tokens.brand.secondary }}
            height={52}
            iconComponent={Cheers}
          />
        </View>

        {/* Miami Vice Neon Snowfall Celebration */}
        <NeonSnowfall count={18} />
      </>
    );
  };

  const renderSummary = () => {
    const total = repsCompleted.reduce((a, b) => a + b, 0);
    const best = repsCompleted.length ? Math.max(...repsCompleted) : 0;
    const avg = repsCompleted.length ? Math.round(total / repsCompleted.length) : 0;

    // Derive pattern label from workout data
    const patternLabel = getPatternLabel(pattern, isMaxTestDay);

    return (
      <>
        {/* Header & Subheader (same layout as Active/Rest) */}
        <View style={[styles.headerRow, styles.summaryHeaderRow]}>
          <Text style={styles.workoutCompleteTitle}>WORKOUT COMPLETE</Text>
        </View>

        <View style={[styles.subHeaderRow, styles.summarySubHeaderRow]}>
          {/* left: pattern label replaces "SET X OF Y" */}
          <Text style={styles.summaryPatternLabel}>{patternLabel}</Text>
          {/* right: same duration chip you use on Active/Rest */}
          <DurationChip label="WORKOUT" seconds={workoutDuration} />
        </View>

        {/* ONE ResultCard */}
        <View style={[styles.resultCardShadow, { shadowColor: tokens.border.primary }]}>
          <LinearGradient
            colors={tokens.component.neonCard.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.resultCard}
          >
            {/* Hero row */}
            <View style={styles.resultTopRow}>
              <View style={styles.heroCol}>
                <Text style={styles.heroTotal}>{total}</Text>
                <Text style={styles.heroLabel}>TOTAL REPS</Text>
              </View>

              <View style={styles.statsChips}>
                <InfoChip label="BEST" value={best} />
                <InfoChip label="AVG" value={avg} />
                {!isMaxTestDay && <InfoChip label="TARGET" value={calculatedTargetReps} />}
              </View>
            </View>

            <View style={styles.hairline} />

            {/* 4×2 actual reps grid (no internal total row) */}
            <SetBreakdownCompactGrid
              data={repsCompleted.map((v, i) => ({ k: `S${i + 1}`, v: String(v ?? 0) }))}
              showTotal={false}
              headerText="SETS COMPLETED"
            />
          </LinearGradient>
        </View>

        {/* Quote */}
        <View style={{ marginTop: 12 }}>
          <QuoteChipMeasured text={currentQuote || "You showed up. That's what counts."} />
        </View>

        {/* CTA */}
        <View style={{ marginTop: 12, marginBottom: 20 }}>
          <NeonBarButton
            title="TIME 2 PARTY"
            onPress={isMaxTestDay ? handleMaxTestCommit : handleFinishWorkout}
            colors={{ primary: tokens.brand.primary, secondary: tokens.brand.secondary }}
            height={52}
            iconComponent={Cheers}
          />
        </View>

        {/* Miami Vice Neon Snowfall Celebration */}
        <NeonSnowfall count={18} />
      </>
    );
  };

  return (
    <BackgroundContainer>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.container}>
          {pageState === 'active_set' && renderActiveSet()}
          {pageState === 'resting' && renderResting()}
          {pageState === 'summary' && (isMaxTestDay ? renderMaxTestSummary() : renderSummary())}

          <View style={{ marginTop: 60 }}> 
            <NeonBarButton 
              title="← BACK TO DASHBOARD" 
              onPress={handleBackToDashboard}
              colors={{ 
                primary: 'transparent', 
                secondary: tokens.brand.secondary,
                text: tokens.text.primary
              }}
              style={[styles.backButton, { opacity: 0.7 }]}
              height={48}
              showIcon={false}
            />
          </View>
        </View>
      </ScrollView>

      {/* 🎯 KISS MARK OVERLAY - Shows on button press */}
      <AnimatedKissMark
        visible={showKissMark}
        onComplete={() => setShowKissMark(false)}
        color={tokens.brand.secondary}  // Cyan
        size={140}  // Large for impact
        glow={false}  // No blue circle, just kiss mark
      />
    </BackgroundContainer>
  )
}

// Systematic spacing scale
const SP = { xs: 6, s: 10, m: 14, l: 24, xl: 32, xxl: 36 };

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 100,          // shift everything down more
    paddingBottom: SP.xl,     // breathing room above bottom bar
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 8,
    width: '100%',
  },
  title: {
    ...textStyles.pageTitle,
    textAlign: 'left',
    marginBottom: 0,
  },
  subtitle: {
    ...textStyles.infoLabel,
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 4,
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: tokens.component.neonCard.background[0] + 'A6', // 65% opacity to match countdown timer
    borderWidth: 1,
    borderColor: tokens.brand.secondary,
  },
  durationDot: {
    color: tokens.brand.secondary,
    marginRight: 6,
    fontSize: 12,
  },
  durationLabel: {
    color: tokens.brand.secondary,
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 10,
    marginRight: 6,
    letterSpacing: 1,
  },
  durationTime: {
    color: tokens.text.primary,
    fontFamily: 'Orbitron_700Bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  // Removed old durationText - now using duration chip in header
  durationSummary: {
    ...textStyles.infoLabel,
    color: colors.neonYellow,
    marginTop: 16,
    textAlign: 'center',
    textShadowColor: colors.neonYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    fontSize: 18,
  },
  actionCard: {
    marginVertical: 16,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  setLabel: {
    ...textStyles.infoLabel,
    marginBottom: 24,
    textAlign: 'center',
  },
  repInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
  },
  stepperText: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.electricCyan,
    opacity: 0.8,
    textShadowColor: colors.electricCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  repTarget: {
    ...textStyles.heroNumber,
    fontSize: 84,
    minWidth: 140,
    textAlign: 'center',
    marginTop: 78,                       // push down to align center of number with +/- buttons
    marginBottom: 16,
  },
  repsLabel: {
    ...textStyles.infoLabel,
    color: colors.electricCyan,
    marginBottom: 24,
  },
  // Removed old timerText style - now using NeonCountdown component
  progressBar: {
    width: 240,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.electricCyan,
    borderRadius: 4,
    shadowColor: colors.electricCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  celebrationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  celebrationIcon: {
    marginRight: 12,
  },
  actionButton: {
    marginVertical: 24,
  },
  backButton: {
    marginTop: 32, // Increased spacing from START NEXT SET button
    marginBottom: 24,
  },
  // PAGE LAYOUT
  page: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    justifyContent: 'flex-start', // Key: no center packing
  },

  // HEADER SECTION
  headerSection: { 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 16 
  },
  subtitle: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 14,
    letterSpacing: 1,
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: tokens.brand.secondary,
    backgroundColor: 'rgba(0,0,0,0.22)',
    shadowColor: tokens.brand.secondary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  durationDot: { 
    color: tokens.brand.secondary, 
    marginRight: 2 
  },
  durationLabel: { 
    fontFamily: 'IBMPlexMono_700Bold', 
    fontSize: 11, 
    letterSpacing: 1.2, 
    color: tokens.text.secondary 
  },
  durationTime: { 
    fontFamily: 'IBMPlexMono_700Bold', 
    fontSize: 11, 
    letterSpacing: 1.2, 
    color: tokens.text.primary 
  },

  // CONTROL SECTION
  controlSection: { 
    alignItems: 'center', 
    gap: 10, 
    marginTop: 12, 
    marginBottom: 26 // 26px breathing room before CTA
  },
  targetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: tokens.brand.secondary,
    backgroundColor: 'rgba(0,0,0,0.22)',
    shadowColor: tokens.brand.secondary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  targetChipText: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 12,
    letterSpacing: 1.1,
    color: '#ffffff', // Plain white as requested
  },
  kpiRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12 
  },
  repRing: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: tokens.brand.secondary,
    backgroundColor: 'rgba(0,0,0,0.14)',
    shadowColor: tokens.brand.secondary,
    shadowOpacity: 0.40,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    position: 'relative',
  },
  repRingInnerStroke: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 57,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    pointerEvents: 'none',
  },
  stepCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.25,
    borderColor: tokens.brand.secondary,
    backgroundColor: 'rgba(0,0,0,0.18)',
    shadowColor: tokens.brand.secondary,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  stepLeft: { marginRight: -6 }, // Subtle overlap toward ring
  stepRight: { marginLeft: -6 },
  stepGlyph: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 20,
    color: tokens.text.primary,
    textShadowColor: tokens.brand.secondary,
    textShadowRadius: 5,
    textShadowOffset: { width: 0, height: 0 },
  },

  // CTA SECTION
  ctaSection: { gap: 12 },
  circleGlyph: {
    fontFamily: 'IBMPlexMono_700Bold', 
    fontSize: 26, 
    fontWeight: '700',
    color: tokens.text.primary,
    textShadowColor: tokens.brand.secondary, 
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 0 },
  },
  quote: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  quoteText: {
    ...textStyles.quote,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  quoteAuthor: {
    ...textStyles.quoteAuthor,
  },
  // HEADER
  headerSection: { 
    alignItems: 'center', 
    gap: SP.xs, 
    marginBottom: SP.m 
  },
  
  // Subheader as two matching pills
  subheaderRow: { 
    flexDirection: 'row', 
    gap: SP.xs,               // smaller gap to move pills closer
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  pill: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
    paddingHorizontal: 12, 
    paddingVertical: 6,
    borderRadius: 999, 
    borderWidth: 1, 
    borderColor: tokens.brand.secondary,
    backgroundColor: 'rgba(0,0,0,0.22)',
    shadowColor: tokens.brand.secondary, 
    shadowOpacity: 0.25, 
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  pillTextDim: { 
    fontFamily: 'IBMPlexMono_700Bold', 
    fontSize: 11, 
    letterSpacing: 1.2, 
    color: tokens.text.secondary 
  },
  pillText: { 
    fontFamily: 'IBMPlexMono_700Bold', 
    fontSize: 11, 
    letterSpacing: 1.2, 
    color: tokens.text.primary 
  },

  // SET PILL - Just bold white text, no border/glow
  setPill: {
    paddingHorizontal: 12, 
    paddingVertical: 6,
  },
  setPillText: { 
    fontFamily: 'IBMPlexMono_700Bold', 
    fontSize: 12,                     // increased from 11px
    letterSpacing: 1.2, 
    color: tokens.text.primary,        // bold white text
    fontWeight: '700',
  },

  // CONTROL BLOCK
  controlSection: { 
    alignItems: 'center', 
    marginTop: 52,            // maximum breathing room after subheader
    marginBottom: SP.xxl, 
  },

  kpiRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',     // spread buttons apart
    paddingHorizontal: 15,               // even closer to screen edges
    width: '100%',
  },

  repContainer: {
    width: 260,                          
    height: 200,                         // increased for square bracket formation
    alignItems: 'center', 
    justifyContent: 'flex-start',        // don't center - let me position the number manually
    position: 'relative',
  },
  
  // Clean corner brackets - elegant, not obnoxious
  cornerBracket: {
    position: 'absolute',
    width: 30,                           // back to reasonable size
    height: 30,                          // back to reasonable size
    borderColor: tokens.brand.secondary,
    borderWidth: 2,                      // back to original thickness
    shadowColor: tokens.brand.secondary,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  topLeft: {
    top: 8,                              // more vertical space between brackets
    left: 16,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 8,
    right: 16,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 8,                           // more vertical space between brackets
    left: 16,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 8,
    right: 16,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },

  // Pink radial halo container
  radialWrap: {
    position: 'absolute',
    top: -15,                            // move UP to align with number center  
    left: -20,                           // center the 300px glow in 260px container
    width: 300,
    height: 300,
    opacity: 0.9,
  },

  // Pink glow fallback behind number
  numGlow: {
    position: 'absolute',
    top: 65,                             // calculated: container center (100) - number half-height (50) + fine-tune
    left: 0,
    right: 0,
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 100,                       // smaller to match main number
    lineHeight: 100,
    color: '#FF2CA3',                    // hot pink
    opacity: 0.6,
    fontWeight: '900',
    textShadowColor: '#FF2CA3',
    textShadowRadius: 24,                // adjusted for smaller size
    textShadowOffset: { width: 0, height: 0 },
    textAlign: 'center',                 // ensure perfect centering
  },

  repTarget: {
    position: 'absolute',
    top: 65,                             // calculated: container center (100) - number half-height (50) + fine-tune
    left: 0,
    right: 0,
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 100,                       // smaller for better proportion
    lineHeight: 100,
    color: tokens.text.primary,          // white number on top
    fontWeight: '900',
    textShadowColor: tokens.brand.secondary,
    textShadowRadius: 10,                // adjusted for smaller size
    textShadowOffset: { width: 0, height: 0 },
    textAlign: 'center',                 // ensure perfect centering
  },

  // BRIDGE DIRECTLY UNDER NUMBER
  bridge: {
    position: 'absolute',
    bottom: 30,                          // Fixed distance from bottom of container
    alignSelf: 'center',
    paddingHorizontal: 8,
    height: 18,
    borderWidth: 1,
    borderRadius: 9,
    borderColor: tokens.brand.secondary,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    shadowColor: tokens.brand.secondary,
    shadowOpacity: 0.75,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  bridgeText: {
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: 'IBMPlexMono_700Bold',
    fontWeight: '800',
    color: '#EAFBFF',
  },

  stepCircle: {
    width: 46, 
    height: 46, 
    borderRadius: 23,
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1.25, 
    borderColor: tokens.brand.secondary,
    backgroundColor: 'rgba(0,0,0,0.18)',
    shadowColor: tokens.brand.secondary, 
    shadowOpacity: 0.28, 
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  stepGlyph: {
    fontFamily: 'IBMPlexMono_700Bold', 
    fontSize: 20,
    color: tokens.text.primary, 
    textShadowColor: tokens.brand.secondary, 
    textShadowRadius: 5,
    textShadowOffset: { width: 0, height: 0 },  // ensure consistent shadow positioning
  },

  // CTA block: space from control, tidy stack
  ctaSection: { 
    marginBottom: 52          // matching spacing before back button
  },

  // Old set grid styles removed - now using SetBreakdownCompactGrid component
  setLabel: {
    ...textStyles.infoLabel,
    marginBottom: 24,
    textAlign: 'center',
  },

  // REST Timer Container - wider than repContainer to fit timer text
  restTimerContainer: {
    width: 320,  // Wider than repContainer (260) to accommodate "1:45" format
    height: 200, // Same height as repContainer
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },

  // REST Timer Text - styled like rep number but optimized for time format
  restTimerText: {
    position: 'absolute',
    top: 65,
    left: 0,
    right: 0,
    fontFamily: 'IBMPlexMono_700Bold',  // Same font as Active state
    fontSize: 90,  // Slightly smaller than reps (100) since "1:45" is wider
    lineHeight: 90,
    color: tokens.text.primary,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: tokens.brand.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 2,
  },

  // Skip Bridge - enhanced version of bridge with subtle background
  skipBridge: {
    backgroundColor: 'rgba(0, 230, 255, 0.15)', // Subtle cyan background
    borderWidth: 1,
    borderColor: tokens.brand.secondary,
    borderRadius: 8,
  },

  // Removed quoteTextDirect - now using QuoteChipMeasured component

  // New styles for completion state - ResultCard approach
  resultCardShadow: {
    borderRadius: 18,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  resultCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: tokens.border.primary,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  resultTopRow: {
    flexDirection: 'row',
    alignItems: 'center', // Changed from flex-end to center for horizontal alignment
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  heroCol: {
    flexDirection: 'row', // Horizontal layout to place label next to number
    alignItems: 'center' // Center-align to match middle of the number
  },
  heroTotal: {
    ...textStyles.heroNumber,
    fontSize: 44,
    // Let React Native auto-calculate lineHeight for natural text flow
  },
  heroLabel: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 12, // Space between number and label
  },
  statsChips: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  hairline: {
    height: 1,
    opacity: 0.25,
    backgroundColor: tokens.border.primary,
    marginVertical: 8
  },
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  subMeta: {
    ...textStyles.infoLabel
  },

  // Summary-specific styles
  summaryHeaderRow: {
    justifyContent: 'center', // Override space-between to actually center the title
  },
  workoutCompleteTitle: {
    ...textStyles.pageTitle,
    fontSize: 28, // Reduced from 32 to prevent wrapping
    textAlign: 'center', // Center the title
    marginBottom: 0,
  },
  summarySubHeaderRow: {
    justifyContent: 'space-between',
    // Removed paddingHorizontal - doesn't create space between elements
  },
  summaryPatternLabel: {
    ...textStyles.infoLabel,
    color: colors.white, // Override gray with white
    fontWeight: '700', // Make it bold
    marginRight: 10, // Reduced from 16 - bring pattern and duration pill closer
  },

  // InfoChip styles
  infoChip: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  infoChipLabel: {
    ...textStyles.infoLabel,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoChipValue: {
    ...textStyles.heroNumber,
    fontSize: 16,
    color: tokens.border.primary,
  },

  // MAX TEST specific styles - Clean top/bottom layout
  maxTestTopHalf: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  maxTestHeroNumber: {
    ...textStyles.heroNumber,
    fontSize: 48,
    color: colors.electricCyan,
  },
  maxTestHeroLabel: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 14,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  maxTestDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  maxTestBottomHalf: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  maxTestPreviousText: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 12,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  maxTestDateText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 10,
    color: colors.mediumGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  maxTestBaselineText: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 12,
    color: colors.electricCyan,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  maxTestLoadingText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 10,
    color: colors.electricCyan,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // PREMIUM Max Test Completion Styles
  premiumResultCard: {
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.border.primary,
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.md,
    minHeight: 200,
  },
  premiumNumberSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.md,
    flex: 1,
  },
  premiumBadgeSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.md,
    minHeight: 60,
  },
  premiumPreviousInfo: {
    alignItems: 'center',
  },
})

