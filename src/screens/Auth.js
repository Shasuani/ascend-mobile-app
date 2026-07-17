// Sign-up / login gate. Themed as accessing "the System".

import React, { useState } from 'react';
import { View, ScrollView, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, space, fonts } from '../theme/tokens';
import { Title, Label, Txt } from '../components/typography';
import SystemWindow from '../components/SystemWindow';
import GlowButton from '../components/GlowButton';
import { useAuth } from '../auth/AuthContext';

function Field({ label, value, onChange, secure, keyboard }) {
  return (
    <View style={{ marginBottom: space.md }}>
      <Label>{label}</Label>
      <TextInput
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        keyboardType={keyboard}
        autoCapitalize={secure || keyboard === 'email-address' ? 'none' : 'words'}
        autoCorrect={false}
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
    </View>
  );
}

export default function Auth() {
  const { actions } = useAuth();
  const [mode, setMode] = useState('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';

  const submit = () => {
    setError('');
    const res = isSignup
      ? actions.signUp({ name, email, password })
      : actions.logIn({ email, password });
    if (!res.ok) setError(res.error);
    // On success, AuthProvider flips `user` → the app leaves this screen.
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Title style={styles.logo}>ASCEND</Title>
          <Label color={colors.cyanDim}>The System awaits</Label>
        </View>

        <SystemWindow style={styles.card}>
          <Title style={{ fontSize: 18 }}>{isSignup ? 'Register Player' : 'Access the System'}</Title>
          <Txt color={colors.muted} style={{ marginTop: 4, marginBottom: space.lg }}>
            {isSignup ? 'Create your account to begin.' : 'Log in to resume your ascent.'}
          </Txt>

          {isSignup && <Field label="Name" value={name} onChange={setName} />}
          <Field label="Email" value={email} onChange={setEmail} keyboard="email-address" />
          <Field label="Password" value={password} onChange={setPassword} secure />

          {!!error && <Txt color={colors.red} style={{ marginBottom: space.md }}>{error}</Txt>}

          <GlowButton
            label={isSignup ? 'CREATE ACCOUNT' : 'LOG IN'}
            onPress={submit}
            style={{ marginTop: space.sm }}
          />
        </SystemWindow>

        <Pressable
          onPress={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); }}
          style={styles.toggle}
        >
          <Txt color={colors.muted}>
            {isSignup ? 'Already registered? ' : 'New here? '}
            <Txt color={colors.cyan}>{isSignup ? 'Log in' : 'Create an account'}</Txt>
          </Txt>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: space.lg, paddingTop: 90, paddingBottom: 48, flexGrow: 1 },
  brand: { alignItems: 'center', marginBottom: space.xl },
  logo: {
    fontSize: 42, letterSpacing: 6,
    textShadowColor: colors.cyan, textShadowRadius: 16, textShadowOffset: { width: 0, height: 0 },
  },
  card: { marginTop: space.md },
  input: {
    marginTop: space.xs,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 4,
    padding: space.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    backgroundColor: '#161310',
  },
  toggle: { alignItems: 'center', marginTop: space.xl },
});
