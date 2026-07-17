// Journal — a daily reflection tied to Focus. The first entry each day grants
// FOC XP. Past entries are saved per-account and browsable below.

import React, { useState } from 'react';
import { ScrollView, View, TextInput, StyleSheet, Keyboard } from 'react-native';
import { colors, space, fonts, glow } from '../theme/tokens';
import { Title, Label, Txt, Num } from '../components/typography';
import SystemWindow from '../components/SystemWindow';
import GlowButton from '../components/GlowButton';
import { useStore } from '../state/StoreContext';
import { dateKey } from '../logic/dates';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pretty(key) {
  const d = new Date(key + 'T00:00:00');
  return `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
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
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <View style={styles.head}>
        <View>
          <Label color={colors.cyanDim}>Focus</Label>
          <Title style={{ marginTop: 2 }}>Reflection Log</Title>
        </View>
        <View style={styles.count}>
          <Num color={colors.cyan} style={{ fontSize: 26 }}>{totalEntries}</Num>
          <Label>entries</Label>
        </View>
      </View>

      {/* Today's entry */}
      <SystemWindow style={styles.today} accent={colors.cyan}>
        <View style={styles.todayHead}>
          <Label color={colors.cyan}>Today · {pretty(today)}</Label>
          {savedToday && <Label color={colors.green}>✓ saved</Label>}
        </View>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="What did you conquer today? What resisted you? Where did the scroll try to pull you back?"
          placeholderTextColor={colors.muted}
          style={styles.input}
          multiline
        />
        <GlowButton
          label={savedToday ? 'UPDATE ENTRY' : 'SAVE · +20 FOCUS'}
          onPress={save}
          style={{ marginTop: space.md }}
        />
        {!savedToday && (
          <Txt color={colors.muted} style={{ fontSize: 12, marginTop: space.sm }}>
            Your first entry each day grants +20 Focus XP.
          </Txt>
        )}
      </SystemWindow>

      {/* History */}
      <View style={styles.histHead}>
        <Label>Past reflections</Label>
        {past.length > 0 && <Label color={colors.muted}>{past.length}</Label>}
      </View>

      {past.length === 0 ? (
        <View style={styles.empty}>
          <Txt color={colors.muted} style={{ textAlign: 'center', lineHeight: 20 }}>
            No past entries yet.{'\n'}Write today, and your history builds here — one day at a time.
          </Txt>
        </View>
      ) : (
        past.map((k) => (
          <View key={k} style={[styles.entry, glow(colors.cyan, 6, 0.08)]}>
            <View style={styles.entryBar} />
            <View style={{ flex: 1 }}>
              <Label color={colors.cyanDim}>{pretty(k)}</Label>
              <Txt color={colors.text} style={styles.entryText}>{state.journal[k]}</Txt>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: space.md, paddingTop: 56 },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  count: { alignItems: 'flex-end' },
  today: { marginTop: space.lg },
  todayHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    padding: space.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
    minHeight: 130,
    textAlignVertical: 'top',
    backgroundColor: '#161310',
    lineHeight: 22,
  },
  histHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xl, marginBottom: space.md },
  empty: {
    padding: space.xl, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.line2,
  },
  entry: {
    flexDirection: 'row', gap: space.md, backgroundColor: colors.panel,
    borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: space.md, marginBottom: space.md,
  },
  entryBar: { width: 3, borderRadius: 2, backgroundColor: colors.cyan },
  entryText: { marginTop: 6, lineHeight: 21, fontSize: 14.5 },
});
