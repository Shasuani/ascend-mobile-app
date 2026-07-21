// The gate — "Enter the Dōjō". Themed as taking (or resuming) the vow. Ink ground,
// a 道 ensō, the ASCEND wordmark, today's precept, and underlined credential fields.

import React, { useState } from 'react';
import { View, ScrollView, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, space, fonts } from '../theme/tokens';
import { Label, Txt, Precept, Kanji } from '../components/typography';
import Enso from '../components/Enso';
import { preceptForToday, romanize, kanjiNum } from '../data/dokkodo';
import { dateKey } from '../logic/dates';
import { useAuth } from '../auth/AuthContext';

function Field({ label, value, onChange, secure, keyboard, placeholder }) {
  return (
    <View style={styles.field}>
      <Label color={colors.muted}>{label}</Label>
      <TextInput
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        keyboardType={keyboard}
        placeholder={placeholder}
        autoCapitalize={secure || keyboard === 'email-address' ? 'none' : 'words'}
        autoCorrect={false}
        placeholderTextColor={colors.faint}
        style={styles.input}
      />
    </View>
  );
}

export default function Auth() {
  const { actions } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';
  const precept = preceptForToday(dateKey());

  const submit = () => {
    setError('');
    const res = isSignup
      ? actions.signUp({ name, email, password })
      : actions.logIn({ email, password });
    if (!res.ok) setError(res.error);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* mark + tagline */}
        <View style={styles.brandRow}>
          <View style={styles.mark}>
            <Kanji heavy color={colors.ink} style={{ fontSize: 22, lineHeight: 26 }}>昇</Kanji>
          </View>
          <Label color={colors.muted} style={{ letterSpacing: 2.4 }}>The Way of Discipline</Label>
        </View>

        {/* ensō + wordmark */}
        <View style={styles.hero}>
          <Enso size={150} stroke={3.5} arc={238} rotate={-118}>
            <Kanji color={colors.text} style={{ fontSize: 54, lineHeight: 62 }}>道</Kanji>
          </Enso>
          <Txt style={styles.wordmark}>ASCEND</Txt>
          <Precept color={colors.muted3} style={styles.tagline}>The Way is in training.</Precept>
        </View>

        {/* precept divider */}
        <View style={styles.preceptRow}>
          <Kanji color={colors.cyan} style={styles.preceptNum}>{kanjiNum(precept.number)}</Kanji>
          <Precept color={colors.text2} style={styles.preceptText}>
            {precept.text} — precept {romanize(precept.number)} of the Dokkōdō.
          </Precept>
        </View>

        {/* credentials */}
        <View style={styles.form}>
          {isSignup && <Field label="Name" value={name} onChange={setName} placeholder="Your name" />}
          <Field label="Email" value={email} onChange={setEmail} keyboard="email-address" placeholder="hunter@ascend.os" />
          <Field label="Passcode" value={password} onChange={setPassword} secure placeholder="••••••••" />
        </View>

        {!!error && <Txt color={colors.cyanBright} style={{ marginTop: space.md }}>{error}</Txt>}

        <Pressable onPress={submit} style={styles.enter}>
          <Txt color={colors.text} style={styles.enterLabel}>{isSignup ? 'Take the vow' : 'Enter the Dōjō'}</Txt>
        </Pressable>

        <Pressable onPress={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); }} style={styles.toggle}>
          <Label color={colors.muted} style={{ letterSpacing: 1.6 }}>
            {isSignup ? '‹ Return · enter with an existing blade' : '＋ Take the vow · forge a new blade'}
          </Label>
        </Pressable>

        <Label color={colors.faint} style={styles.footer}>No network required · Offline-first · Local vault</Label>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 30, paddingTop: 60, paddingBottom: 40, flexGrow: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mark: {
    width: 38, height: 38, backgroundColor: colors.cyan,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.cyan, shadowOpacity: 0.6, shadowRadius: 14, shadowOffset: { width: 0, height: 6 },
  },

  hero: { alignItems: 'center', marginTop: 52 },
  wordmark: { fontFamily: fonts.serifMed, color: colors.text, fontSize: 54, letterSpacing: 8, marginTop: 22, paddingLeft: 8 },
  tagline: { fontSize: 18, marginTop: 6 },

  preceptRow: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line,
    paddingVertical: 16, marginTop: 34,
  },
  preceptNum: { fontSize: 15, lineHeight: 22 },
  preceptText: { flex: 1, fontSize: 16, lineHeight: 23 },

  form: { marginTop: 24, gap: 18 },
  field: { borderBottomWidth: 1.5, borderBottomColor: colors.line, paddingBottom: 8 },
  input: { marginTop: 6, color: colors.text2, fontFamily: fonts.serifMed, fontSize: 16, padding: 0 },

  enter: {
    marginTop: 28, backgroundColor: colors.cyan, paddingVertical: 16, alignItems: 'center',
    shadowColor: colors.cyan, shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
  },
  enterLabel: { fontFamily: fonts.serif, fontSize: 19, letterSpacing: 0.5 },

  toggle: { marginTop: 16, alignItems: 'center' },
  footer: { textAlign: 'center', marginTop: 'auto', paddingTop: 30, letterSpacing: 1.6 },
});
