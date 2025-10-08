import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/typography';
import { tokens } from '../theme/tokens';

export default function QuoteChipMeasured({
  text,
  gap,
  quoteSize,
  paddingH,
  paddingV,
  suppressContainer = false,
}) {
  const tiny = Dimensions.get('window').width < 360;

  // Tunables (can be overridden by props)
  const PAD_H = paddingH ?? 18;
  const PAD_V = paddingV ?? 14;
  const GAP   = gap ?? (tiny ? 10 : 12);         // equal gap both sides
  const QSIZE = quoteSize ?? (tiny ? 22 : 24);   // a bit larger than before

  const [first, setFirst] = useState(null);
  const [last, setLast]   = useState(null);

  const onTextLayout = (e) => {
    const lines = e.nativeEvent.lines;
    if (!lines?.length) return;

    const f = lines[0];
    const l = lines[lines.length - 1];

    // avoid re-renders if unchanged
    if (!first || f.x !== first.x || f.y !== first.y || f.width !== first.width || f.height !== first.height) {
      setFirst(f);
    }
    if (!last || l.x !== last.x || l.y !== last.y || l.width !== last.width || l.height !== last.height) {
      setLast(l);
    }
  };

  // positions computed once we have line boxes
  const openPos = useMemo(() => {
    if (!first) return null;
    return {
      top:  PAD_V + first.y - 5,          // raised more for better optical balance
      left: PAD_H + first.x - (GAP + 5),  // +5px total for more breathing room
    };
  }, [first, PAD_H, PAD_V, GAP]);

  const closePos = useMemo(() => {
    if (!last) return null;
    return {
      top:  PAD_V + last.y - 2,                           // keep original vertical position
      left: PAD_H + last.x + last.width + GAP,            // standard spacing past last glyph
    };
  }, [last, PAD_H, PAD_V, GAP]);

  const content = (
    <>
      {/* inner vignette only (helps the quotes pop) - only if not suppressed */}
      {!suppressContainer && (
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.10)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}

      {/* Measured text; wrapping defines line boxes */}
      <Text style={styles.body} onTextLayout={onTextLayout}>
        {text}
      </Text>

      {/* Opening big quote — equalized distance before first glyph */}
      {openPos && (
        <Text
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={[styles.q, { fontSize: QSIZE, top: openPos.top, left: openPos.left }]}
        >
          "
        </Text>
      )}

      {/* Closing big quote — equalized distance after last glyph */}
      {closePos && (
        <Text
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={[styles.q, { fontSize: QSIZE, top: closePos.top, left: closePos.left }]}
        >
          "
        </Text>
      )}
    </>
  );

  // If suppressContainer, return just the content with positioning wrapper
  if (suppressContainer) {
    return (
      <View style={{ position: 'relative', paddingHorizontal: PAD_H, paddingVertical: PAD_V }}>
        {content}
      </View>
    );
  }

  // Otherwise, return with original container
  return (
    <View style={styles.wrap} accessible accessibilityLabel={`Quote: ${text}`}>
      {/* Dark pill background, NO border, NO outer cyan glow */}
      <View style={[styles.frame, { paddingHorizontal: PAD_H, paddingVertical: PAD_V }]}>
        {content}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },

  // Matches the earlier screenshot: dark pill, no border. Very subtle depth via shadow.
  frame: {
    position: 'relative',
    borderRadius: 14,
    backgroundColor: tokens.component.neonCard.background[0], // panelA equivalent
    shadowColor: '#000',
    shadowOpacity: 0.12,     // softer than before
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  body: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: 4, // keeps quotes from colliding on tiny phones
  },

  q: {
    position: 'absolute',
    fontFamily: 'IBMPlexMono_700Bold',
    color: colors.electricCyan,
    opacity: 0.98,
    // gentle neon feel; no outline/border on the card itself
    textShadowColor: 'rgba(0,183,230,0.25)', // borderGlow equivalent
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
});