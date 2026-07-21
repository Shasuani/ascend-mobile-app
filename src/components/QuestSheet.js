// Quest detail — a bottom sheet raised when a deed is tapped on the board. Shows
// its coach, merit/minutes/difficulty, the "why", the forfeit for breaking it, and
// a keep/undo action.

import React, { useEffect, useRef } from 'react';
import { Modal, View, Pressable, Animated, StyleSheet } from 'react-native';
import { colors, space } from '../theme/tokens';
import { Title, Label, Txt, Num, Precept, Kanji } from './typography';
import { coachFor } from '../logic/mastery';

function difficultyOf(xp) {
  return xp >= 110 ? 'HARD' : xp >= 60 ? 'MED' : 'EASY';
}

function StatBox({ value, label, accent }) {
  return (
    <View style={styles.statBox}>
      <Num color={accent ? colors.cyan : colors.text} style={styles.statValue}>{value}</Num>
      <Label color={colors.muted} style={{ fontSize: 8.5 }}>{label}</Label>
    </View>
  );
}

export default function QuestSheet({ quest, done, onToggle, onClose }) {
  const visible = !!quest;
  const y = useRef(new Animated.Value(40)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      y.setValue(40); fade.setValue(0);
      Animated.parallel([
        Animated.spring(y, { toValue: 0, useNativeDriver: true, friction: 8, tension: 70 }),
        Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, y, fade]);

  if (!quest) return null;
  const mins = quest.duration_min ? quest.duration_min : '—';
  const forfeit = Math.round((quest.xp || 0) / 2);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: y }] }]}>
          <View style={styles.head}>
            <View style={{ flex: 1 }}>
              <Num color={colors.cyan} style={styles.kicker}>{quest.window || 'ANYTIME'} · {coachFor(quest.attr)}</Num>
              <Title style={styles.title}>{quest.title}</Title>
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={{ padding: 4 }}>
              <Title color={colors.muted} style={{ fontSize: 22 }}>✕</Title>
            </Pressable>
          </View>

          <View style={styles.stats}>
            <StatBox value={`+${quest.xp || 0}`} label="MERIT" accent />
            <StatBox value={mins} label="MINUTES" />
            <StatBox value={difficultyOf(quest.xp || 0)} label="DIFFICULTY" />
          </View>

          {!!quest.why && <Precept color={colors.text2} style={styles.why}>{quest.why}</Precept>}

          <View style={styles.forfeit}>
            <Num color={colors.cyanDim} style={styles.forfeitText}>
              失 FORFEIT · break this and lose {forfeit} merit — the day is no longer perfect.
            </Num>
          </View>

          <Pressable onPress={() => { onToggle(); onClose(); }} style={[styles.action, done ? styles.actionUndo : styles.actionKeep]}>
            <Title color={done ? colors.cyan : colors.text} style={styles.actionLabel}>
              {done ? 'Undo — mark unkept' : 'Keep the way ✓'}
            </Title>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(5,4,3,0.8)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.panel, borderTopWidth: 2, borderTopColor: colors.cyan, padding: 26, paddingBottom: 40 },
  head: { flexDirection: 'row', alignItems: 'flex-start' },
  kicker: { fontSize: 10, letterSpacing: 1 },
  title: { fontSize: 27, lineHeight: 30, marginTop: 5 },

  stats: { flexDirection: 'row', gap: 10, marginTop: 18 },
  statBox: { flex: 1, borderWidth: 1, borderColor: colors.line, paddingVertical: 12, alignItems: 'center' },
  statValue: { fontSize: 17 },

  why: { fontSize: 16.5, lineHeight: 24, marginTop: 18 },

  forfeit: { borderLeftWidth: 2, borderLeftColor: colors.cyan, backgroundColor: colors.cyanDeep, paddingVertical: 11, paddingHorizontal: 14, marginTop: 16 },
  forfeitText: { fontSize: 10, lineHeight: 16 },

  action: { marginTop: 22, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: colors.cyan },
  actionKeep: { backgroundColor: colors.cyan },
  actionUndo: { backgroundColor: 'transparent' },
  actionLabel: { fontSize: 18, letterSpacing: 0.5 },
});
