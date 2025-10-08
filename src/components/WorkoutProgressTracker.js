import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { TreePalm } from 'phosphor-react-native';
import { colors } from '../theme/typography';
import { tokens } from '../theme/tokens';

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
        color: tokens.component.palm.completed.fill,
        weight: 'fill',
        halo: tokens.component.palm.completed.halo,
        state: 'completed'
      };
    } else if (workoutPosition === safeCurrentWorkout) {
      // Current workout - cotton candy pink (harmonizes with button)
      return {
        color: tokens.component.palm.current.fill,
        weight: 'fill',
        halo: tokens.component.palm.current.halo,
        state: 'current'
      };
    } else {
      // Upcoming workouts - peach-pink outline (dim unlit tube)
      return {
        color: tokens.component.palm.future.stroke,
        weight: 'regular',
        halo: null,
        state: 'future'
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
          const size = 30;

          return (
            <View key={index} style={styles.palmWrapper}>
              {/* Halo layer for cross-platform glow (iOS shadow + Android border) */}
              {palmProps.halo && (
                <View
                  pointerEvents="none"
                  style={[
                    styles.palmHalo,
                    {
                      width: size + 8,
                      height: size + 8,
                      borderRadius: size,
                      shadowColor: palmProps.halo,
                      borderColor: palmProps.halo,
                    }
                  ]}
                />
              )}

              {/* Palm icon */}
              <TreePalm
                size={size}
                color={palmProps.color}
                weight={palmProps.weight}
              />
            </View>
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
  palmWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  palmHalo: {
    position: 'absolute',
    left: -4,
    top: -4,
    // iOS: Use shadow for soft glow
    shadowOpacity: 0.45,   // Softer glow (less "ringy")
    shadowRadius: 5,       // Tighter spread for natural falloff
    shadowOffset: { width: 0, height: 0 },
    // Android: Use border for fake glow (shadows don't render on Android)
    backgroundColor: 'transparent',
    borderWidth: Platform.OS === 'android' ? 2 : 0,  // Only show border on Android
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