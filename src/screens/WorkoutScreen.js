import React, { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, AppState, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from '@react-navigation/native'
import BackgroundContainer from '../components/BackgroundContainer'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'
import NeonBarButton from '../components/NeonBarButton'
import NeonIcon from '../components/NeonIcon'
import NeonCountdown from '../components/neon/NeonCountdown'
import SetBreakdownCompactGrid from '../components/SetBreakdownCompactGrid'
import WorkoutProgressTracker from '../components/WorkoutProgressTracker'
import QuoteChipMeasured from '../components/QuoteChipMeasured'
import { useReduceMotion } from '../hooks/useReduceMotion'
import { colors, textStyles } from '../theme/typography'
import { tokens } from '../theme/tokens'
import { getQuoteWithAuthor, getQuote } from '../utils/quotes'
import { supabase } from '../lib/supabase';
import { bus } from '../lib/bus';

export default function WorkoutScreen({ navigation, route }) {
  // Accept params from navigation
  const {
    workoutNum = 2,
    totalWorkouts = 8,
    workoutType = 'PYRAMID',
    pattern = 'PYRAMID',
    setBreakdown,
    timerStart = null,
    targetReps = 0,
    isMaxTestDay = false,
  } = route?.params || {};
  
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
  
  // Get reduce motion preference
  const reduceMotion = useReduceMotion();
  
  // References for timers
  const workoutTimerRef = useRef(null);
  const workoutStartTimeRef = useRef(Date.now());
  const appStateRef = useRef(AppState.currentState);
  const REST_DURATION_SEC = 120; // 2 minutes rest

  // Log route params for debugging (dev only, minimal deps)
  useEffect(() => {
    if (__DEV__) console.log('WorkoutScreen params:', { workoutNum, workoutType });
  }, [workoutNum, workoutType]);

  // Update workout duration timer
  const updateWorkoutDuration = useCallback(() => {
    const elapsedSeconds = Math.floor((Date.now() - workoutStartTimeRef.current) / 1000);
    setWorkoutDuration(elapsedSeconds);
  }, []);

  // Start rest period with proper state initialization
  const startRest = useCallback((seconds = REST_DURATION_SEC) => {
    const dl = Date.now() + seconds * 1000;
    setDeadline(dl);
    setRestTimeLeft(seconds);   // Show full duration immediately (not 0!)
    setRestArmed(false);        // Will arm after first recompute tick
    setPageState('resting');    // Render rest UI
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
      
      // Arm after first successful recompute so we know deadline is live
      setRestArmed(true);
    }, 250);
    
    return () => clearInterval(interval);
  }, [deadline]);
  
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
  const handleRestComplete = useCallback(() => {
    if (!restArmed) return; // Prevent premature transitions
    setDeadline(null);
    setRestArmed(false);
    setPageState('active_set');
  }, [restArmed]);

  // Handle rest skip  
  const handleSkipRest = useCallback(() => {
    if (pageState !== 'resting') return;
    setDeadline(null);
    setRestArmed(false);
    setPageState('active_set');
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

  const handleCompleteSet = () => {
    // Add current reps to completed array
    setRepsCompleted(prev => [...prev, currentReps])
    
    if (currentSet < totalSets) {
      setCurrentSet(currentSet + 1)
      setCurrentReps(targetRepsArr[currentSet]) // Set next set's target
      
      // Start rest period using proper function
      startRest(REST_DURATION_SEC);
    } else {
      setPageState('summary')
      setDeadline(null);
      setRestArmed(false);
    }
  }

  const handleFinishWorkout = async () => {
    // Clear workout timer
    if (workoutTimerRef.current) {
      clearInterval(workoutTimerRef.current);
      workoutTimerRef.current = null;
    }
    
    // Calculate final duration based on actual elapsed time
    const finalDurationSeconds = Math.floor((Date.now() - workoutStartTimeRef.current) / 1000);
    
    // Save workout session to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const completedReps = repsCompleted.reduce((a, b) => a + b, 0);
      const durationMinutes = Math.round(finalDurationSeconds / 60);
      
      // Get profile for later use in pre-generation
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_max_pullups, cycle_start_max')
        .eq('id', user.id)
        .single();

      // For max test day, update user's current max
      if (isMaxTestDay) {
        await supabase.from('profiles').update({
          current_max_pullups: completedReps,
          cycle_start_max: completedReps
        }).eq('id', user.id);
      }
      
      await supabase.from('workout_sessions').insert({
        user_id: user.id,
        workout_date: new Date().toISOString(),
        workout_type: isMaxTestDay ? 'max_test' : 'volume',
        target_reps: isMaxTestDay ? null : calculatedTargetReps,
        completed_reps: completedReps,
        sets_data: JSON.stringify(repsCompleted),
        duration_minutes: durationMinutes,
      });
      
      // Use atomic progression via complete_workout RPC
      const { data: nextState, error: progressError } = await supabase
        .rpc('complete_workout');
      
      if (progressError) {
        console.error('❌ Error progressing workout:', progressError);
      } else {
        const newCycle = nextState?.[0]?.cycle_num;
        const newWorkout = nextState?.[0]?.workout_num;
        console.log(`✅ Advanced to cycle ${newCycle}, workout ${newWorkout}`);
        
        // Pre-generate next workout plan and cache it
        try {
          const { generateWorkout } = await import('../utils/workoutApi');
          const nextPlan = await generateWorkout({
            userId: user.id,
            cycleNum: newCycle,
            workoutNum: newWorkout,
            userMax: profile?.current_max_pullups,
            cycleStartMax: profile?.cycle_start_max
          });
          console.log('🎯 Pre-generated next workout plan:', nextPlan.patternName || 'Max Test');
        } catch (pregenError) {
          console.warn('⚠️ Failed to pre-generate next workout:', pregenError);
        }
      }
    }
    
    // Reset WorkoutStack to PreWorkout screen, then navigate to Home
    navigation.reset({
      index: 0,
      routes: [{ name: 'PreWorkout' }]
    });
    navigation.navigate('Home');
    
    // Then emit workout completion event after navigation to avoid updating unmounted component
    setTimeout(() => {
      bus.emit('workout:completed', { at: Date.now() });
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

  const renderActiveSet = () => (
    <>
      <Text style={styles.title}>{isMaxTestDay ? 'MAX TEST DAY' : workoutType}</Text>
      {!isMaxTestDay && <Text style={styles.subtitle}>SET {currentSet} OF {totalSets}</Text>}
      {isMaxTestDay && <Text style={styles.subtitle}>PERFORM YOUR MAXIMUM REPS</Text>}
      
      {/* Workout Duration Timer */}
      <Text style={styles.durationText}>
        DURATION: {formatTime(workoutDuration)}
      </Text>

      {/* Action Card with Rep Input */}
      <GlassCard 
        borderColor={colors.purple} 
        glowColor={colors.purple}
        style={styles.actionCard}
      >
        {isMaxTestDay ? (
          <Text style={styles.setLabel}>ENTER YOUR MAX REPS</Text>
        ) : (
          <Text style={styles.setLabel}>TARGET: {targetRepsArr[currentSet - 1]} REPS</Text>
        )}
        
        {/* Interactive Rep Input - Redesigned Stepper */}
        <View style={styles.repInputContainer}>
          <TouchableOpacity 
            style={styles.stepperButton} 
            onPress={() => setCurrentReps(Math.max(0, currentReps - 1))}
          >
            <Text style={styles.stepperText}>−</Text>
          </TouchableOpacity>
          
          <Text style={styles.repTarget}>{currentReps}</Text>
          
          <TouchableOpacity 
            style={styles.stepperButton} 
            onPress={() => setCurrentReps(currentReps + 1)}
          >
            <Text style={styles.stepperText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.repsLabel}>REPS COMPLETED</Text>
        
        {!isMaxTestDay && (
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentSet - 1) / totalSets) * 100}%` }
              ]} 
            />
          </View>
        )}
      </GlassCard>

      <NeonButton 
        title={isMaxTestDay ? "COMPLETE MAX TEST" : "COMPLETE SET"} 
        onPress={handleCompleteSet}
        variant="primary"
        style={styles.actionButton}
      />
    </>
  )

  const renderResting = () => {
    // Map data for SetBreakdownCompactGrid
    const data = targetRepsArr.map((v, i) => ({ 
      k: `S${i+1}`, 
      v, 
      next: (i + 1) === currentSet 
    }));
    
    return (
      <>
        {/* Header Row with Duration Chip */}
        <View style={[styles.headerRow, { paddingTop: 48 }]}>
          <Text style={styles.title}>REST TIME</Text>
          <View 
            accessible 
            accessibilityRole="text" 
            accessibilityLabel={`Workout duration, ${Math.floor(workoutDuration/60)} minutes ${workoutDuration%60} seconds`}
          >
            <View style={styles.durationChip}>
              <Text style={styles.durationDot}>•</Text>
              <Text style={styles.durationLabel}>WORKOUT</Text>
              <Text style={styles.durationTime}>{mmss(workoutDuration)}</Text>
            </View>
          </View>
        </View>
        

        {/* Neon Countdown Timer - Single Authority */}
        <NeonCountdown
          seconds={restTimeLeft}
          onDone={() => { if (restArmed) handleRestComplete(); }}
          onSkip={() => { if (pageState === 'resting') handleSkipRest(); }}
          reducedMotion={reduceMotion}
          size="lg"
        />

        {/* Set Breakdown Grid - modern 4x2 scoreboard */}
        <SetBreakdownCompactGrid data={data} />

        {/* Motivational Quote - Consistent with other screens */}
        <View style={{ marginTop: 12 }}>
          <QuoteChipMeasured
            text={currentQuote || 'Rest today, conquer tomorrow!'}
            style={{ alignSelf: 'center' }}
          />
        </View>

        {/* Modern Neon Bar Button */}
        <View style={{ marginTop: 12, marginBottom: 20 }}>
          <NeonBarButton 
            title="NEXT SET" 
            onPress={handleSkipRest}
            colors={{ 
              primary: tokens.brand.primary, 
              secondary: tokens.brand.secondary 
            }}
            height={52}
          />
        </View>
      </>
    );
  }

  const renderSummary = () => (
    <>
      <Text style={styles.title}>WORKOUT COMPLETE!</Text>
      <View style={styles.celebrationContainer}>
        <NeonIcon 
          type="celebration" 
          size={32} 
          color={colors.neonYellow}
          style={styles.celebrationIcon}
        />
        <Text style={styles.subtitle}>AMAZING WORK, BEAST!</Text>
      </View>

      <GlassCard 
        borderColor={colors.lightBlue} 
        glowColor={colors.lightBlue}
        style={styles.actionCard}
      >
        {isMaxTestDay ? (
          <>
            <Text style={styles.setLabel}>MAX TEST COMPLETED</Text>
            <Text style={styles.repTarget}>{repsCompleted[0] || 0}</Text>
            <Text style={styles.repsLabel}>YOUR NEW MAX</Text>
          </>
        ) : (
          <>
            <Text style={styles.setLabel}>SETS COMPLETED: {totalSets}</Text>
            <Text style={styles.repTarget}>{repsCompleted.reduce((a, b) => a + b, 0)}</Text>
            <Text style={styles.repsLabel}>TOTAL REPS</Text>
          </>
        )}
        
        {/* Display total workout duration */}
        <Text style={styles.durationSummary}>
          TOTAL TIME: {formatTime(workoutDuration)}
        </Text>
      </GlassCard>

      <NeonButton 
        title="FINISH WORKOUT" 
        onPress={handleFinishWorkout}
        variant="success"
        style={styles.actionButton}
      />
    </>
  )

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
          {pageState === 'summary' && renderSummary()}

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
    </BackgroundContainer>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40, // Extra padding at bottom for scroll
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
    marginVertical: 16,
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
  // Old set grid styles removed - now using SetBreakdownCompactGrid component
  setLabel: {
    ...textStyles.infoLabel,
    marginBottom: 24,
    textAlign: 'center',
  },
  // Removed quoteTextDirect - now using QuoteChipMeasured component
})