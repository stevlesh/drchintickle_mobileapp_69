import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
  Modal,
  Linking
} from 'react-native'


import { supabase } from '../lib/supabase'
import BackgroundContainer from '../components/BackgroundContainer'
import NeonHeader from '../components/NeonHeader'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'
import { colors, textStyles } from '../theme/typography'
import { getQuote } from '../utils/quotes'


export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentQuote, setCurrentQuote] = useState(null)
  const [showEmailAlert, setShowEmailAlert] = useState(false)



  // Get a motivational quote when the screen loads
  useEffect(() => {
    const quote = getQuote('preWorkout')
    setCurrentQuote(quote)
  }, [])

  // Poll for email confirmation after signup
  useEffect(() => {
    let interval;
    
    if (showEmailAlert) {
      console.log('Starting email confirmation polling...');
      
      const checkEmailConfirmation = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log('Email confirmed! User signed in:', session.user.email);
            setShowEmailAlert(false);
            // Session will be handled by App.js
          }
        } catch (error) {
          console.error('Error checking email confirmation:', error);
        }
      };
      
      // Check immediately and then every 3 seconds
      checkEmailConfirmation();
      interval = setInterval(checkEmailConfirmation, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showEmailAlert])


  // Poll for OAuth session changes (for Expo Go compatibility)
  useEffect(() => {
    let pollCount = 0;
    const maxPolls = 40; // Poll for up to 2 minutes (40 * 3 seconds)
    let interval;
    
    const checkForOAuthSession = async () => {
      try {
        // Force refresh the session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        if (session) {
          console.log('Session detected! User:', session.user.email);
          clearInterval(interval);
          setLoading(false);
          // Force a refresh to trigger App.js auth state
          await supabase.auth.refreshSession();
          return;
        }
        
        // Only increment counter when actively polling for OAuth
        if (loading) {
          pollCount++;
          console.log(`Polling for session... (${pollCount}/${maxPolls})`);
          
          if (pollCount >= maxPolls) {
            console.log('OAuth polling timeout reached');
            clearInterval(interval);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error checking for session:', error);
      }
    };
    
    // Only start polling if we're in loading state (OAuth initiated)
    if (loading) {
      console.log('Starting OAuth session polling...');
      
      // Check immediately
      checkForOAuthSession();
      
      // Then poll every 3 seconds
      interval = setInterval(checkForOAuthSession, 3000);
    }
    
    // Handle OAuth redirects (for standalone builds)
    const handleUrl = (url) => {
      console.log('Handling URL:', url);
      if (url.includes('access_token') || url.includes('error')) {
        checkForOAuthSession();
      }
    };
    
    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });
    
    return () => {
      if (interval) clearInterval(interval);
      subscription?.remove();
    };
  }, [loading])

  // Network probe to diagnose connectivity issues
  async function netProbe() {
    try {
      const g = await fetch('https://www.google.com', { method: 'HEAD' });
      console.log('NET google HEAD ok?', g.ok);
    } catch (e) { console.log('NET google failed', e); }

    try {
      const h = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/health`);
      console.log('SUPA /auth/v1/health', h.status);
    } catch (e) { console.log('SUPA health failed', e); }

    try {
      const r = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        method: 'HEAD',
        headers: { apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY }
      });
      console.log('SUPA /rest/v1 HEAD', r.status);
    } catch (e) { console.log('SUPA rest HEAD failed', e); }
  }

  async function signInWithEmail() {
    // Don't use setLoading(true) here - that triggers OAuth polling
    console.log('Signing in with:', email)
    
    // Run network probe before sign-in attempt
    await netProbe();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    console.log('Sign in response:', { data, error })

    if (error) {
      console.error('Sign in error:', error.message)
      // Just log the error - no alerts
      console.error('Signin failed:', error.message)
    }
    // No setLoading(false) needed since we didn't set it to true
  }

  async function signUpWithEmail() {
    setLoading(true)
    console.log('Signing up with:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    })

    console.log('Sign up response:', { data, error })

    if (error) {
      console.error('Sign up error:', error.message)
      console.error('Signup failed:', error.message)
    } else {
      console.log('Signup successful, showing email alert')
      setShowEmailAlert(true)
    }
    setLoading(false)
  }

  async function signInWithGoogle() {
    setLoading(true)
    console.log('Signing in with Google')
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: false,
          redirectTo: Platform.select({
            // For standalone builds (production)
            ios: 'drchintickle://auth/callback',
            android: 'drchintickle://auth/callback',
            // For web and Expo Go
            default: undefined
          })
        }
      })

      console.log('Google sign in response:', { data, error })

      if (error) {
        console.error('Google sign in error:', error.message)
        setLoading(false)
      } else if (data?.url) {
        console.log('Opening Google OAuth URL:', data.url)
        
        // Open the OAuth URL
        await Linking.openURL(data.url)
        
        // For Expo Go: Show instructions since redirect won't work
        if (__DEV__ && Platform.OS !== 'web') {
          console.log('\n📱 EXPO GO USERS: After signing in with Google:');
          console.log('1. Complete the Google sign-in in your browser');
          console.log('2. Return to the Expo Go app');
          console.log('3. The app will automatically detect your session\n');
        }
        
        // Keep loading state true for polling to work
        // It will be set to false by the polling mechanism or timeout
      } else {
        console.log('Google sign in initiated successfully')
        setLoading(false)
      }
    } catch (error) {
      console.error('Google sign in error:', error)
      setLoading(false)
    }
  }

  return (
    <BackgroundContainer>
      <View style={styles.container}>
        <NeonHeader 
          subtitle="THE ROAD TO 69 PULL-UPS"
          style={styles.header}
        />
        
        <Text style={styles.tagline}>
          {currentQuote ? `"${currentQuote}"` : '"GET JACKED OR DIE TRYING"'}
        </Text>
        
        <GlassCard style={styles.loginCard}>
          <Text style={[styles.noteText, { marginBottom: 16, color: '#00FFFF' }]}>
            Quick Test - Use email/password:
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <NeonButton
              title="SIGN IN"
              onPress={signInWithEmail}
              disabled={loading}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <NeonButton
              title="SIGN UP"
              onPress={signUpWithEmail}
              disabled={loading}
              variant="secondary"
              style={{ flex: 1 }}
            />
          </View>
          
          <NeonButton
            title={loading ? 'SIGNING IN...' : 'SIGN IN WITH GOOGLE'}
            onPress={signInWithGoogle}
            disabled={loading}
            variant="primary"
            style={styles.googleButton}
          />
          
          {loading && (
            <NeonButton
              title="CHECK IF SIGNED IN"
              onPress={async () => {
                console.log('Manual session check...');
                
                // Try to get the session from the URL you saw
                try {
                  // Force refresh all auth state
                  await supabase.auth.refreshSession();
                  
                  const { data: { session } } = await supabase.auth.getSession();
                  
                  if (session) {
                    console.log('Session found!', session.user.email);
                    setLoading(false);
                  } else {
                    console.log('Still no session...');
                    
                    // Try to check if we can extract tokens from clipboard/URL
                    console.log('Try signing in again or use email/password for testing');
                  }
                } catch (error) {
                  console.error('Error checking session:', error);
                }
              }}
              variant="secondary"
              style={[styles.googleButton, { marginTop: 10 }]}
            />
          )}

          <Text style={styles.noteText}>
            Use email/password for easy testing in Expo Go
          </Text>
        </GlassCard>
      </View>
      
      {/* Beautiful Email Alert Modal */}
      {showEmailAlert && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>CHECK YOUR EMAIL! 📧</Text>
            <Text style={styles.modalMessage}>
              We've sent a confirmation link to your email address. Click the link to activate your account and start your journey to 69 pull-ups!
            </Text>
            <NeonButton
              title="GOT IT!"
              onPress={() => {
                setShowEmailAlert(false)
                console.log('Email alert dismissed')
              }}
              variant="primary"
              style={styles.modalButton}
            />
          </View>
        </View>
      )}
      
    </BackgroundContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 20,
  },
  tagline: {
    ...textStyles.quote,
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 16,
  },
  loginCard: {
    marginHorizontal: 8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 56,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: colors.white,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.electricCyan + '60', // 60% opacity
    fontFamily: 'IBMPlexMono_400Regular',
    letterSpacing: 1,
  },
  signInButton: {
    marginBottom: 12,
  },
  signUpButton: {
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.electricCyan + '40',
  },
  dividerText: {
    ...textStyles.body,
    color: colors.mediumGray,
    marginHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    marginBottom: 16,
  },
  welcomeText: {
    ...textStyles.body,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 16,
    lineHeight: 24,
  },
  noteText: {
    ...textStyles.body,
    color: colors.mediumGray,
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '90%',
    borderWidth: 2,
    borderColor: colors.electricCyan,
    shadowColor: colors.electricCyan,
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  modalTitle: {
    ...textStyles.subTitle,
    color: colors.electricCyan,
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: colors.electricCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  modalMessage: {
    ...textStyles.bodyText,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontSize: 16,
  },
  modalButton: {
    width: '100%',
  },
})