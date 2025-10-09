import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/typography';
import { tokens, palette } from '../theme/tokens';

/**
 * MaxTestChart - Clean Miami Vice styled chart for pull-up progression
 * Fallback version that works in Expo Go and web
 * props.maxTestHistory = [{ test_number: 1, pullups: 12, date: "Jul 16, 2025" }, ...]
 */
export default function MaxTestChart({ maxTestHistory = [] }) {
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Empty state
  if (!maxTestHistory.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          🎯 Complete your first max test{'\n'}to see your progress!
        </Text>
        <Text style={styles.emptySubtext}>
          Your journey to 69 pull-ups starts here
        </Text>
      </View>
    );
  }

  const actualMax = Math.max(...maxTestHistory.map(t => t.pullups));
  const actualMin = Math.min(...maxTestHistory.map(t => t.pullups));

  // Smart Y-axis scaling: min is always 0, smart max scaling with clean intervals
  const minReps = 0;
  let maxReps;

  if (actualMax <= 34) { // Less than halfway to 69
    // Round to nearest multiple of 12 for clean ticks
    const targetMax = Math.max(actualMax * 2, actualMax + 8);
    maxReps = Math.ceil(targetMax / 12) * 12;
  } else {
    // Use a scale that shows progress toward 69
    maxReps = 69;
  }

  const range = maxReps - minReps;

  // Calculate clean tick intervals
  const getYAxisTicks = () => {
    if (maxReps <= 24) {
      return [maxReps, Math.round(maxReps / 2), 0];
    } else if (maxReps <= 48) {
      return [maxReps, 24, 0];
    } else {
      return [maxReps, 48, 24, 0];
    }
  };

  return (
    <View style={styles.container}>
      {/* Chart Area */}
      <View style={styles.chartArea}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          {getYAxisTicks().map((value, index) => (
            <Text key={index} style={styles.yAxisLabel}>{value}</Text>
          ))}
        </View>

        {/* Chart content */}
        <View style={styles.chartContent}>
          {/* Grid lines */}
          <View style={styles.gridContainer}>
            {getYAxisTicks().map((_, i) => (
              <View key={i} style={styles.gridLine} />
            ))}
          </View>

          {/* Line and dots */}
          <View style={styles.lineContainer}>
            {/* Connect points with lines */}
            {maxTestHistory.map((point, index) => {
              if (index === maxTestHistory.length - 1) return null;

              const currentY = ((maxReps - point.pullups) / range) * 120;
              const nextY = ((maxReps - maxTestHistory[index + 1].pullups) / range) * 120;
              // Fix: Use even spacing regardless of array length
              const currentX = maxTestHistory.length === 1 ? 100 : (index / (maxTestHistory.length - 1)) * 200;
              const nextX = maxTestHistory.length === 1 ? 100 : ((index + 1) / (maxTestHistory.length - 1)) * 200;

              const angle = Math.atan2(nextY - currentY, nextX - currentX) * 180 / Math.PI;
              const length = Math.sqrt(Math.pow(nextX - currentX, 2) + Math.pow(nextY - currentY, 2));

              return (
                <View key={index}>
                  {/* Glow line */}
                  <View
                    style={[
                      styles.glowLine,
                      {
                        left: currentX,
                        top: currentY,
                        width: length,
                        transform: [{ rotate: `${angle}deg` }],
                      }
                    ]}
                  />
                  {/* Main line */}
                  <View
                    style={[
                      styles.mainLine,
                      {
                        left: currentX,
                        top: currentY,
                        width: length,
                        transform: [{ rotate: `${angle}deg` }],
                      }
                    ]}
                  />
                </View>
              );
            })}

            {/* Data points */}
            {maxTestHistory.map((point, index) => {
              const y = ((maxReps - point.pullups) / range) * 120;
              // Fix: Center single point, otherwise use even spacing
              const x = maxTestHistory.length === 1 ? 100 : (index / (maxTestHistory.length - 1)) * 200;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.pointContainer,
                    { left: x - 12, top: y - 12 }
                  ]}
                  onPress={() => setSelectedPoint(selectedPoint === index ? null : index)}
                >
                  {/* Glow dot */}
                  <View style={styles.glowDot} />
                  {/* Main dot */}
                  <View style={styles.mainDot} />

                  {/* Tooltip */}
                  {selectedPoint === index && (
                    <View style={styles.tooltip}>
                      <Text style={styles.tooltipDate}>{point.date}</Text>
                      <Text style={styles.tooltipReps}>{point.pullups} reps</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* X-axis */}
      <View style={styles.xAxis}>
        {maxTestHistory.map((point, index) => {
          // Match the exact positioning logic from the dots
          const x = maxTestHistory.length === 1 ? 100 : (index / (maxTestHistory.length - 1)) * 200;

          return (
            <Text
              key={index}
              style={[
                styles.xAxisLabel,
                {
                  position: 'absolute',
                  left: x - 10, // Center the text (roughly 20px wide text, so -10px offset)
                }
              ]}
            >
              #{point.test_number}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginVertical: 16,
  },
  emptyContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 16,
    color: colors.hotPink,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.6,
  },
  chartArea: {
    flexDirection: 'row',
    height: 150,
    marginHorizontal: 16,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
  },
  chartContent: {
    flex: 1,
    position: 'relative',
    marginLeft: 8,
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 200,
    height: 120,
  },
  glowLine: {
    position: 'absolute',
    height: 8,
    backgroundColor: colors.hotPink,
    opacity: 0.18,
    transformOrigin: '0 50%',
  },
  mainLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: colors.hotPink,
    transformOrigin: '0 50%',
  },
  pointContainer: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.electricCyan,
    opacity: 0.2,
  },
  mainDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.electricCyan,
  },
  tooltip: {
    position: 'absolute',
    top: -60,
    left: -45,
    backgroundColor: tokens.component.glassPanel.background,
    borderColor: '#00FFFF',
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 90,
    shadowColor: '#00FFFF',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  tooltipDate: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 10,
    color: palette.warmWhite,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 2,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  tooltipReps: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 14,
    color: '#FFA94D',
    textAlign: 'center',
    textShadowColor: '#FFA94D',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  xAxis: {
    position: 'relative',
    height: 20,
    marginTop: 8,
    marginHorizontal: 64, // Match the chart content margins
  },
  xAxisLabel: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
  },
});