import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Polyline, Path, Rect, Line, Polygon } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import { colors, textStyles } from '../theme/typography';
import BackgroundContainer from '../components/BackgroundContainer';
import GlassCard from '../components/GlassCard';
import NeonButton from '../components/NeonButton';
import NeonHeader from '../components/NeonHeader';

const { width: screenWidth } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [canDoEightPullups, setCanDoEightPullups] = useState(null);

  // Complete onboarding using direct database operations
  const completeOnboarding = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      // Update profile directly in database
      const { error } = await supabase
        .from('profiles')
        .update({
          has_completed_onboarding: true,
          onboarding_completed_at: new Date().toISOString(),
          can_do_eight_pullups: canDoEightPullups,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) throw error;

      // Get the user's current workout number from their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_workout_in_cycle')
        .eq('id', session.user.id)
        .single();
      
      const workoutNum = profile?.current_workout_in_cycle || 1;
      
      // Navigate based on ability
      if (canDoEightPullups) {
        navigation.replace('PreWorkout', { workoutNum });
      } else {
        navigation.replace('Dashboard');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      console.error('Error saving onboarding progress. Please try again.');
    }
  };

  const NeonIcon = ({ type, color = colors.brightPink }) => {
    const iconSize = 20;
    
    switch (type) {
      case 'clock':
        return (
          <Svg width={iconSize} height={iconSize} style={styles.neonIcon}>
            <Circle cx="10" cy="10" r="8" fill="none" stroke={color} strokeWidth="2"/>
            <Polyline points="10,6 10,10 13,13" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          </Svg>
        );
      case 'diamond':
        return (
          <Svg width={iconSize} height={iconSize} style={styles.neonIcon}>
            <Path d="M10 2 L18 10 L10 18 L2 10 Z" fill="none" stroke={color} strokeWidth="2"/>
            <Circle cx="10" cy="10" r="2" fill="none" stroke={color} strokeWidth="1.5"/>
          </Svg>
        );
      case 'box':
        return (
          <Svg width={iconSize} height={iconSize} style={styles.neonIcon}>
            <Rect x="2" y="2" width="16" height="16" fill="none" stroke={color} strokeWidth="2" rx="2"/>
            <Circle cx="10" cy="10" r="3" fill="none" stroke={color} strokeWidth="1.5"/>
          </Svg>
        );
      case 'circle-dot':
        return (
          <Svg width={iconSize} height={iconSize} style={styles.neonIcon}>
            <Circle cx="10" cy="10" r="8" fill="none" stroke={color} strokeWidth="2"/>
            <Circle cx="10" cy="10" r="2" fill={color}/>
          </Svg>
        );
      case 'star':
        return (
          <Svg width={iconSize} height={iconSize} style={styles.neonIcon}>
            <Polygon points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8" fill="none" stroke={color} strokeWidth="2"/>
          </Svg>
        );
      case 'trophy':
        return (
          <Svg width={iconSize} height={iconSize} style={styles.neonIcon}>
            <Circle cx="10" cy="6" r="4" fill="none" stroke={color} strokeWidth="2"/>
            <Path d="M6 14 L14 14 M8 17 L12 17" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          </Svg>
        );
      case 'barbell':
        return (
          <Svg width={iconSize} height={iconSize} style={styles.neonIcon}>
            <Rect x="2" y="8" width="16" height="8" fill="none" stroke={color} strokeWidth="2" rx="2"/>
            <Circle cx="6" cy="6" r="2" fill="none" stroke={color} strokeWidth="2"/>
            <Circle cx="14" cy="6" r="2" fill="none" stroke={color} strokeWidth="2"/>
          </Svg>
        );
      case 'timer':
        return (
          <Svg width={iconSize} height={iconSize} style={styles.neonIcon}>
            <Circle cx="10" cy="10" r="8" fill="none" stroke={color} strokeWidth="2"/>
            <Polyline points="10,4 10,10 14,14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          </Svg>
        );
      case 'x':
        return (
          <Svg width={iconSize} height={iconSize} style={styles.neonIcon}>
            <Rect x="3" y="3" width="14" height="14" fill="none" stroke={color} strokeWidth="2" rx="2"/>
            <Line x1="7" y1="7" x2="13" y2="13" stroke={color} strokeWidth="2"/>
            <Line x1="7" y1="13" x2="13" y2="7" stroke={color} strokeWidth="2"/>
          </Svg>
        );
      case 'rocket':
        return (
          <Svg width={iconSize} height={iconSize} style={styles.neonIcon}>
            <Path d="M10 2 L12 8 L10 12 L8 8 Z" fill="none" stroke={color} strokeWidth="2"/>
            <Path d="M10 12 L12 18 L10 16 L8 18 Z" fill="none" stroke={color} strokeWidth="1.5"/>
          </Svg>
        );
      default:
        return null;
    }
  };

  const Screen1 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <NeonHeader 
        subtitle="FINALLY, A FITNESS APP THAT GETS IT" 
        showPalmTrees={true}
        titleSize={42}
        subtitleSize={14}
      />
      
      <GlassCard borderColor={colors.hotPink} glowColor={colors.hotPink} style={styles.card}>
        <Text style={[textStyles.subTitle, styles.cardTitle, { color: colors.neonYellow }]}>
          MOST FITNESS APPS ARE BROKEN
        </Text>
        <View style={styles.listContainer}>
          <View style={styles.listItem}>
            <NeonIcon type="clock" color={colors.hotPink} />
            <Text style={[textStyles.infoLabel, styles.listText]}>60+ minute workouts</Text>
          </View>
          <View style={styles.listItem}>
            <NeonIcon type="diamond" color={colors.purple} />
            <Text style={[textStyles.infoLabel, styles.listText]}>Overcomplicated plans</Text>
          </View>
          <View style={styles.listItem}>
            <NeonIcon type="box" color={colors.orange} />
            <Text style={[textStyles.infoLabel, styles.listText]}>Track everything</Text>
          </View>
        </View>
      </GlassCard>

      <GlassCard borderColor={colors.electricCyan} glowColor={colors.electricCyan} style={styles.card}>
        <Text style={[textStyles.subTitle, styles.cardTitle, { color: colors.electricCyan }]}>
          DR. CHINTICKLE FIXES THIS
        </Text>
        <View style={styles.listContainer}>
          <View style={styles.listItem}>
            <NeonIcon type="circle-dot" color={colors.electricCyan} />
            <Text style={[textStyles.accentLabel, styles.listText, styles.boldText]}>ONE GOAL: 69 pull-ups</Text>
          </View>
          <View style={styles.listItem}>
            <NeonIcon type="star" color={colors.neonYellow} />
            <Text style={[textStyles.accentLabel, styles.listText, styles.boldText]}>15 minutes EVERY DAY</Text>
          </View>
          <View style={styles.listItem}>
            <NeonIcon type="trophy" color={colors.green} />
            <Text style={[textStyles.accentLabel, styles.listText, styles.boldText]}>Zero complexity</Text>
          </View>
        </View>
      </GlassCard>

      <Text style={[textStyles.accentText, styles.legendTitle]}>THE LEGEND OF 69</Text>
      <Text style={[textStyles.quote, styles.legendText]}>
        Yes, it's ridiculous. Yes, you can do it.
      </Text>

      <NeonButton 
        title="THIS SOUNDS AMAZING" 
        onPress={() => setCurrentScreen(2)} 
        style={styles.fullWidthButton}
      />
    </ScrollView>
  );

  const Screen2 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <NeonHeader 
        subtitle="HERE'S HOW IT WORKS" 
        showPalmTrees={true}
        titleSize={42}
        subtitleSize={14}
      />

      <GlassCard borderColor={colors.neonYellow} glowColor={colors.neonYellow} style={styles.card}>
        <Text style={[textStyles.subTitle, styles.cardTitle, { color: colors.neonYellow }]}>
          THE DR. CHINTICKLE SYSTEM
        </Text>
        <View style={styles.systemContainer}>
          <View style={styles.systemItem}>
            <NeonIcon type="barbell" color={colors.hotPink} />
            <Text style={[textStyles.accentLabel, styles.systemText]}>8 SETS</Text>
          </View>
          <View style={styles.systemItem}>
            <NeonIcon type="timer" color={colors.lightBlue} />
            <Text style={[textStyles.accentLabel, styles.systemText]}>2 MIN REST</Text>
          </View>
          <View style={styles.systemItem}>
            <NeonIcon type="x" color={colors.green} />
            <Text style={[textStyles.accentLabel, styles.systemText]}>15 MIN TOTAL</Text>
          </View>
          <View style={styles.systemItem}>
            <NeonIcon type="rocket" color={colors.gold} />
            <Text style={[textStyles.accentLabel, styles.systemText]}>EVERY DAY</Text>
          </View>
        </View>
      </GlassCard>

      <GlassCard borderColor={colors.purple} glowColor={colors.purple} style={styles.card}>
        <Text style={[textStyles.subTitle, styles.cardTitle, { color: colors.purple }]}>
          THE PHILOSOPHY
        </Text>
        <Text style={[textStyles.quote, styles.philosophyQuote]}>
          "15 minutes EVERY DAY beats 90 minutes sometimes"
        </Text>
        <Text style={[textStyles.smallText, styles.philosophyText]}>
          Daily consistency > sporadic intensity.
        </Text>
      </GlassCard>

      <Text style={[textStyles.accentText, styles.assessmentPrompt]}>
        NOW, LET'S SEE WHERE YOU'RE AT...
      </Text>

      <GlassCard borderColor={colors.electricCyan} glowColor={colors.electricCyan} style={styles.card}>
        <Text style={[textStyles.subTitle, styles.questionText]}>
          Can you do 8 clean pull-ups right now?
        </Text>
        <Text style={[textStyles.smallText, styles.questionSubtext]}>
          (Be honest - full hang at bottom, chin over bar at top)
        </Text>
        
        <View style={styles.buttonRow}>
          <NeonButton
            title="YES, EASILY"
            onPress={() => {
              setCanDoEightPullups(true);
              setCurrentScreen(3);
            }}
            variant="primary"
            style={styles.halfButton}
          />
          <NeonButton
            title="NO / BARELY"
            onPress={() => {
              setCanDoEightPullups(false);
              setCurrentScreen(3);
            }}
            variant="secondary"
            style={styles.halfButton}
          />
        </View>
      </GlassCard>
    </ScrollView>
  );

  const Screen3 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <NeonHeader 
        subtitle="YOUR PERSONALIZED PROGRAM" 
        showPalmTrees={true}
        titleSize={42}
        subtitleSize={14}
      />

      {canDoEightPullups ? (
        <>
          <GlassCard borderColor={colors.green} glowColor={colors.green} style={styles.card}>
            <Text style={[textStyles.subTitle, styles.cardTitle, { color: colors.green }]}>
              STANDARD PROGRAM
            </Text>
            <Text style={[textStyles.infoLabel, styles.programText]}>
              Welcome to the big leagues!{'\n\n'}
              We'll start with a max test, then build you up to 69.
            </Text>
          </GlassCard>
          
          <Text style={[textStyles.accentText, styles.readyText]}>
            Ready to find your max and start dominating?
          </Text>

          <NeonButton
            title="START MAX TEST"
            onPress={completeOnboarding}
            style={styles.fullWidthButton}
          />
        </>
      ) : (
        <>
          <GlassCard borderColor={colors.orange} glowColor={colors.orange} style={styles.card}>
            <Text style={[textStyles.subTitle, styles.cardTitle, { color: colors.orange }]}>
              COMING VERY SOON
            </Text>
            <Text style={[textStyles.infoLabel, styles.programText]}>
              We're building something special for beginners.{'\n\n'}
              The <Text style={styles.boldInline}>Assisted Program</Text> will get you to 8+ pull-ups, 
              then graduate to the full 69-rep program!
            </Text>
          </GlassCard>

          <Text style={[textStyles.accentText, styles.readyText]}>
            We'll notify you the moment it's ready!
          </Text>

          <NeonButton
            title="CONTINUE TO APP"
            onPress={completeOnboarding}
            style={styles.fullWidthButton}
          />
        </>
      )}

      <GlassCard borderColor={colors.hotPink} glowColor={colors.hotPink} style={styles.card}>
        <Text style={[textStyles.subTitle, styles.cardTitle, { color: colors.hotPink }]}>
          REMEMBER
        </Text>
        <Text style={[textStyles.infoLabel, styles.rememberText]}>
          15 minutes. Every day.{'\n'}
          No exceptions.
        </Text>
      </GlassCard>

      <Text style={[textStyles.quote, styles.finalQuote]}>
        "The only workout you'll regret is the one you didn't do."
      </Text>
    </ScrollView>
  );

  return (
    <BackgroundContainer>
      <SafeAreaView style={styles.container}>
        {/* Navigation dots */}
        <View style={styles.dotsContainer}>
          {[1, 2, 3].map((screen) => (
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
          {currentScreen === 3 && <Screen3 />}
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
  },
  cardTitle: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: 'center',
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listText: {
    ...textStyles.bodyText,
    fontSize: 16,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
  },
  legendTitle: {
    ...textStyles.heading,
    fontSize: 24,
    color: colors.neonYellow,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
    textShadowColor: colors.neonYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  legendText: {
    ...textStyles.bodyText,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
  },
  systemContainer: {
    gap: 16,
  },
  systemItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  systemText: {
    ...textStyles.buttonText,
    fontSize: 18,
  },
  philosophyQuote: {
    ...textStyles.heading,
    fontSize: 20,
    color: colors.neonYellow,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
    textShadowColor: colors.neonYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  philosophyText: {
    ...textStyles.bodyText,
    fontSize: 16,
    textAlign: 'center',
  },
  assessmentPrompt: {
    ...textStyles.buttonText,
    fontSize: 18,
    color: colors.electricCyan,
    textAlign: 'center',
    marginVertical: 24,
  },
  questionText: {
    ...textStyles.heading,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  questionSubtext: {
    ...textStyles.bodyText,
    fontSize: 14,
    color: colors.lightGray,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  fullWidthButton: {
    marginTop: 20,
    width: '100%',
  },
  programText: {
    ...textStyles.bodyText,
    fontSize: 16,
    textAlign: 'center',
  },
  boldInline: {
    fontWeight: '700',
  },
  readyText: {
    ...textStyles.buttonText,
    fontSize: 18,
    color: colors.neonYellow,
    textAlign: 'center',
    marginVertical: 16,
    textShadowColor: colors.neonYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  rememberText: {
    ...textStyles.heading,
    fontSize: 18,
    textAlign: 'center',
  },
  finalQuote: {
    ...textStyles.bodyText,
    fontSize: 16,
    color: colors.neonYellow,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
    textShadowColor: colors.neonYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  neonIcon: {
    shadowColor: colors.brightPink,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
});

export default OnboardingScreen;