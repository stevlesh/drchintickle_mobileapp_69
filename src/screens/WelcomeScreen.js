import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import BackgroundContainer from '../components/BackgroundContainer';
import NeonHeader from '../components/NeonHeader';
import AnimatedBeachBallButton from '../components/AnimatedBeachBallButton';
import { colors } from '../theme/typography';
import { tokens } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { resetTo } from '../navigation/navigationRef';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  // Session check — if already logged in, trigger global routing path
  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          resetTo('Loading');
        }
      } catch {}
    })();
  }, []);

  return (
    <BackgroundContainer>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <NeonHeader subtitle="THE ROAD TO 69 PULL-UPS IN ONE SET" />

          <View style={styles.spacer} />

          <View style={styles.buttonContainer}>
            <AnimatedBeachBallButton
              label="NEW? GET JACKED"
              onPress={() => navigation.navigate('SignUp')}
              showGloss={false}
              accessibilityLabel="Sign up for a new account"
            />

            <View style={{ height: 16 }} />

            <AnimatedBeachBallButton
              label="I'M BACK, BABY"
              onPress={() => navigation.navigate('SignIn')}
              showGloss={false}
              accessibilityLabel="Sign in to your account"
            />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Onboarding', { preAuth: true })} style={styles.howItWorks}>
            <Text style={styles.howItWorksText}>How It Works</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  spacer: { height: 20 },
  buttonContainer: {
    marginTop: 20,
  },
  howItWorks: {
    alignSelf: 'center',
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.electricCyan,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
  },
  howItWorksText: {
    color: colors.electricCyan,
    fontSize: 14,
    fontFamily: 'IBMPlexMono_700Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textShadowColor: colors.electricCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});


