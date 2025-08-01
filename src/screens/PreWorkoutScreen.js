import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BackgroundContainer from '../components/BackgroundContainer';
import GlassCard from '../components/GlassCard';
import NeonButton from '../components/NeonButton';
import { colors, textStyles } from '../theme/typography';
import { getQuote } from '../utils/quotes';

const PreWorkoutScreen = ({ route, navigation }) => {
  // Expecting params: workoutNum, workoutType, pattern, setBreakdown, targetReps, totalWorkouts
  const {
    workoutNum = 2,
    totalWorkouts = 8,
    workoutType = 'PYRAMID',
    pattern = 'PYRAMID',
    setBreakdown = [3,5,6,8,9,11,12,12],
    targetReps = 0,
  } = route.params || {};
  
  // Determine if this is a max test day
  const isMaxTestDay = workoutNum === 1;
  
  // Calculate total reps from setBreakdown if targetReps is not provided and not a max test day
  const calculatedTargetReps = isMaxTestDay ? null : (targetReps || (setBreakdown ? setBreakdown.reduce((a, b) => a + b, 0) : 66));
  const totalSets = isMaxTestDay ? 1 : (setBreakdown ? setBreakdown.length : 8);
  const quote = getQuote('preWorkout');

  const handleStartSession = () => {
    const timerStart = Date.now();
    navigation.replace('Workout', {
      workoutNum,
      totalWorkouts,
      workoutType: isMaxTestDay ? 'MAX TEST' : workoutType,
      pattern: isMaxTestDay ? 'MAX TEST' : pattern,
      setBreakdown: isMaxTestDay ? [0] : setBreakdown, // Just a placeholder for max test
      targetReps: calculatedTargetReps,
      timerStart,
      isMaxTestDay,
    });
  };

  return (
    <BackgroundContainer>
      <View style={styles.container}>
        {/* Workout info - using text shadow only for glow */}
        <Text style={styles.title}>{`WORKOUT (${workoutNum}/${totalWorkouts})`}</Text>
        
        {/* Workout type - using enhanced styling for visual interest */}
        <Text style={styles.workoutTypeText}>
          {isMaxTestDay ? 'MAX TEST DAY' : pattern}
        </Text>
        
        {/* Set breakdown or max test instructions */}
        <GlassCard style={styles.setBreakdownCard} borderColor={colors.electricCyan} glowColor={colors.electricCyan}>
          {isMaxTestDay ? (
            <>
              <Text style={styles.setBreakdownLabel}>MAX TEST INSTRUCTIONS:</Text>
              <Text style={styles.maxTestInstructions}>
                Perform a single set of as many pull-ups as you can with good form.
                This will set your baseline for the next workouts in the cycle.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.setBreakdownLabel}>SET BREAKDOWN:</Text>
              <View style={styles.setGrid}>
                {setBreakdown.map((reps, idx) => (
                  <View key={idx} style={styles.setCell}>
                    <Text style={styles.setLabel}>S{idx+1}</Text>
                    <Text style={styles.setReps}>{reps}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </GlassCard>
        
        {/* Total reps or max test goal */}
        {!isMaxTestDay && (
          <Text style={styles.totalRepsText}>TOTAL REPS: {calculatedTargetReps}</Text>
        )}
        
        {isMaxTestDay && (
          <Text style={styles.totalRepsText}>GOAL: MAXIMUM POSSIBLE REPS</Text>
        )}
        
        {/* Motivational message - no attribution */}
        <Text style={styles.motivation}>{quote ? `"${quote}"` : ''}</Text>
        
        {/* Start button */}
        <NeonButton title="START SESSION" onPress={handleStartSession} variant="primary" style={styles.startButton} />
      </View>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    ...textStyles.pageTitle,
    marginBottom: 16,
    textAlign: 'center',
    color: colors.electricCyan,
    // Enhanced text shadow to ensure glow follows text contours
    textShadowColor: colors.electricCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  workoutTypeText: {
    fontSize: 28, // Increased from 24 to make it more prominent
    fontFamily: 'Orbitron_700Bold',
    color: 'white', // Changed from brightPink to white for better contrast
    marginBottom: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    // Multi-layered text shadow for more visual interest
    textShadowColor: colors.brightPink, // Keep pink glow for visual interest
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    // Additional text shadow layers for a more dynamic effect
    elevation: 3, // Android elevation for additional depth
  },
  setBreakdownCard: {
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    padding: 16,
  },
  setBreakdownLabel: {
    ...textStyles.infoLabel,
    marginBottom: 8,
    textAlign: 'center',
  },
  maxTestInstructions: {
    ...textStyles.bodyText,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  setGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  setCell: {
    alignItems: 'center',
    margin: 6,
    minWidth: 36,
  },
  setLabel: {
    ...textStyles.smallText,
    color: colors.lightGray,
    marginBottom: 2,
  },
  setReps: {
    ...textStyles.heroNumber,
    fontSize: 20,
    color: colors.electricCyan,
  },
  totalRepsText: {
    ...textStyles.accentLabel,
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: colors.neonYellow,
    textShadowColor: colors.neonYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  motivation: {
    ...textStyles.quote,
    marginVertical: 12,
    textAlign: 'center',
    fontSize: 14,
    // Ensure no additional shadow effects
    textShadowRadius: 4,
  },
  startButton: {
    marginTop: 16,
    width: '100%',
    maxWidth: 340,
  },
});

export default PreWorkoutScreen; 