import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Linking,
  TouchableOpacity
} from 'react-native'
import { Eye, EyeSlash } from 'phosphor-react-native'

import { supabase } from '../lib/supabase'
import BackgroundContainer from '../components/BackgroundContainer'
import NeonHeader from '../components/NeonHeader'
import GlassCard from '../components/GlassCard'
import NeonBarButton from '../components/NeonBarButton'
import BracketFrame from '../components/BracketFrame'
import QuoteChipMeasured from '../components/QuoteChipMeasured'
import { colors, textStyles } from '../theme/typography'
import { tokens } from '../theme/tokens'
import { getQuote } from '../utils/quotes'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordHidden, setPasswordHidden] = useState(true)
  const [loading, setLoading] = useState(false)
  const [currentQuote, setCurrentQuote] = useState(null)
  const [showEmailAlert, setShowEmailAlert] = useState(false)

  // Error states
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formError, setFormError] = useState('')

  // OAuth polling state
  const [oauthPollingTime, setOauthPollingTime] = useState(0)
  const [showOAuthEscalation, setShowOAuthEscalation] = useState(false)

  // Password reset state
  const [resetEmailSent, setResetEmailSent] = useState(false)

  // Refs for keyboard navigation
  const passwordRef = useRef(null)

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
          }
        } catch (error) {
          console.error('Error checking email confirmation:', error);
        }
      };

      checkEmailConfirmation();
      interval = setInterval(checkEmailConfirmation, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showEmailAlert])

  // OAuth polling with 60s escalation
  useEffect(() => {
    let pollCount = 0;
    const maxPolls = 20; // 60 seconds (20 * 3 seconds)
    let interval;

    const checkForOAuthSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setFormError('Authentication error. Please try again.');
          setLoading(false);
          return;
        }

        if (session) {
          console.log('Session detected! User:', session.user.email);
          clearInterval(interval);
          setLoading(false);
          setOauthPollingTime(0);
          setShowOAuthEscalation(false);
          await supabase.auth.refreshSession();
          return;
        }

        if (loading) {
          pollCount++;
          setOauthPollingTime(pollCount * 3);
          console.log(`Polling for session... (${pollCount}/${maxPolls})`);

          // Show escalation after 60 seconds
          if (pollCount === 20) {
            setShowOAuthEscalation(true);
          }

          // Hard timeout at 90 seconds
          if (pollCount >= 30) {
            console.log('OAuth polling timeout reached');
            clearInterval(interval);
            setLoading(false);
            setOauthPollingTime(0);
            setFormError('Google sign-in timed out. Please try email login.');
          }
        }
      } catch (error) {
        console.error('Error checking for session:', error);
        setFormError('Connection error. Please check your network.');
      }
    };

    if (loading) {
      console.log('Starting OAuth session polling...');
      checkForOAuthSession();
      interval = setInterval(checkForOAuthSession, 3000);
    }

    // Handle OAuth redirects
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

  // Clear errors when inputs change
  useEffect(() => {
    if (email) setEmailError('');
  }, [email])

  useEffect(() => {
    if (password) setPasswordError('');
  }, [password])

  // Validation
  const validateEmail = () => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setEmailError('Please enter a valid email');
      return false;
    }
    return true;
  }

  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    return true;
  }

  async function signInWithEmail() {
    setFormError('');

    if (!validateEmail() || !validatePassword()) {
      return;
    }

    setLoading(true);
    console.log('Signing in with:', email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password,
    })

    console.log('Sign in response:', { data, error })

    if (error) {
      console.error('Sign in error:', error.message)
      if (error.message.includes('Invalid login')) {
        setFormError('Invalid email or password');
      } else {
        setFormError(error.message);
      }
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setFormError('');

    if (!validateEmail() || !validatePassword()) {
      return;
    }

    setLoading(true);
    console.log('Signing up with:', email)

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password: password
    })

    console.log('Sign up response:', { data, error })

    if (error) {
      console.error('Sign up error:', error.message)
      if (error.message.includes('already registered')) {
        setFormError('This email is already registered. Try signing in.');
      } else {
        setFormError(error.message);
      }
    } else {
      console.log('Signup successful, showing email alert')
      setShowEmailAlert(true)
    }
    setLoading(false);
  }

  async function signInWithGoogle() {
    setFormError('');
    setOauthPollingTime(0);
    setShowOAuthEscalation(false);
    setLoading(true);
    console.log('Signing in with Google')

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: false,
          redirectTo: Platform.select({
            ios: 'drchintickle://auth/callback',
            android: 'drchintickle://auth/callback',
            default: undefined
          })
        }
      })

      console.log('Google sign in response:', { data, error })

      if (error) {
        console.error('Google sign in error:', error.message)
        setFormError('Failed to connect to Google. Please try email login.');
        setLoading(false);
      } else if (data?.url) {
        console.log('Opening Google OAuth URL:', data.url)
        await Linking.openURL(data.url)
      }
    } catch (error) {
      console.error('Google sign in error:', error)
      setFormError('Failed to open Google sign-in. Please try email login.');
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!validateEmail()) {
      setEmailError('Enter your email to reset password');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        { redirectTo: 'drchintickle://auth/callback' }
      );

      if (error) {
        setFormError('Failed to send reset email. Please try again.');
      } else {
        setResetEmailSent(true);
        setTimeout(() => setResetEmailSent(false), 5000);
      }
    } catch (error) {
      setFormError('Network error. Please try again.');
    }
  }

  const focusEmailInput = () => {
    // This would need a ref to the email input
    setFormError('');
  }

  return (
    <BackgroundContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <NeonHeader
              subtitle="THE ROAD TO 69 PULL-UPS"
              style={styles.header}
            />

            <GlassCard style={styles.loginCard}>
              {/* Email Input */}
              <View style={styles.inputBlock}>
                <BracketFrame style={{ marginBottom: emailError ? 8 : 0 }}>
                  <TextInput
                    style={styles.inputBare}
                    placeholder="Email"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    textContentType="emailAddress"
                    autoComplete="email"
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    editable={!loading}
                  />
                </BracketFrame>
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={[styles.inputBlock, { marginBottom: 8 }]}>
                <BracketFrame style={{ marginBottom: passwordError ? 8 : 0 }}>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      ref={passwordRef}
                      style={[styles.inputBare, { paddingRight: 50 }]}
                      placeholder="Password"
                      placeholderTextColor="#666"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={passwordHidden}
                      textContentType="password"
                      autoComplete="password"
                      returnKeyType="go"
                      onSubmitEditing={signInWithEmail}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.eyeToggle}
                      onPress={() => setPasswordHidden(!passwordHidden)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityLabel="Toggle password visibility"
                    >
                      {passwordHidden ? (
                        <Eye size={20} color={tokens.text.secondary} />
                      ) : (
                        <EyeSlash size={20} color={tokens.text.secondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </BracketFrame>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotLink}
                disabled={loading}
              >
                <Text style={styles.forgotLinkText}>Forgot password?</Text>
              </TouchableOpacity>
              {resetEmailSent && (
                <Text style={styles.successText}>Password reset email sent.</Text>
              )}

              {/* Form Error */}
              {formError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{formError}</Text>
                </View>
              ) : null}

              {/* OAuth Escalation */}
              {showOAuthEscalation && (
                <View style={styles.warningBanner}>
                  <Text style={styles.warningText}>
                    Still waiting on Google… You can sign in with email or try again.
                  </Text>
                  <TouchableOpacity onPress={signInWithGoogle} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Try again</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.buttonStack}>
                <NeonBarButton
                  title="SIGN IN"
                  onPress={signInWithEmail}
                  disabled={loading}
                  colors={{
                    primary: tokens.brand.primary,
                    secondary: tokens.brand.secondary,
                    text: tokens.text.primary
                  }}
                  height={52}
                  showIcon={false}
                />

                <NeonBarButton
                  title="SIGN UP"
                  onPress={signUpWithEmail}
                  disabled={loading}
                  colors={{
                    primary: tokens.brand.primary,
                    secondary: tokens.brand.secondary,
                    text: tokens.text.primary
                  }}
                  height={52}
                  showIcon={false}
                />

                <NeonBarButton
                  title={loading ? 'SIGNING IN…' : 'CONTINUE WITH GOOGLE'}
                  onPress={signInWithGoogle}
                  disabled={loading}
                  colors={{
                    primary: tokens.brand.primary,
                    secondary: tokens.brand.secondary,
                    text: tokens.text.primary
                  }}
                  height={52}
                  showIcon={false}
                />
              </View>
            </GlassCard>

            <View style={{ marginTop: 40 }}>
              <QuoteChipMeasured
                text={currentQuote || 'GET JACKED OR DIE TRYING'}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Email Alert Modal */}
      {showEmailAlert && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>CHECK YOUR EMAIL! 📧</Text>
            <Text style={styles.modalMessage}>
              We've sent a confirmation link to your email address. Click the link to activate your account and start your journey to 69 pull-ups!
            </Text>
            <NeonBarButton
              title="GOT IT!"
              onPress={() => {
                setShowEmailAlert(false)
                console.log('Email alert dismissed')
              }}
              colors={{
                primary: tokens.brand.primary,
                secondary: tokens.brand.secondary,
                text: tokens.text.primary
              }}
              height={48}
              showIcon={false}
            />
          </View>
        </View>
      )}
    </BackgroundContainer>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 20,
  },
  quoteChip: {
    alignSelf: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  loginCard: {
    marginHorizontal: 0,
    overflow: 'visible', // Don't clip glows
  },
  inputBlock: {
    marginBottom: 16,
  },
  inputBare: {
    height: 28,
    fontSize: 16,
    color: colors.white,
    fontFamily: 'IBMPlexMono_400Regular',
    letterSpacing: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeToggle: {
    position: 'absolute',
    right: 0,
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: tokens.feedback?.error || '#ff6b6b',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontFamily: 'IBMPlexMono_400Regular',
    marginTop: 4,
  },
  successText: {
    color: tokens.brand.secondary,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontFamily: 'IBMPlexMono_400Regular',
    marginTop: 4,
    marginBottom: 12,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: 16,
  },
  forgotLinkText: {
    color: tokens.brand.secondary,
    fontSize: 13,
    fontFamily: 'IBMPlexMono_400Regular',
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: tokens.feedback?.error || '#ff6b6b',
  },
  errorBannerText: {
    color: tokens.feedback?.error || '#ff6b6b',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'IBMPlexMono_400Regular',
    textAlign: 'center',
  },
  warningBanner: {
    backgroundColor: 'rgba(255, 234, 67, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.neonYellow,
    alignItems: 'center',
  },
  warningText: {
    color: colors.neonYellow,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'IBMPlexMono_400Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.neonYellow,
  },
  retryButtonText: {
    color: colors.neonYellow,
    fontSize: 12,
    fontFamily: 'IBMPlexMono_700Bold',
    letterSpacing: 1,
  },
  buttonStack: {
    gap: 12,
  },
  helperText: {
    color: tokens.text.secondary,
    fontSize: 12,
    fontFamily: 'IBMPlexMono_400Regular',
    textAlign: 'center',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  devNote: {
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
})