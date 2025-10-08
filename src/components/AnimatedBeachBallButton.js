import React, { useRef, useState, useEffect } from 'react';
import { Pressable, View, Text, StyleSheet, Animated, Easing, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BeachBall } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { tokens } from '../theme/tokens';

const AnimatedBeachBallButton = ({
  label = "ACTIVATE SWOLE",
  onPress,
  showGloss = false,
  accessibilityLabel,
  disabled = false,
  style = {},
}) => {
  // Animated values for icon rotation, text opacity, and icon opacity
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const iconOpacity = useRef(new Animated.Value(1)).current;

  // Icon size for dynamic sparkle positioning
  const [iconSize, setIconSize] = useState({ width: 28, height: 28 });

  // Reduced motion check
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      setReduceMotion(enabled);
    });
  }, []);

  // Prepare sparkle animation values for 10 sparkles
  const numSparkles = 10;
  const sparkleAnims = useRef([...Array(numSparkles)].map(() => new Animated.Value(0))).current;

  // Precompute random directions (angle, distance) and colors for each sparkle
  const sparkleProps = useRef(
    Array.from({ length: numSparkles }, () => {
      const angle = Math.random() * 2 * Math.PI;      // random direction
      const distance = 40 + Math.random() * 30;       // random distance between 40-70
      const sparkleColors = tokens.component.button.beachBall.sparkleColors;
      const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
      const delay = Math.random() * 150;              // small random delay for stagger
      return { angle, distance, color, delay };
    })
  ).current;

  // Lock to prevent multiple presses during animation
  const animating = useRef(false);

  const handlePress = () => {
    if (disabled || animating.current) return;
    animating.current = true;

    // Fire haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Define the spin animation for the icon (0 to 360 degrees) - 300ms (FASTER)
    rotationAnim.setValue(0);
    const spinAnimation = Animated.timing(rotationAnim, {
      toValue: 1,
      duration: 300,  // Hybrid timing - faster spin
      easing: Easing.linear,
      useNativeDriver: true,
    });

    // Define text fade-out animation - 200ms (FASTER)
    const textFadeOut = Animated.timing(textOpacity, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    // Define icon fade-out (for explosion moment) - 100ms
    const iconFadeOut = Animated.timing(iconOpacity, {
      toValue: 0,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    // Define sparkle animations for each sparkle - 600ms (LONGER for mid-transition effect)
    const sparkleAnimations = sparkleAnims.map((sparkleAnim, i) => {
      sparkleAnim.setValue(0);
      return Animated.timing(sparkleAnim, {
        toValue: 1,
        duration: 600,  // Sparkles continue flying during navigation
        delay: sparkleProps[i].delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
    });

    // Define reset animations - 250ms
    const textFadeIn = Animated.timing(textOpacity, {
      toValue: 1,
      duration: 250,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    const iconFadeIn = Animated.timing(iconOpacity, {
      toValue: 1,
      duration: 250,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    // If reduced motion is enabled OR button is disabled, skip animation
    if (reduceMotion || disabled) {
      animating.current = false;
      if (onPress && !disabled) onPress();
      return;
    }

    // HYBRID APPROACH:
    // Run animation sequence BUT trigger navigation at 700ms (mid-explosion)
    // User sees: spin (300ms) + explosion starts (400ms) → navigate while sparkles flying!

    // Schedule navigation to fire at 700ms
    setTimeout(() => {
      if (onPress) {
        onPress();  // Navigate while sparkles are mid-flight
      }
    }, 700);

    // Run the full animation sequence (will complete in background during navigation)
    // 1. Spin icon + fade out text (300ms)
    // 2. Icon fades out + sparkles explode (600ms, but we navigate at 700ms total)
    // 3. Reset happens after navigation (user won't see it, but keeps state clean)
    Animated.sequence([
      Animated.parallel([spinAnimation, textFadeOut]),
      Animated.parallel([iconFadeOut, Animated.parallel(sparkleAnimations)]),
      Animated.delay(100),  // Afterglow pause
      Animated.parallel([
        Animated.sequence([
          Animated.delay(0),  // Reset rotation before showing
          iconFadeIn,
        ]),
        textFadeIn,
      ]),
    ]).start(() => {
      rotationAnim.setValue(0);  // Reset rotation
      animating.current = false;
    });
  };

  // Interpolate rotation value to degrees
  const spinDeg = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const buttonColors = tokens.component.button.beachBall;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[styles.pressable, disabled && styles.disabledButton, style]}
      accessible={true}
      accessibilityLabel={accessibilityLabel || `${label} button`}
      accessibilityRole="button"
    >
      <View style={styles.neonWrap}>
        {/* Android glow layer (iOS uses shadow on neonWrap) */}
        <View
          style={[
            styles.neonHalo,
            disabled && styles.disabledHalo
          ]}
          pointerEvents="none"
        />

        <LinearGradient
          colors={buttonColors.gradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[
            styles.gradientBackground,
            styles.cyanBorder,
            disabled && styles.disabledBorder
          ]}
        >
        {/* Optional gloss overlay */}
        {showGloss && (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.3)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glossOverlay}
          />
        )}

        {/* Label Text */}
        <Animated.Text style={[styles.labelText, { opacity: textOpacity }]}>
          {label}
        </Animated.Text>

        {/* Icon + its sparkles, in a container to position sparkles relative to icon */}
        <View style={styles.iconContainer}>
          {/* BeachBall icon with animated rotation and opacity */}
          <Animated.View
            style={{ transform: [{ rotate: spinDeg }], opacity: iconOpacity }}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setIconSize({ width, height });
            }}
          >
            <BeachBall size={28} color={buttonColors.iconColor} weight="regular" />
          </Animated.View>

          {/* Sparkle elements (absolute within iconContainer) */}
          {sparkleAnims.map((animValue, i) => {
            const { angle, distance, color } = sparkleProps[i];
            const targetX = distance * Math.cos(angle);
            const targetY = distance * Math.sin(angle);

            return (
              <Animated.View
                key={i}
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: (iconSize.width / 2) - (SPARK_SIZE / 2),
                  top: (iconSize.height / 2) - (SPARK_SIZE / 2),
                  width: SPARK_SIZE,
                  height: SPARK_SIZE,
                  borderRadius: SPARK_SIZE / 2,
                  backgroundColor: color,
                  opacity: animValue.interpolate({
                    inputRange: [0, 0.1, 1],
                    outputRange: [0, 1, 0]
                  }),
                  transform: [
                    {
                      translateX: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, targetX]
                      })
                    },
                    {
                      translateY: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, targetY]
                      })
                    },
                    {
                      scale: animValue.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.8, 1.2, 0]  // Grow then shrink
                      })
                    }
                  ]
                }}
              />
            );
          })}
        </View>
      </LinearGradient>
      </View>
    </Pressable>
  );
};

