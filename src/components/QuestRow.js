// One line of the day's path. Left rail: the ring's element kanji over a round
// check (tap to keep/unkeep). Body: the deed, its coach, minutes and merit — tap
// to open its detail. Kept deeds fade and tint faintly crimson.

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { colors, space } from '../theme/tokens';
import { Title, Num, Txt, Kanji } from './typography';
import { ringKanji, coachFor } from '../logic/mastery';

export default function QuestRow({ quest, done, onToggle, onOpen, last }) {
  const mins = quest.duration_min ? `${quest.duration_min}m` : 'VOW';
  return (
    <View style={[styles.row, done && styles.rowDone, last && styles.rowLast]}>
      <Pressable onPress={onToggle} style={styles.rail} hitSlop={6}>
        <Kanji color={colors.muted} style={styles.kanji}>{ringKanji(quest.attr)}</Kanji>
        <View style={[styles.check, done ? styles.checkOn : styles.checkOff]}>
          {done && <Txt color={colors.ink} style={styles.tick}>✓</Txt>}
        </View>
      </Pressable>

      <Pressable onPress={onOpen || onToggle} style={styles.body}>
        <View style={{ flex: 1 }}>
          <Title style={styles.title} color={done ? colors.muted : colors.text} numberOfLines={2}>
            {quest.title}
          </Title>
          <Num color={colors.muted} style={styles.meta}>
            {coachFor(quest.attr)} · {mins} · +{quest.xp || 0} MERIT
          </Num>
        </View>
        <Title color={colors.faint} style={styles.chev}>›</Title>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch', backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.line2 },
  rowDone: { backgroundColor: 'rgba(224,30,55,0.05)' },
  rowLast: { borderBottomWidth: 0 },
  rail: {
    width: 56, alignItems: 'center', justifyContent: 'center', gap: 9,
    paddingVertical: 14, borderRightWidth: 1, borderRightColor: colors.line2,
  },
  kanji: { fontSize: 15, lineHeight: 18 },
  check: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  checkOff: { borderColor: colors.faint, backgroundColor: 'transparent' },
  checkOn: { borderColor: colors.cyan, backgroundColor: colors.cyan },
  tick: { fontSize: 13, lineHeight: 16 },
  body: { flex: 1, paddingVertical: 13, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  title: { fontSize: 17, lineHeight: 20, letterSpacing: 0.2 },
  meta: { fontSize: 9.5, marginTop: 4, letterSpacing: 0.4 },
  chev: { fontSize: 20, lineHeight: 22 },
});
