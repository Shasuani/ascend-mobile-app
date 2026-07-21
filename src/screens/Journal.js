// The Ledger (日記) — a daily reflection tied to Focus. The first entry each day
// grants FOC XP. Past entries are sealed below, newest first.

import React, { useState } from 'react';
import { ScrollView, View, TextInput, Pressable, StyleSheet, Keyboard } from 'react-native';
import { colors, space, fonts } from '../theme/tokens';
import { Title, Label, Txt, Num, Precept, Kanji } from '../components/typography';
import { useStore } from '../state/StoreContext';
import { dateKey } from '../logic/dates';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function pretty(key) {
  const d = new Date(key + 'T00:00:00');
  return `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
function shortDate(key) {
  const d = new Date(key + 'T00:00:00');
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export default function Journal() {
  const { state, actions } = useStore();
  const today = dateKey();
  const [text, setText] = useState(state.journal?.[today] || '');
  const savedToday = !!state.journal?.[today];

  const past = Object.keys(state.journal || {})
    .filter((k) => k !== today && state.journal[k]?.trim())
    .sort()
    .reverse();

  const totalEntries = Object.values(state.journal || {}).filter((t) => t && t.trim()).length;

  const save = () => {
    if (!text.trim()) return;
    actions.saveJournal(text);
    Keyboard.dismiss();
  };

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.head}>
        <View style={styles.headTitle}>
          <Kanji color={colors.text} style={{ fontSize: 22 }}>日記</Kanji>
          <Title style={{ fontSize: 22 }}> · The Ledger</Title>
        </View>
        <View style={styles.count}>
          <Num color={colors.cyan} style={{ fontSize: 24 }}>{totalEntries}</Num>
          <Label color={colors.muted} style={{ fontSize: 9 }}>Entries</Label>
        </View>
      </View>

      {/* Today's entry */}
      <View style={styles.today}>
        <Num color={colors.cyan} style={styles.todayDate}>TODAY · {pretty(today)}</Num>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="What did the Way ask of you today? Where did you falter?"
          placeholderTextColor={colors.muted}
          style={styles.input}
          multiline
        />
        <View style={styles.todayFoot}>
          <Num color={colors.muted} style={{ fontSize: 9.5 }}>
            {savedToday ? '✓ SEALED' : 'FIRST ENTRY · +20 FOCUS'}
          </Num>
          <Pressable onPress={save} style={styles.seal}>
            <Title color={colors.text} style={{ fontSize: 14 }}>{savedToday ? 'Reseal' : 'Seal it'}</Title>
          </Pressable>
        </View>
      </View>

      {/* History */}
      <View style={styles.histHead}>
        <Label color={colors.muted}>Past Reflections</Label>
        {past.length > 0 && <Num color={colors.muted} style={{ fontSize: 11 }}>{past.length}</Num>}
      </View>

      {past.length === 0 ? (
        <View style={styles.empty}>
          <Precept color={colors.muted2} style={{ textAlign: 'center', lineHeight: 22 }}>
            No sealed reflections yet. Write today, and your ledger builds — one day at a time.
          </Precept>
        </View>
      ) : (
        past.map((k) => (
          <View key={k} style={styles.entry}>
            <View style={styles.entryHead}>
              <Num color={colors.text} style={styles.entryDate}>{shortDate(k)}</Num>
              <View style={styles.tag}><Num color={colors.cyan} style={{ fontSize: 9 }}>SEALED</Num></View>
            </View>
            <Precept color={colors.text2} style={styles.entryText}>{state.journal[k]}</Precept>
          </View>
        ))
      )}

      <View style={{ height: 90 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: space.xl, paddingTop: 64 },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headTitle: { flexDirection: 'row', alignItems: 'baseline' },
  count: { alignItems: 'flex-end' },

  today: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, padding: 16, marginTop: space.lg },
  todayDate: { fontSize: 11, letterSpacing: 1 },
  input: {
    color: colors.text, fontFamily: fonts.body, fontSize: 16, lineHeight: 23,
    minHeight: 84, textAlignVertical: 'top', marginTop: 10,
  },
  todayFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12, marginTop: 8 },
  seal: { backgroundColor: colors.cyan, paddingVertical: 8, paddingHorizontal: 20 },

  histHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xl, marginBottom: space.md },
  empty: { borderWidth: 1, borderColor: colors.line2, padding: space.xl },

  entry: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 16, marginBottom: 14 },
  entryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  entryDate: { fontSize: 11, letterSpacing: 1 },
  tag: { borderWidth: 1, borderColor: colors.crimsonLine, paddingHorizontal: 8, paddingVertical: 2 },
  entryText: { fontSize: 16, lineHeight: 23 },
});
