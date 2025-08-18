import React, { useState, useEffect } from 'react' // Updated
import { View, ActivityIndicator, Text, StyleSheet, Platform } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico'
import { Righteous_400Regular } from '@expo-google-fonts/righteous'
import { Orbitron_400Regular, Orbitron_700Bold, Orbitron_900Black } from '@expo-google-fonts/orbitron'
import { Monoton_400Regular } from '@expo-google-fonts/monoton'
import { GemunuLibre_700Bold } from '@expo-google-fonts/gemunu-libre'
import { IBMPlexMono_400Regular, IBMPlexMono_700Bold } from '@expo-google-fonts/ibm-plex-mono'
import { LinearGradient } from 'expo-linear-gradient'
import { Asset } from 'expo-asset'
import { supabase } from './src/lib/supabase'
import { colors } from './src/theme/typography'

// Import screens
import LoginScreen from './src/screens/LoginScreen'
import OnboardingScreen from './src/screens/OnboardingScreen'
import EmailConfirmationScreen from './src/screens/EmailConfirmationScreen'
import TabNavigator from './src/navigation/TabNavigator'

const RootStack = createNativeStackNavigator()

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true) // Temporarily disabled onboarding
  const [checkingOnboarding, setCheckingOnboarding] = useState(false) // Disabled user state checking
  const [emailConfirmed, setEmailConfirmed] = useState(true) // Default to true to avoid flash

  // Load Miami Vice fonts - with web fallback
  let [fontsLoaded] = useFonts({
    Pacifico_400Regular,
    Righteous_400Regular,
    Orbitron_400Regular,
    Orbitron_700Bold,
    Orbitron_900Black,
    Monoton_400Regular,
    GemunuLibre_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_700Bold,
  })

  // For web, don't wait for fonts to load
  const shouldWaitForFonts = Platform.OS !== 'web'

  // Preload assets
  useEffect(() => {
    async function loadAssets() {
      try {
        // Preload all important assets
        await Asset.loadAsync([
          require('./src/assets/icons/sessions.png'),
          require('./src/assets/icons/sessions2.png'),
          require('./src/assets/icons/sessions3.png'),
          require('./src/assets/icons/streak.png'),
          require('./src/assets/icons/streak2.png'),
          require('./src/assets/palms/palm1.png'),
          require('./src/assets/palms/palm2.png'),
          require('./src/assets/palms/Palm3.png'),
        ]);
        setAssetsLoaded(true);
      } catch (error) {
        console.error('Error preloading assets:', error);
        // Continue anyway to avoid blocking the app
        setAssetsLoaded(true);
      }
    }
    loadAssets();
  }, []);

  // Check user state using server-side RPC for better mobile UX
  const checkUserState = async (userId) => {
    try {
      console.log('Checking user state for:', userId);
      
      // Use server-side RPC to get complete user state
      const { data, error } = await supabase
        .rpc('get_user_app_state', { user_id: userId });

      console.log('User state response:', { data, error });

      if (error) {
        console.error('Error checking user state:', error);
        // Fallback to basic profile check
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_completed_onboarding')
          .eq('id', userId)
          .single();
        
        setHasCompletedOnboarding(profile?.has_completed_onboarding || false);
      } else if (data) {
        // Set email confirmation status
        setEmailConfirmed(data.email_confirmed);
        
        if (!data.email_confirmed) {
          console.log('Email not confirmed yet');
          // User needs to confirm email first
          setHasCompletedOnboarding(false);
        } else {
          // Email is confirmed, check onboarding
          setHasCompletedOnboarding(!data.needs_onboarding);
        }
      }
    } catch (error) {
      console.error('Error in checkUserState:', error);
      setHasCompletedOnboarding(false);
    } finally {
      console.log('Setting checkingOnboarding to false');
      setCheckingOnboarding(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSession(session)
      if (session?.user?.id) {
        checkUserState(session.user.id);
      } else {
        setCheckingOnboarding(false);
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session);
      
      setSession(session);
      
      if (session?.user?.id) {
        // For new signups, add a small delay to ensure profile is created by database trigger
        if (_event === 'SIGNED_UP') {
          console.log('New user signup detected, waiting for profile creation');
          // Small delay to ensure database trigger has created the profile
          setTimeout(() => {
            checkUserState(session.user.id);
          }, 1000);
        } else {
          checkUserState(session.user.id);
        }
      } else {
        setCheckingOnboarding(false);
        setHasCompletedOnboarding(false);
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (checkingOnboarding) {
        console.log('Onboarding check timeout - forcing completion');
        setCheckingOnboarding(false);
        setHasCompletedOnboarding(false);
      }
    }, 5000); // 5 second timeout for better mobile UX

    return () => clearTimeout(timeout);
  }, [checkingOnboarding]);

  console.log('App state:', { 
    loading, 
    fontsLoaded, 
    shouldWaitForFonts, 
    assetsLoaded, 
    session: !!session, 
    checkingOnboarding, 
    hasCompletedOnboarding 
  });

  if (loading || (shouldWaitForFonts && !fontsLoaded) || !assetsLoaded || (session && checkingOnboarding)) {
    return (
      <LinearGradient
        colors={[
          colors.hotPink,
          colors.purple,
          colors.darkPurple,
          colors.deepPurple,
          colors.veryDark
        ]}
        style={styles.loadingContainer}
      >
        <Text style={styles.loadingTitle}>DR. CHINTICKLE</Text>
        <Text style={styles.loadingSubtitle}>THE ROAD TO 69 PULL-UPS IN ONE SET</Text>
        <Text style={styles.loadingQuote}>"GREATNESS IS EARNED, NOT GIVEN"</Text>
        <ActivityIndicator size="large" color={colors.electricCyan} style={styles.spinner} />
      </LinearGradient>
    )
  }

  return (
    <SafeAreaProvider>
      <View style={styles.appContainer}>
        <NavigationContainer>
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {/* Auth Flow */}
            {!session ? (
              <RootStack.Screen name="Login" component={LoginScreen} />
            ) : !emailConfirmed ? (
              <RootStack.Screen name="EmailConfirmation" component={EmailConfirmationScreen} />
            ) : !hasCompletedOnboarding ? (
              <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
            ) : (
              /* Main App - Tab Navigator */
              <RootStack.Screen name="Main" component={TabNavigator} />
            )}
          </RootStack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 42,
    fontFamily: 'Pacifico_400Regular',
    color: colors.white,
    letterSpacing: 2,
    marginBottom: 12,
    textShadowColor: colors.electricCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
    fontStyle: 'italic',
  },
  loadingSubtitle: {
    fontSize: 14,
    fontFamily: 'Orbitron_400Regular',
    color: colors.lightGray,
    letterSpacing: 1.5,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  loadingQuote: {
    fontSize: 16,
    fontFamily: 'Righteous_400Regular',
    color: colors.neonYellow,
    letterSpacing: 1,
    marginBottom: 40,
    textShadowColor: colors.neonYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    fontStyle: 'italic',
  },
  spinner: {
    marginTop: 20,
  },
  appContainer: {
    flex: 1,
    backgroundColor: colors.veryDark, // Explicitly set background color
  },
})