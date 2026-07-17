// A single book in the Library — recommendation / browse card.

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { colors, space, ATTRS } from '../theme/tokens';
import { Txt, Label, Num } from './typography';

export default function BookCard({ book, onAdd, state = 'add' }) {
  const accent = ATTRS[book.domain]?.accent || colors.cyan;
  const isAdd = state === 'add';

  return (
    <View style={[styles.card, { borderColor: colors.line }]}>
      <View style={[styles.spine, { backgroundColor: accent }]} />
      <View style={styles.body}>
        <View style={styles.headRow}>
          <View style={{ flex: 1, paddingRight: space.sm }}>
            <Txt style={styles.title}>{book.title}</Txt>
            <Label color={colors.muted} style={{ marginTop: 2 }}>{book.author}</Label>
          </View>
          <View style={[styles.tag, { borderColor: accent }]}>
            <Label color={accent} style={{ fontSize: 9 }}>{book.domain}</Label>
          </View>
        </View>

        <Txt color={colors.muted} style={styles.blurb}>{book.blurb}</Txt>

        <View style={styles.footRow}>
          <Num color={colors.gold} style={{ fontSize: 13 }}>+{book.xp} INT</Num>
          <Pressable
            onPress={isAdd ? onAdd : undefined}
            disabled={!isAdd}
            style={[styles.btn, isAdd ? { backgroundColor: colors.cyan } : { borderWidth: 1, borderColor: colors.line }]}
          >
            <Label color={isAdd ? colors.void : colors.muted}>
              {state === 'reading' ? 'Reading' : state === 'finished' ? '✓ Finished' : 'Add to shelf'}
            </Label>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: colors.panel,
    marginBottom: space.md,
    overflow: 'hidden',
  },
  spine: { width: 5 },
  body: { flex: 1, padding: space.md },
  headRow: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { fontSize: 16, color: colors.text },
  tag: { borderWidth: 1, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1 },
  blurb: { fontSize: 12, marginTop: space.sm, lineHeight: 17 },
  footRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.md },
  btn: { borderRadius: 4, paddingVertical: 6, paddingHorizontal: space.md },
});
