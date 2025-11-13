import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Polyline, Path } from 'react-native-svg';
import { Timer, Sunglasses, ArrowRight, Cheers, HourglassMedium, ProjectorScreenChart, ClipboardText, Target, Lightning, Barbell } from 'phosphor-react-native';
import { supabase } from '../lib/supabase';
import { colors, textStyles } from '../theme/typography';
import BackgroundContainer from '../components/BackgroundContainer';
import GlassCard from '../components/GlassCard';
import NeonHeader from '../components/NeonHeader';

const { width: screenWidth } = Dimensions.get('window');

// Outline number component with neon glow
const OutlineNumber = ({ number, color = colors.electricCyan }) => {
  return (
    <Text style={{
      fontFamily: 'IBMPlexMono_700Bold',
      fontSize: 40,
      color: color,
      textShadowColor: color,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
      textAlign: 'center',
    }}>
      {number}
    </Text>
  );
};

// Custom Flamingo icon component
const FlamingoIcon = ({ size = 60, color = colors.hotPink }) => {
  return (
    <View style={{ 
      shadowColor: color,
      shadowOpacity: 0.8,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
    }}>
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path 
          fill="none" 
          stroke={color}
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M411.674 19.82q-.399 0-.799.026c-11.862.793-66.118 4.177-57.514 78.935c4.69 40.745 35.686 134.777 8.723 137.942c-10.085 1.183-21.482-50.259-107.617-49.145c-79.045 1.022-105.178 46.044-128.602 76.057c-40.892 18.126-62.973 26.188-73.426 62.861c20.703-3.015 38.183-20.096 69.045-27.537c49.206 12.785 111.833 46.992 184.914 4.223c49.809-12.752 105.363-19.901 108.301-82.514c-3.586-43.57-16.011-82.308-28.492-120.379c-4.426-13.5-11.253-30.65 6.52-37.7c8.378 4.004 15.912 8.46 32.648 5.88c14.265 5.75 19.893 35.658 30.184 35.07c1.182-14.901 6.732-29.728 2.328-44.764c-1.932-6.594-18.959-13.676-28.616-20.435c-1.59-9.443-9.344-18.484-17.597-18.52M198.26 338.213l-37.028 55.744l73.073 39.361v60.684h17.998v-50.988l76.674 41.3l8.537-15.843l-85.211-45.9v-81.919c-6.043.983-12.069 1.465-17.998 1.54v70.683l-47.159-25.402l30.592-46.057c-6.806-.705-13.347-1.832-19.478-3.203"
        />
      </Svg>
    </View>
  );
};

// Arrow component
const NeonArrow = ({ color = colors.electricCyan }) => {
  return (
    <View style={{ 
      shadowColor: color,
      shadowOpacity: 0.8,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 0 },
    }}>
      <ArrowRight size={32} weight="bold" color={color} />
    </View>
  );
};

