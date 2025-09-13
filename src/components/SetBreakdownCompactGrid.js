import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/typography';
import { tokens } from '../theme/tokens';
import { Cigarette } from 'phosphor-react-native';

export default function SetBreakdownCompactGrid({ data, showTotal = true }) {
  const total = data.reduce((sum, x) => sum + Number(x.v || 0), 0);

  return (
    <View style={styles.card} accessibilityRole="summary">
      {/* Header */}
      <View style={styles.header} accessible accessibilityLabel="Set breakdown">
        <Cigarette
          size={28}
          color={colors.electricCyan}
          style={{ marginRight: 12 }}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <Text style={styles.headerText}>SETS COMPLETED</Text>
      </View>

      {/* 4 × 2 scoreboard grid */}
      <View style={styles.grid}>
        {data.map((c, i) => {
          const isRightEdge = i % 4 === 3;
          const isTopRow = i < 4;
          return (
            <View
              key={c.k}
              style={[
                styles.cell,
                c.next && styles.cellNext,
                !isRightEdge && styles.divRight,
                isTopRow && styles.divBottom,
              ]}
              accessible
              accessibilityLabel={`${c.k} ${c.v}`}
            >
              <Text style={styles.k}>{c.k}</Text>
              <Text style={styles.v}>{c.v}</Text>
            </View>
          );
        })}
      </View>

      {/* Footer total - conditionally shown */}
      {showTotal && (
        <View style={styles.total} accessible accessibilityLabel={`Total reps ${total}`}>
          <Text style={styles.totalLabel}>TOTAL REPS</Text>
          <Text style={styles.totalValue}>{total}</Text>
        </View>
      )}
    </View>
  );
}

const GUTTER = 8;

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.component.neonCard.background[0],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.electricCyan,
    padding: 12,
    shadowColor: colors.electricCyan,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 8 
  },
  headerText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginHorizontal: -GUTTER / 2 
  },

  // >>> CHANGED: each cell is 25% width, vertical stack, centered
  cell: {
    width: '25%',
    paddingHorizontal: GUTTER / 2,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // subtle dividers to enforce reading order (L→R, top row then bottom row)
  divRight: { 
    borderRightWidth: StyleSheet.hairlineWidth, 
    borderRightColor: 'rgba(0,213,255,0.18)' 
  },
  divBottom: { 
    borderBottomWidth: StyleSheet.hairlineWidth, 
    borderBottomColor: 'rgba(0,213,255,0.18)' 
  },

  // active/highlight (keeps your glow)
  cellNext: { 
    backgroundColor: '#00D5FF12', 
    borderWidth: 1, 
    borderColor: '#00D5FF33' 
  },

  // label (S1) above, reps below
  k: { 
    fontFamily: 'IBMPlexMono_400Regular', 
    fontSize: 11, 
    color: colors.white, 
    marginBottom: 2, 
    textAlign: 'center' 
  },
  v: { 
    fontFamily: 'IBMPlexMono_700Bold', 
    fontSize: 17, 
    color: colors.electricCyan, 
    textAlign: 'center' 
  },

  total: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,213,255,0.20)',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  totalValue: { 
    fontFamily: 'IBMPlexMono_700Bold', 
    fontSize: 18, 
    color: colors.electricCyan 
  },
});