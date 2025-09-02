import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { colors, textStyles } from '../theme/typography';
import BackgroundContainer from '../components/BackgroundContainer';
import GlassCard from '../components/GlassCard';
import NeonButton from '../components/NeonButton';
import NeonHeader from '../components/NeonHeader';

const EmailConfirmationScreen = ({ navigation }) => {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check email confirmation status periodically
  useEffect(() => {
    const checkEmailConfirmation = async () => {
      setChecking(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          // Use server-side RPC to check complete state
          const { data, error } = await supabase
            .rpc('get_user_app_state', { user_id: session.user.id });
          
          if (!error && data?.email_confirmed) {
            console.log('Email confirmed! Navigating to next screen...');
            // Navigate based on server response using reset
            if (data.needs_onboarding) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Onboarding' }],
              });
            } else {
              // Always go to home page after email confirmation
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            }
          }
        }
      } catch (error) {
        console.error('Error checking email confirmation:', error);
      } finally {
        setChecking(false);
      }
    };

    // Check immediately
    checkEmailConfirmation();

    // Then check every 3 seconds
    const interval = setInterval(checkEmailConfirmation, 3000);
    return () => clearInterval(interval);
  }, [navigation]);

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    
    setResending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: session.user.email,
        });
        
        if (error) throw error;
        
        // Set 60 second cooldown
        setResendCooldown(60);
        console.log('Confirmation email resent');
      }
    } catch (error) {
      console.error('Error resending email:', error);
    } finally {
      setResending(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <BackgroundContainer>
      <SafeAreaView style={styles.container}>
        <NeonHeader 
          subtitle="JUST ONE MORE STEP" 
          showPalmTrees={true}
          titleSize={42}
          subtitleSize={14}
        />
        
        <GlassCard borderColor={colors.electricCyan} glowColor={colors.electricCyan} style={styles.card}>
          <Text style={[textStyles.subTitle, styles.cardTitle]}>
            CHECK YOUR EMAIL
          </Text>
          
          <Text style={[textStyles.infoLabel, styles.message]}>
            We've sent a confirmation link to your email address. 
            Click the link to activate your account and start your journey to 69 pull-ups!
          </Text>
          
          {checking && (
            <View style={styles.checkingContainer}>
              <ActivityIndicator size="small" color={colors.electricCyan} />
              <Text style={[textStyles.smallText, styles.checkingText]}>
                Checking confirmation status...
              </Text>
            </View>
          )}
        </GlassCard>

        <GlassCard borderColor={colors.hotPink} glowColor={colors.hotPink} style={styles.card}>
          <Text style={[textStyles.accentLabel, styles.tipTitle]}>
            PRO TIP
          </Text>
          <Text style={[textStyles.bodyText, styles.tipText]}>
            Check your spam folder if you don't see the email within 2 minutes.
          </Text>
        </GlassCard>

        <View style={styles.buttonContainer}>
          <NeonButton
            title={resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "RESEND EMAIL"}
            onPress={handleResendEmail}
            loading={resending}
            disabled={resendCooldown > 0 || resending}
            variant="primary"
            style={styles.button}
          />
          
          <NeonButton
            title="SIGN OUT"
            onPress={handleSignOut}
            variant="secondary"
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    color: colors.electricCyan,
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: colors.electricCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  checkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  checkingText: {
    color: colors.lightGray,
  },
  tipTitle: {
    fontSize: 16,
    color: colors.hotPink,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
  },
  tipText: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.lightGray,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 20,
  },
  button: {
    width: '100%',
  },
});

export default EmailConfirmationScreen;