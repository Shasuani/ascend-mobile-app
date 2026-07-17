// Main board (§7, §11): status window, attributes, daily quests, weekly trial,
// footer — plus penalty banner, level-up, and the weekly System Report.

import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, space, fonts, glow, gradients, ATTRS, ATTR_ORDER } from '../theme/tokens';
import { Title, Label, Txt, Num } from '../components/typography';
import GlowButton from '../components/GlowButton';
import SystemWindow from '../components/SystemWindow';
import AttributeRadar from '../components/AttributeRadar';
import XpBar from '../components/XpBar';
import QuestRow from '../components/QuestRow';
import PenaltyBanner from '../components/PenaltyBanner';
import SystemDirective from '../components/SystemDirective';
import LevelUpModal from '../components/LevelUpModal';
import SystemReportModal from '../components/SystemReportModal';
import SettingsModal from '../components/SettingsModal';
import useCountdown from '../hooks/useCountdown';
import { dateKey } from '../logic/dates';
import { localRecap } from '../logic/review';
import { titleFor } from '../logic/achievements';
import { useStore } from '../state/StoreContext';
import { useAuth } from '../auth/AuthContext';

const ATTR_DISPLAY_MAX = 30;

export default function Main() {
  const { state, stats, board, isWorkToday, reviewReady, actions } = useStore();
  const { actions: authActions } = useAuth();
  const countdown = useCountdown();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [report, setReport] = useState(null);
  const [levelUp, setLevelUp] = useState(null);
  const prevLevel = useRef(stats.level);
  const reviewRan = useRef(false);

  // Detect a level increase → celebrate.
  useEffect(() => {
    if (stats.level > prevLevel.current) setLevelUp(stats.level);
    prevLevel.current = stats.level;
  }, [stats.level]);

  // Auto-run the weekly review when it's due (§9), then show the report.
  useEffect(() => {
    if (reviewReady && !reviewRan.current) {
      reviewRan.current = true;
      actions.runReview().then((r) => setReport(r));
    }
  }, [reviewReady]);

  const todayEntry = state.progress[dateKey()] || {};
  const doneCount = board.filter((q) => todayEntry[q.id]).length;
  const boss = state.week?.boss;
  const bossDone = boss ? !!todayEntry[boss.id] : false;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SystemDirective />

        {reviewReady && (
          <Pressable style={styles.reviewBanner} onPress={() => actions.runReview().then(setReport)}>
            <Label color={colors.cyan}>System Report ready — tap to view</Label>
          </Pressable>
        )}

        {/* ---- Status window ---- */}
        <SystemWindow style={styles.block}>
          <View style={styles.statusTop}>
            <LinearGradient colors={['#5a2a10', '#12100c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.rankBadge}>
              <Num color={colors.cyanBright} style={styles.rankLetter}>{stats.rank}</Num>
              <Label color={colors.cyan} style={{ fontSize: 8 }}>RANK</Label>
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: space.md }}>
              <TextInput
                value={state.name}
                onChangeText={actions.setName}
                style={styles.name}
                maxLength={16}
              />
              <Label color={colors.gold} style={{ marginTop: 2 }}>{titleFor(stats.rank)}</Label>
              <View style={styles.levelRow}>
                <Label>Level</Label>
                <Num color={colors.cyan} style={{ fontSize: 18 }}>{stats.level}</Num>
                <Num color={colors.muted} style={{ fontSize: 12 }}>
                  {stats.xpInto}/{stats.xpNeed} XP
                </Num>
              </View>
              <XpBar pct={stats.xpPct} />
            </View>
          </View>

          <View style={styles.radarWrap}>
            <AttributeRadar attributes={stats.attributes} />
          </View>
        </SystemWindow>

        {/* ---- Attributes ---- */}
        <SystemWindow style={styles.block} scan={false}>
          <View style={styles.blockHead}>
            <Label>Attributes</Label>
            {stats.freePoints > 0 && (
              <Label color={colors.gold}>{stats.freePoints} points to allocate</Label>
            )}
          </View>
          {ATTR_ORDER.map((k) => {
            const a = stats.attributes[k];
            const meta = ATTRS[k];
            const isFocus = state.profile.focusAreas.includes(k);
            return (
              <View key={k} style={styles.attrRow}>
                <View style={styles.attrLabel}>
                  <Txt color={meta.accent} style={{ fontSize: 14 }}>
                    {isFocus ? '◆ ' : ''}{k}
                  </Txt>
                </View>
                <View style={{ flex: 1, marginHorizontal: space.md }}>
                  <XpBar pct={a.value / ATTR_DISPLAY_MAX} color={meta.accent} height={6} />
                </View>
                <Num color={colors.text} style={{ width: 28, textAlign: 'right' }}>{a.value}</Num>
                {stats.freePoints > 0 ? (
                  <Pressable onPress={() => actions.allocatePoint(k)} style={styles.plus}>
                    <Txt color={colors.void} style={{ fontFamily: fonts.displayBold }}>＋</Txt>
                  </Pressable>
                ) : (
                  <View style={styles.plusSpacer} />
                )}
              </View>
            );
          })}
        </SystemWindow>

        {/* ---- Daily quests ---- */}
        <SystemWindow style={styles.block}>
          <View style={styles.blockHead}>
            <Title style={{ fontSize: 16 }}>⚠ {isWorkToday ? 'DAILY QUESTS' : 'REST DAY'}</Title>
            <Num color={colors.red}>{countdown}</Num>
          </View>
          <Label color={colors.muted} style={{ marginBottom: space.sm }}>
            {doneCount}/{board.length} complete · resets at midnight
          </Label>
          {board.length === 0 && <Txt color={colors.muted}>No quests assigned.</Txt>}
          {board.map((q) => (
            <QuestRow key={q.id} quest={q} done={!!todayEntry[q.id]} onToggle={() => actions.toggleQuest(q)} />
          ))}
        </SystemWindow>

        {/* ---- Weekly Trial (boss) ---- */}
        {boss && (
          <SystemWindow style={styles.block} accent={colors.gold} scan={false}>
            <Label color={colors.gold}>Weekly Trial</Label>
            <Title style={{ marginTop: 4 }}>{boss.title}</Title>
            <Txt color={colors.muted} style={{ marginTop: 4 }}>{boss.why}</Txt>
            <View style={styles.bossRow}>
              <Num color={colors.gold} style={{ fontSize: 18 }}>+{boss.xp} XP</Num>
              <GlowButton
                label={bossDone ? 'CLEARED' : 'CLAIM'}
                variant="gold"
                disabled={bossDone}
                onPress={actions.claimBoss}
              />
            </View>
          </SystemWindow>
        )}

        {/* ---- Footer ---- */}
        <View style={styles.footer}>
          <View style={styles.streak}>
            <Txt style={{ fontSize: 18 }}>🔥</Txt>
            <Num color={colors.gold} style={{ fontSize: 18 }}>{state.streak}</Num>
            <Label>streak</Label>
          </View>
          <View style={styles.footerBtns}>
            <GlowButton label="Regenerate" variant="ghost" size="sm" onPress={actions.regenerate} />
            <GlowButton label="Edit" variant="ghost" size="sm" onPress={actions.recalibrate} />
            <Pressable onPress={() => setSettingsOpen(true)} style={styles.gear}><Txt color={colors.muted} style={{ fontSize: 20 }}>⚙</Txt></Pressable>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {state.penalty?.active && (
        <PenaltyBanner message={state.penalty.message} onDismiss={actions.dismissPenalty} />
      )}

      <LevelUpModal visible={levelUp != null} level={levelUp || stats.level} onClose={() => setLevelUp(null)} />

      {report && (
        <SystemReportModal
          report={report}
          recap={report.recap || localRecap(report, state.profile.goalText)}
          onClose={() => { setReport(null); actions.clearReport(); reviewRan.current = false; }}
        />
      )}

      <SettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onReview={() => actions.runReview().then(setReport)}
        onReset={actions.resetAll}
        onLogout={authActions.logOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: space.md, paddingTop: 56 },
  block: { marginBottom: space.md },
  blockHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.sm },

  statusTop: { flexDirection: 'row', alignItems: 'center' },
  rankBadge: {
    width: 66, height: 66, borderRadius: 4, borderWidth: 1, borderColor: colors.cyan,
    alignItems: 'center', justifyContent: 'center',
    ...glow(colors.cyan, 14, 0.6),
  },
  rankLetter: { fontSize: 34, lineHeight: 38 },
  name: {
    fontFamily: fonts.displayBold, color: colors.text, fontSize: 22, letterSpacing: 1, padding: 0,
    textShadowColor: colors.cyan, textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 },
  },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginVertical: 4 },
  radarWrap: { alignItems: 'center', marginTop: space.md },

  attrRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.sm },
  attrLabel: { width: 44 },
  plus: {
    width: 26, height: 26, marginLeft: space.sm, borderRadius: 4, backgroundColor: colors.cyan,
    alignItems: 'center', justifyContent: 'center',
    ...glow(colors.cyan, 8, 0.6),
  },
  plusSpacer: { width: 26, marginLeft: space.sm },
  gear: { padding: space.sm },

  bossRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.md },
  bossBtn: { backgroundColor: colors.gold, borderRadius: 4, paddingVertical: space.sm, paddingHorizontal: space.xl },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.sm },
  streak: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  footerBtns: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  footBtn: { padding: space.sm },

  reviewBanner: {
    borderWidth: 1, borderColor: colors.cyan, borderRadius: 4, padding: space.md,
    alignItems: 'center', marginBottom: space.md, backgroundColor: colors.cyanDeep,
  },
});
