import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackgroundContainer from '../components/BackgroundContainer';
import NeonHeader from '../components/NeonHeader';
import UnderlineFrame from '../components/UnderlineFrame';
import AnimatedBeachBallButton from '../components/AnimatedBeachBallButton';
import { Eye, EyeSlash, Champagne, Cigarette, ArrowLeft } from 'phosphor-react-native';
import { colors } from '../theme/typography';
import { tokens } from '../theme/tokens';
import { supabase } from '../lib/supabase';

export default function SignInScreen() {
  const navigation = useNavigation();
  const passwordRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => { if (email) setEmailError(''); }, [email]);
  useEffect(() => { if (password) setPasswordError(''); }, [password]);

  const validateEmail = () => {
    if (!email) { setEmailError('Email is required'); return false; }
    if (!email.includes('@') || !email.includes('.')) { setEmailError('Please enter a valid email'); return false; }
    return true;
  };

  const validatePassword = () => {
    if (!password) { setPasswordError('Password is required'); return false; }
    if (password.length < 6) { setPasswordError('Password must be at least 6 characters'); return false; }
    return true;
  };

  async function signInWithEmail() {
    setFormError('');
    if (!validateEmail() || !validatePassword()) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });
    if (error) {
      if (error.message.includes('Invalid login')) {
        setFormError('Invalid email or password');
      } else {
        setFormError(error.message);
      }
    }
    setLoading(false);
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
    } catch (e) {
      setFormError('Network error. Please try again.');
    }
  }

  return (
    <BackgroundContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <NeonHeader style={{ marginTop: 24 }} />

            {/* Email */}
            <View style={styles.inputBlock}>
              <UnderlineFrame style={{ marginBottom: emailError ? 8 : 0 }}>
                <View style={styles.inputWithIcon}>
                  <Champagne size={18} color={tokens.brand.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputBare, { paddingLeft: 30 }]}
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
                </View>
              </UnderlineFrame>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* Password */}
            <View style={[styles.inputBlock, { marginBottom: 8 }]}> 
              <UnderlineFrame style={{ marginBottom: passwordError ? 8 : 0 }}>
                <View style={styles.passwordContainer}>
                  <Cigarette size={18} color={tokens.brand.secondary} style={styles.inputIcon} />
                  <TextInput
                    ref={passwordRef}
                    style={[styles.inputBare, { paddingLeft: 30, paddingRight: 50 }]}
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
              </UnderlineFrame>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {/* Forgot password */}
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotLink} disabled={loading}>
              <Text style={styles.forgotLinkText}>Forgot password?</Text>
            </TouchableOpacity>
            {resetEmailSent && <Text style={styles.successText}>Password reset email sent.</Text>}

            {/* Form error */}
            {formError ? (<View style={styles.errorBanner}><Text style={styles.errorBannerText}>{formError}</Text></View>) : null}

            <AnimatedBeachBallButton
              label={loading ? "HOLD UP…" : "LET'S RIDE"}
              onPress={signInWithEmail}
              disabled={loading}
              showGloss={false}
              accessibilityLabel="Sign in to your account"
            />

            {/* Footer */}
            <TouchableOpacity onPress={() => navigation.replace('SignUp')}>
              <Text style={styles.switchText}>New here? <Text style={styles.switchLink}>Get jacked</Text></Text>
            </TouchableOpacity>

            {/* Footer Back control (ArrowLeft + label) */}
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel="Back"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.backFooterRow}
              >
                <ArrowLeft size={18} color={colors.electricCyan} />
                <Text style={styles.backFooterText}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40 },
  container: { flex: 1, paddingHorizontal: 24 },
  
  inputBlock: { marginBottom: 16 },
  inputBare: { height: 28, fontSize: 16, color: colors.white, fontFamily: 'IBMPlexMono_400Regular', letterSpacing: 1 },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: -2, zIndex: 1 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center' },
  eyeToggle: { position: 'absolute', right: 0, padding: 12, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: tokens.feedback?.error || '#ff6b6b', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontFamily: 'IBMPlexMono_400Regular', marginTop: 4 },
  errorBanner: { backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: tokens.feedback?.error || '#ff6b6b' },
  errorBannerText: { color: tokens.feedback?.error || '#ff6b6b', fontSize: 13, lineHeight: 18, fontFamily: 'IBMPlexMono_400Regular', textAlign: 'center' },
  successText: { color: tokens.brand.secondary, fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontFamily: 'IBMPlexMono_400Regular', marginTop: 4, marginBottom: 12 },
  forgotLink: { alignSelf: 'flex-end', padding: 4, marginBottom: 16 },
  forgotLinkText: { color: tokens.brand.primary, fontSize: 13, fontFamily: 'IBMPlexMono_400Regular', letterSpacing: 0.5, textDecorationLine: 'underline' },
  switchText: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 14, color: colors.mediumGray, textAlign: 'center', marginTop: 20 },
  switchLink: { color: colors.electricCyan, textDecorationLine: 'underline' },
  backFooterRow: { flexDirection: 'row', alignItems: 'center' },
  backFooterText: { color: colors.electricCyan, marginLeft: 6, fontFamily: 'IBMPlexMono_700Bold', textShadowColor: colors.electricCyan, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
});


