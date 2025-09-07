import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TreePalm } from 'phosphor-react-native';
import { colors } from '../theme/typography';

const WorkoutProgressTracker = ({ currentWorkoutNum = 1, workoutType = 'MAX TEST', totalWorkouts = 8 }) => {
  // Handle edge cases
  const safeCurrentWorkout = Math.max(1, Math.min(currentWorkoutNum, totalWorkouts));
  
  // Format workout type to prevent wrapping
  const formatWorkoutType = (type) => {
    const typeMap = {
      'REVERSE_PYRAMID': 'REV PYRAMID',
      'EQUAL_SETS': 'EQUAL',
      // Keep others as-is: PYRAMID, MAX TEST, etc.
    };
    return typeMap[type] || type;
  };

  const getPalmTreeProps = (treeIndex) => {
    const workoutPosition = treeIndex + 1; // Convert 0-based index to 1-based workout number
    
    if (workoutPosition < safeCurrentWorkout) {
      // Completed workouts - bright cyan
      return {
        color: colors.electricCyan,
        weight: 'fill',
        style: styles.completedPalm
      };
    } else if (workoutPosition === safeCurrentWorkout) {
      // Current workout - hot pink
      return {
        color: colors.hotPink,
        weight: 'fill', 
        style: styles.currentPalm
      };
    } else {
      // Upcoming workouts - hot pink outline for better visibility
      return {
        color: colors.hotPink,
        weight: 'regular',
        style: styles.upcomingPalm
      };
    }
  };

  const formattedWorkoutType = formatWorkoutType(workoutType);

  return (
    <View style={styles.container}>
      {/* Palm Tree Progress Row */}
      <View style={styles.palmTreeRow}>
        {Array.from({ length: totalWorkouts }, (_, index) => {
          const palmProps = getPalmTreeProps(index);
          return (
            <TreePalm
              key={index}
              size={30}
              color={palmProps.color}
              weight={palmProps.weight}
              style={[styles.palmTree, palmProps.style]}
            />
          );
        })}
      </View>

      {/* Workout Info Text */}
      <Text
        style={styles.workoutInfo}
        accessible
        accessibilityLabel={`Today's workout ${formattedWorkoutType}, ${safeCurrentWorkout} of ${totalWorkouts}`}
      >
        {"TODAY'S WORKOUT "}
        <Text style={{ color: colors.electricCyan }}>
          [{safeCurrentWorkout}/{totalWorkouts}]
        </Text>
        {`: ${formattedWorkoutType}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    alignSelf: 'stretch',   // allow full-width inside parent
  },
  palmTreeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 24,        // narrower than cards to align with text edges
  },
  palmTree: {
    // Base palm tree styling
  },
  completedPalm: {
    // Subtle glow for completed workouts
    textShadowColor: colors.electricCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  currentPalm: {
    // More prominent glow for current workout
    textShadowColor: colors.hotPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  upcomingPalm: {
    opacity: 0.7, // More visible than before but still "upcoming"
  },
  workoutInfo: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    // Subtle glow matching current workout color
    textShadowColor: colors.hotPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});

export default WorkoutProgressTracker;