// Sparkle dot size (in pixels)
const SPARK_SIZE = 6;
const RADIUS = 16;

const styles = StyleSheet.create({
  pressable: {
    borderRadius: RADIUS,
    overflow: 'visible',
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Wrapper for neon effect (iOS glow via shadow, Android via halo layer)
  neonWrap: {
    borderRadius: RADIUS,
    overflow: 'visible',
    // iOS glow
    shadowColor: tokens.border.primary,  // #00F6FF
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 12,  // Android elevation
  },
  // Android glow layer (halo behind gradient for cross-platform consistency)
  neonHalo: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: RADIUS + 4,
    borderWidth: 2,
    borderColor: 'rgba(0, 246, 255, 0.6)',
    backgroundColor: 'rgba(0, 246, 255, 0.06)', // Subtle cyan fill for Android
    shadowColor: '#00F6FF',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  // Disabled halo (toned down for non-clickable appearance)
  disabledHalo: {
    borderColor: 'rgba(0, 246, 255, 0.15)',
    backgroundColor: 'rgba(0, 246, 255, 0.02)',
    shadowOpacity: 0.2,
  },
  gradientBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS,
    paddingVertical: 14,
    paddingHorizontal: 24,
    position: 'relative',
  },
  // Cyan border for neon containment (softened alpha to avoid sticker look)
  cyanBorder: {
    borderWidth: 1.5,
    borderColor: 'rgba(0, 246, 255, 0.25)',  // Subtle edge
  },
  // Disabled border (even lighter)
  disabledBorder: {
    borderColor: 'rgba(0, 246, 255, 0.1)',
  },
  glossOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADIUS,
  },
  labelText: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#FFFFFF',
    textShadowColor: tokens.component.button.beachBall.textGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,  // Capped to prevent bloom on light gradient
  },
  iconContainer: {
    position: 'relative',
    marginLeft: 8,
    zIndex: 1,
  },
});

export default AnimatedBeachBallButton;
