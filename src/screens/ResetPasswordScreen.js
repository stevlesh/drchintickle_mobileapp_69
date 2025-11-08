import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import BackgroundContainer from '../components/BackgroundContainer';
import { colors } from '../theme/typography';
import { supabase } from '../lib/supabase';
import { resetTo } from '../navigation/navigationRef';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetPassword = async () => {
    if (loading) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(err.message || 'Failed to set new password');
      setLoading(false);
      return;
    }
    // Success: trigger full routing to honor onboarding checks
    resetTo('Loading');
  };

  return (
    <BackgroundContainer>
      <View style={styles.container}>
        <Text style={styles.title}>SET NEW PASSWORD</Text>
        {!!error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="New password"
          placeholderTextColor={colors.lightGray}
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          placeholderTextColor={colors.lightGray}
          secureTextEntry
          autoCapitalize="none"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleSetPassword} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>SET PASSWORD</Text>
          )}
        </TouchableOpacity>
      </View>
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: { color: colors.electricCyan, fontFamily: 'IBMPlexMono_700Bold', fontSize: 20, marginBottom: 16, textAlign: 'center' },
  error: { color: '#ff6b6b', fontFamily: 'IBMPlexMono_400Regular', marginBottom: 12, textAlign: 'center' },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: colors.electricCyan,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: colors.white,
    fontFamily: 'IBMPlexMono_400Regular',
    marginBottom: 12,
  },
  button: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.hotPink,
    borderWidth: 1,
    borderColor: colors.electricCyan,
    marginTop: 4,
  },
  buttonText: {
    color: colors.white,
    fontFamily: 'IBMPlexMono_700Bold',
    letterSpacing: 1,
  },
});