const OnboardingScreen = ({ navigation, route }) => {
  const preAuth = route?.params?.preAuth ?? false; // Preview mode flag (using ?? instead of ||)

  const [currentScreen, setCurrentScreen] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Secure onboarding completion with proper error handling
  const completeOnboarding = async () => {
    if (isSubmitting) return; // Prevent double-tap
    setIsSubmitting(true);

    try {
      // Call secure RPC function (no user_id needed - server derives from JWT)
      const { data, error } = await supabase.rpc('complete_onboarding', {
        user_can_do_eight_pullups: null // Don't set assessment - handle elsewhere
      });
      
      if (error) throw error;
      
      // Verify RPC succeeded (returns array)
      const ok = Array.isArray(data) && data[0]?.success === true;
      if (!ok) {
        throw new Error('Onboarding completion failed');
      }

      // Cache locally to prevent flicker on app restart
      await AsyncStorage.setItem('has_completed_onboarding', 'true');

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
      
    } catch (error) {
      console.error('Onboarding error:', error);
      // TODO: Show user-friendly toast message with retry option
      setIsSubmitting(false);
    }
  };

  const Screen1 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <NeonHeader 
        showPalmTrees={true}
        titleSize={42}
      />
      
      <GlassCard borderColor={colors.electricCyan} glowColor={colors.electricCyan} style={styles.card}>
        <Text style={[textStyles.subTitle, styles.cardTitle, { color: colors.neonYellow }]}>
          FITNESS APPS SUCK
        </Text>
        <View style={styles.listContainer}>
          <View style={styles.listItem}>
            <HourglassMedium size={44} weight="regular" color={colors.hotPink} />
            <Text style={[textStyles.infoLabel, styles.listText]}>60+ minute workouts</Text>
          </View>
          <View style={styles.listItem}>
            <ProjectorScreenChart size={44} weight="regular" color={colors.purple} />
            <Text style={[textStyles.infoLabel, styles.listText]}>Overcomplicated plans</Text>
          </View>
          <View style={styles.listItem}>
            <ClipboardText size={44} weight="regular" color={colors.orange} />
            <Text style={[textStyles.infoLabel, styles.listText]}>Track everything</Text>
          </View>
        </View>
      </GlassCard>

      <GlassCard borderColor={colors.electricCyan} glowColor={colors.electricCyan} style={styles.card}>
        <Text style={[textStyles.subTitle, styles.cardTitle, { color: colors.electricCyan }]}>
          DR. CHINTICKLE FIXES IT
        </Text>
        <View style={styles.listContainer}>
          <View style={styles.listItem}>
            <Target size={44} weight="regular" color={colors.electricCyan} />
            <Text style={[textStyles.accentLabel, styles.listText, styles.boldText]}>ONE GOAL: 69 pull-ups</Text>
          </View>
          <View style={styles.listItem}>
            <Lightning size={44} weight="regular" color={colors.neonYellow} />
            <Text style={[textStyles.accentLabel, styles.listText, styles.boldText]}>15 minutes EVERY DAY</Text>
          </View>
          <View style={styles.listItem}>
            <Barbell size={44} weight="regular" color={colors.hotPink} />
            <Text style={[textStyles.accentLabel, styles.listText, styles.boldText]}>Zero complexity</Text>
          </View>
        </View>
      </GlassCard>

      {/* Cheers button to continue */}
      <TouchableOpacity 
        onPress={() => setCurrentScreen(2)} 
        style={styles.cheersButtonContainer}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.hotPink, colors.brightPink, colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cheersButton}
        >
          <Cheers size={40} weight="regular" color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  const Screen2 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentNew}>
      <NeonHeader 
        showPalmTrees={true}
        titleSize={46}
        style={styles.headerSpaced}
      />

      {/* System Overview - Horizontal Flow */}
      <GlassCard borderColor={colors.electricCyan} glowColor={colors.electricCyan} style={styles.systemCard}>
        
        {/* Clean icon row layout */}
        <View style={styles.iconRowHorizontal}>
          <View style={styles.iconColumn}>
            <FlamingoIcon size={80} color={colors.hotPink} />
            <View style={styles.numberContainer}>
              <OutlineNumber number="8" color={colors.electricCyan} />
            </View>
            <Text style={styles.label}>SETS</Text>
          </View>
          
          <View style={styles.arrowContainer}>
            <NeonArrow color={colors.electricCyan} />
          </View>
          
          <View style={styles.iconColumn}>
            <View style={styles.iconWithGlow}>
              <Timer size={80} weight="regular" color={colors.hotPink} />
            </View>
            <View style={styles.numberContainer}>
              <OutlineNumber number="2" color={colors.electricCyan} />
            </View>
            <Text style={styles.label}>MIN REST</Text>
          </View>
          
          <View style={styles.arrowContainer}>
            <NeonArrow color={colors.electricCyan} />
          </View>
          
          <View style={styles.iconColumn}>
            <View style={styles.iconWithGlow}>
              <Sunglasses size={80} weight="regular" color={colors.hotPink} />
            </View>
            <View style={styles.numberContainer}>
              <OutlineNumber number="15" color={colors.electricCyan} />
            </View>
            <Text style={styles.label}>MIN TOTAL</Text>
          </View>
        </View>
        
        {/* Daily commitment banner below */}
        <View style={styles.dailyCommitment}>
          <Text style={styles.neonBanner}>EVERY SINGLE DAY</Text>
          <Text style={styles.subheadText}>Daily consistency {'>'} sporadic intensity</Text>
        </View>
      </GlassCard>

      {/* Completion button */}
      <TouchableOpacity
        onPress={preAuth ? () => navigation.navigate('Welcome') : completeOnboarding}
        style={[
          styles.cheersButtonContainer,
          isSubmitting && { opacity: 0.5 } // Visual feedback during submission
        ]}
        activeOpacity={0.8}
        disabled={!preAuth && isSubmitting} // Prevent interaction during submission
      >
        <LinearGradient
          colors={[colors.hotPink, colors.brightPink, colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cheersButton}
        >
          <Cheers size={40} weight="regular" color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <BackgroundContainer>
      <SafeAreaView style={styles.container}>
        {/* Navigation dots - only 2 screens */}
        <View style={styles.dotsContainer}>
          {[1, 2].map((screen) => (
            <TouchableOpacity
              key={screen}
              onPress={() => setCurrentScreen(screen)}
              style={[
                styles.dot,
                currentScreen === screen && styles.activeDot
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {currentScreen === 1 && <Screen1 />}
          {currentScreen === 2 && <Screen2 />}
        </View>
      </SafeAreaView>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  scrollContentNew: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  dotsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    backgroundColor: colors.electricCyan,
    shadowColor: colors.electricCyan,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  card: {
    marginBottom: 20,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'IBMPlexMono_700Bold',
    marginBottom: 14,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  listContainer: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  listText: {
    ...textStyles.bodyText,
    fontSize: 14,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
  },
  // Screen 2 specific styles
  headerSpaced: {
    marginBottom: 40,
  },
  systemCard: {
    marginBottom: 32,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  iconRowHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  iconColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 106,
    paddingBottom: 66,
    marginHorizontal: 8,
  },
  iconWithGlow: {
    shadowColor: colors.hotPink,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  numberContainer: {
    marginTop: 8,
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontFamily: 'IBMPlexMono_700Bold',
    color: colors.electricCyan,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    textShadowColor: colors.electricCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    flexShrink: 1,
    maxWidth: 80,
  },
  dailyCommitment: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 217, 255, 0.3)',
  },
  neonBanner: {
    fontSize: 22,
    fontFamily: 'IBMPlexMono_700Bold',
    color: colors.hotPink,
    textShadowColor: colors.electricCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    textAlign: 'center',
    marginVertical: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  subheadText: {
    fontSize: 11,
    fontFamily: 'IBMPlexMono_700Bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  cheersButtonContainer: {
    marginTop: 16,
    alignSelf: 'center',
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: colors.hotPink,
    shadowOpacity: 0.8,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  cheersButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  ctaButtonText: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 16,
    color: colors.white,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});

export default OnboardingScreen;