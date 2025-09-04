import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, AppState } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import BackgroundContainer from '../components/BackgroundContainer'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'
import NeonIcon from '../components/NeonIcon'
import { colors, textStyles } from '../theme/typography'
import { getQuoteWithAuthor, getQuote } from '../utils/quotes'
import { supabase } from '../lib/supabase';

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
  const [restTimeLeft, setRestTimeLeft] = useState(120); // 120 seconds rest (2:00 minutes)
  const [workoutDuration, setWorkoutDuration] = useState(0); // Workout duration in seconds
  const [currentQuote, setCurrentQuote] = useState(null);
  
  // References for timers
  const restTimerRef = useRef(null);
  const restEndTimeRef = useRef(null);
  const workoutTimerRef = useRef(null);
  const workoutStartTimeRef = useRef(Date.now());
  const appStateRef = useRef(AppState.currentState);

  // Log route params for debugging (dev only, minimal deps)
  useEffect(() => {
    if (__DEV__) console.log('WorkoutScreen params:', { workoutNum, workoutType });
  }, [workoutNum, workoutType]);

  // Initialize workout timer
  useEffect(() => {
    // Store the workout start time
    workoutStartTimeRef.current = Date.now();
    
    // Start workout duration timer that updates every second
    const startWorkoutTimer = () => {
      // Initial calculation of elapsed time
      const elapsedSeconds = Math.floor((Date.now() - workoutStartTimeRef.current) / 1000);
      setWorkoutDuration(elapsedSeconds);
      
      // Set up interval to update every second
      workoutTimerRef.current = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - workoutStartTimeRef.current) / 1000);
        setWorkoutDuration(elapsedSeconds);
      }, 1000);
    };
    
    startWorkoutTimer();
    
    // Handle app state changes
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        
        // Recalculate workout duration based on actual elapsed time
        const elapsedSeconds = Math.floor((Date.now() - workoutStartTimeRef.current) / 1000);
        setWorkoutDuration(elapsedSeconds);
        
        // Check rest timer
        if (pageState === 'resting' && restEndTimeRef.current) {
          // Recalculate rest time left based on end time
          const now = Date.now();
          const timeLeft = Math.max(0, Math.round((restEndTimeRef.current - now) / 1000));
          setRestTimeLeft(timeLeft);
          
          if (timeLeft <= 0) {
            // Rest time is over
            setPageState('active_set');
            clearInterval(restTimerRef.current);
            restTimerRef.current = null;
            restEndTimeRef.current = null;
          }
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
      if (restTimerRef.current) clearInterval(restTimerRef.current);
      subscription.remove();
    };
  }, []);

  // Start rest timer when entering rest state
  useEffect(() => {
    if (pageState === 'resting') {
      // Set an end time for the rest period (2 minutes from now)
      restEndTimeRef.current = Date.now() + (restTimeLeft * 1000);
      
      // Clear any existing timer
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
      
      // Start a new timer that updates every second
      restTimerRef.current = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.round((restEndTimeRef.current - now) / 1000));
        
        setRestTimeLeft(timeLeft);
        
        if (timeLeft <= 0) {
          // Rest time is over
          setPageState('active_set');
          clearInterval(restTimerRef.current);
          restTimerRef.current = null;
          restEndTimeRef.current = null;
        }
      }, 1000);
      
      return () => {
        if (restTimerRef.current) {
          clearInterval(restTimerRef.current);
          restTimerRef.current = null;
        }
      };
    }
  }, [pageState]);

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
      setRestTimeLeft(120) // Reset rest timer to 2:00
      setPageState('resting') // This will trigger the useEffect to start the timer
    } else {
      setPageState('summary')
      // Clear rest timer if it exists
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
    }
  }

  const handleSkipRest = () => {
    // Clear rest timer
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
      restEndTimeRef.current = null;
    }
    setPageState('active_set')
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
    // Navigate to Home only - Dashboard will refresh on focus
    navigation.navigate('Home');
  }

  const handleBackToDashboard = () => {
    // Clear all timers
    if (workoutTimerRef.current) {
      clearInterval(workoutTimerRef.current);
      workoutTimerRef.current = null;
    }
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
    
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

  const renderResting = () => (
    <>
      <Text style={styles.title}>REST TIME</Text>
      <Text style={styles.subtitle}>NEXT UP: SET {currentSet} OF {totalSets}</Text>
      
      {/* Workout Duration Timer */}
      <Text style={styles.durationText}>
        DURATION: {formatTime(workoutDuration)}
      </Text>

      <GlassCard 
        borderColor={colors.electricCyan} 
        glowColor={colors.electricCyan}
        style={styles.actionCard}
      >
        <Text style={styles.setLabel}>TARGET: {targetRepsArr[currentSet - 1]} REPS</Text>
        <Text style={styles.timerText}>
          {Math.floor(restTimeLeft / 60)}:{(restTimeLeft % 60).toString().padStart(2, '0')}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((120 - restTimeLeft) / 120) * 100}%` }
            ]} 
          />
        </View>
        {/* Set breakdown grid */}
        <View style={styles.setGrid}>
          {targetRepsArr.map((reps, idx) => {
            let cellStyle = styles.setCell;
            let labelStyle = styles.setLabel;
            let repsStyle = styles.setReps;
            if (idx < currentSet - 1) {
              // Completed
              cellStyle = [styles.setCell, styles.setCellCompleted];
              labelStyle = [styles.setLabel, styles.setLabelCompleted];
              repsStyle = [styles.setReps, styles.setRepsCompleted];
            } else if (idx === currentSet - 1) {
              // Current
              cellStyle = [styles.setCell, styles.setCellCurrent];
              labelStyle = [styles.setLabel, styles.setLabelCurrent];
              repsStyle = [styles.setReps, styles.setRepsCurrent];
            }
            return (
              <View key={idx} style={cellStyle}>
                <Text style={labelStyle}>S{idx+1}</Text>
                <Text style={repsStyle}>{reps}</Text>
              </View>
            );
          })}
        </View>
      </GlassCard>

      <NeonButton 
        title="SKIP REST" 
        onPress={handleSkipRest}
        variant="secondary"
        style={styles.actionButton}
      />
    </>
  )

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
      <View style={styles.container}>
        {pageState === 'active_set' && renderActiveSet()}
        {pageState === 'resting' && renderResting()}
        {pageState === 'summary' && renderSummary()}

        <NeonButton 
          title="← BACK TO DASHBOARD" 
          onPress={handleBackToDashboard}
          variant="secondary"
          style={styles.backButton}
        />

        {/* Motivational Quote - no card, just neon text */}
        <Text style={styles.quoteTextDirect}>
          {currentQuote ? `"${currentQuote}"` : '"Pain is weakness leaving the body!"'}
        </Text>
      </View>
    </BackgroundContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    ...textStyles.pageTitle,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...textStyles.infoLabel,
    marginBottom: 8,
    textAlign: 'center',
  },
  durationText: {
    ...textStyles.infoLabel,
    color: colors.neonYellow,
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: colors.neonYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
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
  timerText: {
    ...textStyles.heroNumber,
    fontSize: 72,
    color: colors.electricCyan,
    textShadowColor: colors.electricCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
    textAlign: 'center',
    marginVertical: 16,
  },
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
    marginTop: 24,
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
  setGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 24,
    width: '100%',
  },
  setCell: {
    width: '25%', // 4 columns
    alignItems: 'center',
    marginVertical: 8,
  },
  setCellCompleted: {
    opacity: 0.5,
  },
  setCellCurrent: {
    backgroundColor: colors.electricCyan,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  setLabel: {
    ...textStyles.infoLabel,
    fontSize: 12,
    color: colors.electricCyan,
  },
  setLabelCompleted: {
    color: colors.electricCyan,
  },
  setLabelCurrent: {
    color: colors.white,
  },
  setReps: {
    ...textStyles.heroNumber,
    fontSize: 24,
    color: colors.electricCyan,
  },
  setRepsCompleted: {
    color: colors.electricCyan,
  },
  setRepsCurrent: {
    color: colors.white,
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
})