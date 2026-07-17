// A generic attribute hub: a list of challenges ("practices") that award the
// attribute's XP when completed. Used for STR / WLTH / VIT / FOC (INT = Library).

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { colors, space, glow, ATTRS } from '../theme/tokens';
import { Label, Txt, Num } from '../components/typography';
import SystemWindow from '../components/SystemWindow';
import XpBar from '../components/XpBar';
import GlowButton from '../components/GlowButton';
import { useStore } from '../state/StoreContext';
import { practicesFor } from '../data/practices';

const COACH = { STR: 'The Trainer', WLTH: 'The Strategist', VIT: 'The Healer', FOC: 'The Ascetic' };

export default function ContentHub({ attr }) {
  const { state, actions } = useStore();
  const accent = ATTRS[attr]?.accent || colors.cyan;
  const done = state.practices?.done || {};
  const list = practicesFor(attr);
  const active = list.filter((p) => !done[p.id]);
  const cleared = list.filter((p) => done[p.id]);
  const pct = list.length ? cleared.length / list.length : 0;

  return (
    <View>
      {/* progress summary */}
      <SystemWindow style={{ marginBottom: space.md }} accent={accent} scan={false}>
        <View style={styles.sumRow}>
          <Label color={accent}>{COACH[attr] || 'Coach'}</Label>
          <Num color={accent}>{cleared.length} / {list.length} cleared</Num>
        </View>
        <View style={{ marginTop: space.sm }}>
          <XpBar pct={pct} color={accent} height={7} />
        </View>
      </SystemWindow>

      {active.map((p) => (
        <View key={p.id} style={[styles.card, glow(accent, 8, 0.12)]}>
          <View style={[styles.spine, { backgroundColor: accent }]} />
          <View style={styles.body}>
            <Txt style={{ fontSize: 16, color: colors.text }}>{p.title}</Txt>
            <Txt color={colors.muted} style={styles.desc}>{p.desc}</Txt>
            <View style={styles.foot}>
              <Num color={accent} style={{ fontSize: 14 }}>+{p.xp} {attr}</Num>
              <GlowButton
                label="Complete"
                size="sm"
                variant="primary"
                onPress={() => actions.completePractice(p)}
              />
            </View>
          </View>
        </View>
      ))}

      {cleared.length > 0 && (
        <SystemWindow style={{ marginTop: space.sm }} scan={false} accent={colors.gold}>
          <Label color={colors.gold} style={{ marginBottom: space.sm }}>Cleared ({cleared.length})</Label>
          {cleared.map((p) => (
            <View key={p.id} style={styles.clearedRow}>
              <Txt color={colors.muted} style={{ flex: 1 }}>✓ {p.title}</Txt>
              <Num color={colors.gold} style={{ fontSize: 12 }}>+{p.xp}</Num>
            </View>
          ))}
        </SystemWindow>
      )}

      {/* what's next — sets expectation + fills the screen */}
      <View style={styles.next}>
        <Label color={accent} style={{ marginBottom: 6 }}>What's next</Label>
        <Txt color={colors.muted} style={{ lineHeight: 20 }}>
          {COACH[attr] || 'Your coach'} assigns fresh, harder challenges here as your{' '}
          {ATTRS[attr]?.label} rank rises. Clear these first — prove you're ready, and the next tier unlocks.
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sumRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: {
    flexDirection: 'row', borderWidth: 1, borderColor: colors.line, borderRadius: 8,
    backgroundColor: colors.panel, marginBottom: space.md, overflow: 'hidden',
  },
  spine: { width: 6 },
  body: { flex: 1, padding: space.lg },
  desc: { fontSize: 13, marginTop: space.sm, lineHeight: 19 },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.lg },
  clearedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  next: {
    marginTop: space.lg, padding: space.lg, borderRadius: 8,
    borderWidth: 1, borderColor: colors.line2, borderStyle: 'dashed',
  },
});
