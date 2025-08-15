import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/typography';
import { tokens } from '../theme/tokens';
import { Cigarette } from 'phosphor-react-native';

export default function SetBreakdownCard({
  rows,
  total,
  iconSize = 18,
  title = 'SET BREAKDOWN',
}) {
  return (
    <View style={styles.card} accessibilityRole="summary">
      {/* header: icon + text treated as one unit, centered */}
      <View style={styles.hRow} accessible accessibilityLabel={title}>
        <Cigarette
          size={iconSize}
          color={colors.electricCyan}
          style={{ marginRight: 8 }}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <Text style={styles.hText}>{title}</Text>
      </View>

      {/* grid */}
      <View style={{ marginTop: 8 }}>
        {rows.map((r, i) => (
          <View
            key={i}
            style={[
              styles.row,
              i % 2 === 1 && styles.rowAlt,
              r.next && styles.rowNext,
            ]}
            accessible
            accessibilityLabel={`${r.left} ${r.right}`}
          >
            <Text style={styles.left}>{r.left}</Text>
            <Text style={styles.right}>{r.right}</Text>
          </View>
        ))}
      </View>

      {/* footer: TOTAL REPS inside the same card */}
      <View style={styles.footer} accessible accessibilityLabel={`Total reps ${total}`}>
        <Text style={styles.footerLabel}>TOTAL REPS</Text>
        <Text style={[styles.footerValue, { fontSize: iconSize }]}>{total}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.component.neonCard.background[0], // panelA equivalent
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.electricCyan,
    padding: 12,
    shadowColor: colors.electricCyan,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  hRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  hText: { 
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12, 
    color: colors.white, 
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  rowAlt: { 
    backgroundColor: 'rgba(255,255,255,0.02)' 
  },
  rowNext: { 
    backgroundColor: '#00D5FF12', 
    borderWidth: 1, 
    borderColor: '#00D5FF33' 
  },
  left: { 
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12, 
    color: colors.white // Changed from labelGray to white for consistency
  },
  right: { 
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 18, 
    color: colors.electricCyan 
  },

  /* footer bar */
  footer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,213,255,0.20)', // soft divider, token-consistent
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  // EXACT match with header style per request
  footerLabel: { 
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12, 
    color: colors.white, 
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // EXACT match with Cigarette icon "weight" per request (size set from prop)
  footerValue: { 
    fontFamily: 'IBMPlexMono_700Bold',
    color: colors.electricCyan, 
    lineHeight: 20 
  },
});