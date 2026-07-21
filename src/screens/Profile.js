// The Self (己) — identity, the trials passed (achievements), settings, and the
// vow's end (log out). Opened as a full-screen sheet from the board's 己 button.

import React from 'react';
import { Modal, View, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { colors, space } from '../theme/tokens';
import { Title, Label, Txt, Num, Precept, Kanji } from '../components/typography';
import { useStore } from '../state/StoreContext';
import { useAuth } from '../auth/AuthContext';
import { stageForLevel } from '../logic/mastery';
import { evaluateAchievements } from '../logic/achievements';
import { dateKey, daysBetween } from '../logic/dates';

const TRIAL_KANJI = {
  'first-quest': '一', 'quests-50': '励', 'quests-200': '鍛',
  'streak-3': '火', 'streak-7': '炎', 'streak-30': '不',
  'level-5': '昇', 'rank-c': '位', 'first-book': '書', 'books-5': '学',
  'practices-5': '挑', 'journal-7': '記',
};

function daysOnTheWay(state) {
  const keys = [...Object.keys(state.progress || {}), ...Object.keys(state.journal || {})]
    .filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k))
    .sort();
  return keys.length ? daysBetween(keys[0], dateKey()) + 1 : 1;
}

function titleCase(s) {
  return String(s || 'Hunter').toLowerCase().replace(/(^|[\s.])\w/g, (c) => c.toUpperCase());
}

export default function Profile({ visible, onClose, onReview }) {
  const { state, stats, actions } = useStore();
  const { actions: authActions } = useAuth();

  const stage = stageForLevel(stats.level);
  const trials = evaluateAchievements(state, stats);
  const days = daysOnTheWay(state);

  const confirmReset = () =>
    Alert.alert('Abandon the Way?', 'This wipes your stage, streaks and path. It cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => { actions.resetAll(); onClose(); } },
    ]);

  const settings = [
    { label: 'Notifications', val: 'ON' },
    { label: 'Daily reset time', val: '04:00' },
    { label: 'Account & vault', val: 'LOCAL' },
    { label: 'About ASCEND', val: 'v54' },
  ];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
          <View style={styles.head}>
            <View style={styles.headTitle}>
              <Kanji color={colors.text} style={{ fontSize: 22 }}>己</Kanji>
              <Title style={{ fontSize: 22 }}> · The Self</Title>
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={{ padding: 4 }}>
              <Title color={colors.muted} style={{ fontSize: 22 }}>✕</Title>
            </Pressable>
          </View>

          {/* identity */}
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Kanji heavy color={colors.cyan} style={{ fontSize: 30, lineHeight: 36 }}>昇</Kanji>
            </View>
            <View style={{ flex: 1 }}>
              <Title style={{ fontSize: 22 }} numberOfLines={1}>{titleCase(state.name)}</Title>
              <Precept color={colors.muted3} style={{ fontSize: 15, marginTop: 1 }}>{stage.name} · {stage.title}</Precept>
              <Num color={colors.muted} style={{ fontSize: 9.5, marginTop: 5 }}>ON THE WAY · {days} {days === 1 ? 'DAY' : 'DAYS'}</Num>
            </View>
          </View>

          {/* trials passed */}
          <Label color={colors.muted} style={{ marginTop: 24 }}>Trials Passed</Label>
          <View style={styles.grid}>
            {trials.map((t) => (
              <View key={t.id} style={[styles.trial, { borderColor: t.unlocked ? colors.crimsonLine : colors.line, backgroundColor: t.unlocked ? 'rgba(224,30,55,0.05)' : colors.card, opacity: t.unlocked ? 1 : 0.5 }]}>
                <Kanji color={t.unlocked ? colors.cyan : colors.faint} style={{ fontSize: 22, lineHeight: 26 }}>{TRIAL_KANJI[t.id] || '試'}</Kanji>
                <Title color={t.unlocked ? colors.text : colors.muted} style={{ fontSize: 15, marginTop: 8 }} numberOfLines={1}>{t.name}</Title>
                <Num color={colors.muted} style={{ fontSize: 9, marginTop: 4 }}>
                  {t.unlocked ? t.desc.toUpperCase() : `${Math.min(t.value, t.target)}/${t.target}`}
                </Num>
              </View>
            ))}
          </View>

          {/* settings */}
          <Label color={colors.muted} style={{ marginTop: 26 }}>Settings</Label>
          <View style={styles.settings}>
            <Pressable style={styles.setRow} onPress={() => { onClose(); onReview && onReview(); }}>
              <Txt color={colors.text3} style={styles.setLabel}>Run the System Report</Txt>
              <Num color={colors.cyan} style={styles.setVal}>NOW ›</Num>
            </Pressable>
            {settings.map((s) => (
              <View key={s.label} style={styles.setRow}>
                <Txt color={colors.text3} style={styles.setLabel}>{s.label}</Txt>
                <Num color={colors.muted} style={styles.setVal}>{s.val} ›</Num>
              </View>
            ))}
            <Pressable style={[styles.setRow, { borderBottomWidth: 0 }]} onPress={confirmReset}>
              <Txt color={colors.cyanBright} style={styles.setLabel}>Reset all progress</Txt>
              <Num color={colors.cyanBright} style={styles.setVal}>›</Num>
            </Pressable>
          </View>

          <Pressable onPress={() => { onClose(); authActions.logOut(); }} style={styles.logout}>
            <Title color={colors.cyan} style={{ fontSize: 16 }}>Sheathe the blade</Title>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.void },
  screen: { paddingHorizontal: space.xl, paddingTop: 64, paddingBottom: 24 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headTitle: { flexDirection: 'row', alignItems: 'baseline' },

  identity: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 20 },
  avatar: { width: 74, height: 74, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel2, alignItems: 'center', justifyContent: 'center' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12, rowGap: 10 },
  trial: { width: '48.5%', borderWidth: 1, padding: 14 },

  settings: { borderWidth: 1, borderColor: colors.line, marginTop: 12 },
  setRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.line2 },
  setLabel: { fontSize: 16 },
  setVal: { fontSize: 10.5 },

  logout: { marginTop: 20, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: colors.crimsonLine },
});
