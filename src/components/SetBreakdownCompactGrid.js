import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/typography';
import { tokens } from '../theme/tokens';
import { Cigarette } from 'phosphor-react-native';

export default function SetBreakdownCompactGrid({ data, showDivider = true }) {
  // Calculate total for footer
  const total = data.reduce((sum, item) => sum + Number(item.v || 0), 0);

  return (
    <View style={styles.card} accessibilityRole="summary">
      {/* Header: icon + label centered */}
      <View style={styles.header} accessible accessibilityLabel="Set breakdown">
        <Cigarette 
          size={28} 
          color={colors.electricCyan} 
          style={{ marginRight: 12 }}
          accessibilityElementsHidden 
          importantForAccessibility="no" 
        />
        <Text style={styles.headerText}>SET BREAKDOWN</Text>
      </View>

      <View style={styles.grid}>
        {data.map((c, i) => {
          const isLeftCol = i % 2 === 0;
          return (
            <View 
              key={c.k} 
              style={[
                styles.cell, 
                c.next && styles.cellNext,
                showDivider && isLeftCol && styles.cellDividerRight, // subtle center divider
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

      {/* Footer total stays compact */}
      <View style={styles.total} accessible accessibilityLabel={`Total reps ${total}`}>
        <Text style={styles.totalLabel}>TOTAL REPS</Text>
        <Text style={styles.totalValue}>{total}</Text>
      </View>
    </View>
  );
}

const GUTTER = 8;
const CELL_PAD_V = 6; // was 10 → tightened by ~4px

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.component.neonCard.background[0], // panelA equivalent
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
    marginBottom: 8 // Reduced from 12
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
    marginHorizontal: -GUTTER / 2,
  },
  cell: {
    width: '50%',
    paddingHorizontal: GUTTER / 2,
    paddingVertical: CELL_PAD_V, // tightened vertical padding
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  // subtle vertical divider for left column cells only
  cellDividerRight: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,213,255,0.18)', // cyanA @ ~18% for a soft lane split
  },
  cellNext: { 
    backgroundColor: '#00D5FF12', 
    borderWidth: 1, 
    borderColor: '#00D5FF33' 
  },

  k: { 
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11, 
    color: colors.white // Changed to white for better contrast
  },
  v: { 
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 17, 
    color: colors.electricCyan 
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