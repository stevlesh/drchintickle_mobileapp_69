// TEMPORARY: Testing network connectivity
// Uncomment next 2 lines to test network:
// import TestNetwork from './TestNetwork';
// export { TestNetwork as default };

import "react-native-url-polyfill/auto"; // keep once (if already present, don't duplicate)
import React, { useState, useEffect, useRef } from 'react' // Updated
import { View, ActivityIndicator, Text, StyleSheet, Platform, AppState } from 'react-native'
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
import { installAuthLinking } from './src/auth/supabaseAuth'
import { navigationRef, resetTo, flushPendingNavigation } from './src/navigation/navigationRef'
import { recoverFromStaleToken } from './src/utils/authRecovery'
import { clearWorkoutPlanCache } from './src/utils/workoutApi'
import { initNotifications } from './src/notificationsInit'
import { requestNotificationPermissions } from './src/utils/restNotifications'

// Import screens
import LoadingScreen from './src/screens/LoadingScreen'
import LoginScreen from './src/screens/LoginScreen'
import OnboardingScreen from './src/screens/OnboardingScreen'
import EmailConfirmationScreen from './src/screens/EmailConfirmationScreen'
import TabNavigator from './src/navigation/TabNavigator'

const RootStack = createNativeStackNavigator()

// Global auth routing function
let rfstInflight = false;
async function routeFromServerTruth() {
  console.log('🎯 RFST called inflight=', rfstInflight);
  if (rfstInflight) return; 
  rfstInflight = true;
  const t = Date.now(); const tag = m => console.log('[RFST', Date.now()-t+'ms]', m);
  try {
    tag('start');
    const sessRes = await supabase.auth.getSession();
    tag('getSession has=' + !!sessRes.data?.session + ' err=' + !!sessRes.error);
    if (!sessRes.data?.session) { tag('-> Login'); resetTo('Login'); return; }

    // 2) Email confirmation — handle network errors correctly
    const userRes = await supabase.auth.getUser();
    if (userRes.error) {
      // Network or auth failure ≠ unconfirmed email. Fail safe to Login.
      console.warn('[RFST] getUser error:', userRes.error.message || userRes.error);
      resetTo('Login');
      return;
    }
    const user = userRes.data?.user;
    const confirmed = !!user?.email_confirmed_at;
    tag('getUser confirmed=' + confirmed);
    if (!confirmed) {
      tag('-> EmailConfirmation');
      resetTo('EmailConfirmation');
      return;
    }

    // 3) Profile / onboarding — handle errors explicitly
    const profRes = await supabase
      .from('profiles')
      .select('has_completed_onboarding')
      .eq('id', sessRes.data.session.user.id)
      .maybeSingle();

    if (profRes.error) {
      console.warn('[RFST] profiles fetch error:', profRes.error.message || profRes.error);
      // Network error ≠ "needs onboarding". Fail safe to Login.
      tag('prof error -> Login');
      resetTo('Login');
      return;
    }

    tag('profiles err=' + !!profRes.error + ' done=' + !!profRes.data?.has_completed_onboarding);

    tag(profRes.data?.has_completed_onboarding ? '-> Main' : '-> Onboarding');
    resetTo(profRes.data?.has_completed_onboarding ? 'Main' : 'Onboarding');
  } catch (e) {
    console.log('[RFST] catch', e?.message || e);
    try { await supabase.auth.stopAutoRefresh(); } catch {}
    try { await supabase.auth.signOut({ scope: 'local' }); } catch {}
    resetTo('Login');
  } finally {
    rfstInflight = false;
  }
}

export default function App() {
  // Temporary: silence other data fetches during probe
  // if (__DEV__) {
  //   globalThis.__PROBES_ONLY__ = true;
  // }

  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [splashTimeout, setSplashTimeout] = useState(false)

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

  // Set splash timeout to 400ms max
  useEffect(() => {
    const timer = setTimeout(() => setSplashTimeout(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // BOOT: kick once (may queue); subscribe to auth events
  useEffect(() => {
    routeFromServerTruth();
    const { data: sub } = supabase.auth.onAuthStateChange((_evt,_s)=>{ routeFromServerTruth(); });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Initialize notifications once on app start
  useEffect(() => {
    (async () => {
      await initNotifications();
      // Ask once on app start
      await requestNotificationPermissions().catch(() => {});
    })();
  }, []);

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

  // Show navigator after 400ms max, even if assets/fonts aren't ready
  const showNavigator = splashTimeout || ((!shouldWaitForFonts || fontsLoaded) && assetsLoaded);

  console.log('App state:', { 
    fontsLoaded, 
    shouldWaitForFonts, 
    assetsLoaded,
    splashTimeout,
    showNavigator
  });

  if (!showNavigator) {
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
        <NavigationContainer 
          ref={navigationRef}
          onReady={() => {
            console.log('Navigation container ready');
            flushPendingNavigation();
            routeFromServerTruth();
            setTimeout(() => {
              const cur = navigationRef.getCurrentRoute()?.name;
              console.log('[SAFE] after 2000ms route =', cur);
              if (cur === 'Loading') resetTo('Login');
            }, 2000);
          }}
        >
          <RootStack.Navigator 
            screenOptions={{ headerShown: false }}
            initialRouteName="Loading"
          >
            {/* Declare all routes unconditionally to prevent navigation errors */}
            <RootStack.Screen name="Loading" component={LoadingScreen} />
            <RootStack.Screen name="Login" component={LoginScreen} />
            <RootStack.Screen name="EmailConfirmation" component={EmailConfirmationScreen} />
            <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
            <RootStack.Screen name="Main" component={TabNavigator} />
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