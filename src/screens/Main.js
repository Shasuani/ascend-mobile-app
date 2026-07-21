// The home board — "Today's Way". Musashi framing over the level engine: a stage
// of mastery in an ensō, a daily Dokkōdō precept, the day's path, and the weekly
// trial. Visual match to the Musashi prototype; all state/actions preserved.

import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, space, gradients } from '../theme/tokens';
import { Title, Label, Txt, Num, Precept, Kanji } from '../components/typography';
import Enso from '../components/Enso';
import QuestRow from '../components/QuestRow';
import QuestSheet from '../components/QuestSheet';
import PenaltyBanner from '../components/PenaltyBanner';
import LevelUpModal from '../components/LevelUpModal';
import SystemReportModal from '../components/SystemReportModal';
import Profile from './Profile';
import { dateKey, daysBetween } from '../logic/dates';
import { localRecap } from '../logic/review';
import { stageForLevel, nextStage } from '../logic/mastery';
import { preceptForToday, romanize, kanjiNum } from '../data/dokkodo';
import { useStore } from '../state/StoreContext';

export default function Main() {
  const { state, stats, board, isWorkToday, reviewReady, actions } = useStore();

  const [profileOpen, setProfileOpen] = useState(false);
  const [report, setReport] = useState(null);
  const [levelUp, setLevelUp] = useState(null);
  const [selected, setSelected] = useState(null);
  const prevLevel = useRef(stats.level);
  const reviewRan = useRef(false);

  useEffect(() => {
    if (stats.level > prevLevel.current) setLevelUp(stats.level);
    prevLevel.current = stats.level;
  }, [stats.level]);

  useEffect(() => {
    if (reviewReady && !reviewRan.current) {
      reviewRan.current = true;
      actions.runReview().then((r) => setReport(r));
    }
  }, [reviewReady]);

  const todayEntry = state.progress[dateKey()] || {};
  const doneCount = board.filter((q) => todayEntry[q.id]).length;
  const boss = state.week?.boss;
  const bossDone = !!state.bossClaimedDate && daysBetween(state.bossClaimedDate, dateKey()) < 7;

  const stage = stageForLevel(stats.level);
  const next = nextStage(stats.level);
  const precept = preceptForToday(dateKey());
  const meritPct = Math.round((stats.xpInto / Math.max(1, stats.xpNeed)) * 100);
  const presence = state.visitStreak || 0;
  const perfect = state.streak || 0;
  const trialGoal = 7;
  const trialProgress = Math.min(perfect, trialGoal);
  const pad2 = (n) => String(n).padStart(2, '0');

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ---- Header ---- */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.kicker}>
              <Kanji color={colors.muted} style={{ fontSize: 12 }}>武者</Kanji>
              <Label color={colors.muted}> · Hunter</Label>
            </View>
            <Title style={styles.name} numberOfLines={1}>{titleCase(state.name)}</Title>
          </View>
          <Pressable style={styles.profileBtn} onPress={() => setProfileOpen(true)}>
            <Kanji color={colors.muted2} style={{ fontSize: 18 }}>己</Kanji>
          </Pressable>
        </View>

        {reviewReady && (
          <Pressable style={styles.reviewBanner} onPress={() => actions.runReview().then(setReport)}>
            <Label color={colors.cyanBright}>The Report is ready — tap to face it</Label>
          </Pressable>
        )}

        {/* ---- Stage of mastery ---- */}
        <LinearGradient colors={gradients.panel} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.card}>
          <View style={styles.masteryTop}>
            <Enso size={72} stroke={4} arc={238} rotate={-118}>
              <Kanji color={colors.text} style={{ fontSize: 34, lineHeight: 40 }}>{stage.kanji}</Kanji>
            </Enso>
            <View style={{ flex: 1, marginLeft: 18 }}>
              <Label color={colors.muted}>Stage of Mastery</Label>
              <Title style={styles.stageName}>{stage.name}</Title>
              <Precept color={colors.muted3} style={styles.stageTitle}>{stage.title}</Precept>
            </View>
          </View>

          <View style={styles.meritHead}>
            <Num color={colors.muted} style={styles.meritLabel}>{up(stage.name)} → {next.name === stage.name ? 'MASTERY' : up(next.name)}</Num>
            <Num color={colors.muted3} style={styles.meritLabel}>{stats.xpInto} / {stats.xpNeed}</Num>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${meritPct}%` }]} />
          </View>

          <View style={styles.statRow}>
            <Stat value={presence} label="Day Presence" color={colors.text} />
            <Stat value={perfect} label="Perfect Days" color={colors.cyan} />
          </View>
        </LinearGradient>

        {/* ---- Daily Dokkōdō precept ---- */}
        <View style={styles.precept}>
          <Kanji color={colors.cyan} style={styles.preceptKanji}>{kanjiNum(precept.number)}</Kanji>
          <View style={{ flex: 1 }}>
            <Label color={colors.muted}>Dokkōdō · Precept {romanize(precept.number)}</Label>
            <Precept color={colors.text3} style={styles.preceptText}>{precept.text}</Precept>
          </View>
        </View>

        {/* ---- Today's Way (the daily path) ---- */}
        <View style={styles.programHead}>
          <View style={styles.programTitle}>
            <Kanji color={colors.text} style={{ fontSize: 17 }}>今日の道</Kanji>
            <Title style={{ fontSize: 18 }}> · {isWorkToday ? "Today's Way" : 'Day of Rest'}</Title>
          </View>
          <Num color={colors.cyan} style={{ fontSize: 11 }}>{pad2(doneCount)} / {pad2(board.length)} KEPT</Num>
        </View>

        {board.length === 0 ? (
          <View style={styles.empty}><Txt color={colors.muted}>No path assigned.</Txt></View>
        ) : (
          <View style={styles.list}>
            {board.map((q, i) => (
              <QuestRow
                key={q.id}
                quest={q}
                done={!!todayEntry[q.id]}
                onToggle={() => actions.toggleQuest(q)}
                onOpen={() => setSelected(q)}
                last={i === board.length - 1}
              />
            ))}
          </View>
        )}

        {/* ---- The weekly trial ---- */}
        {boss && (
          <LinearGradient colors={gradients.panelHot} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.trial}>
            <View style={styles.trialTop}>
              <View style={styles.trialHead}>
                <Kanji heavy color={colors.cyan} style={{ fontSize: 28, lineHeight: 32 }}>試</Kanji>
                <View>
                  <Label color={colors.cyanDim}>Weekly Trial</Label>
                  <Title style={{ fontSize: 18 }} numberOfLines={1}>{boss.title}</Title>
                </View>
              </View>
              <Num color={colors.text} style={{ fontSize: 15 }}>{trialProgress}<Num color={colors.muted} style={{ fontSize: 15 }}>/{trialGoal}</Num></Num>
            </View>
            <View style={styles.dots}>
              {Array.from({ length: trialGoal }).map((_, i) => (
                <View key={i} style={[styles.dot, { backgroundColor: i < trialProgress ? colors.cyan : colors.line }]} />
              ))}
            </View>
            <Pressable
              onPress={!bossDone && trialProgress >= trialGoal ? actions.claimBoss : undefined}
              style={[styles.claim, bossDone ? styles.claimDone : trialProgress >= trialGoal ? styles.claimReady : styles.claimWait]}
            >
              <Title color={bossDone ? colors.muted : trialProgress >= trialGoal ? colors.text : colors.muted2} style={{ fontSize: 15 }}>
                {bossDone ? `Trial claimed · +${boss.xp} merit` : trialProgress >= trialGoal ? `Claim the trial  →` : `Keep the vow · ${trialGoal - trialProgress} days left`}
              </Title>
            </Pressable>
          </LinearGradient>
        )}

        {/* ---- Discreet path controls ---- */}
        <View style={styles.footer}>
          <Pressable onPress={actions.regenerate}><Label color={colors.muted}>↻ Renew path</Label></Pressable>
          <Pressable onPress={actions.recalibrate}><Label color={colors.muted}>✎ Edit profile</Label></Pressable>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {state.penalty?.active && (
        <PenaltyBanner message={state.penalty.message} onDismiss={actions.dismissPenalty} />
      )}

      <QuestSheet
        quest={selected}
        done={selected ? !!todayEntry[selected.id] : false}
        onToggle={() => selected && actions.toggleQuest(selected)}
        onClose={() => setSelected(null)}
      />

      <LevelUpModal visible={levelUp != null} level={levelUp || stats.level} onClose={() => setLevelUp(null)} />

      {report && (
        <SystemReportModal
          report={report}
          recap={report.recap || localRecap(report, state.profile.goalText)}
          onClose={() => { setReport(null); actions.clearReport(); reviewRan.current = false; }}
        />
      )}

      <Profile
        visible={profileOpen}
        onClose={() => setProfileOpen(false)}
        onReview={() => actions.runReview().then(setReport)}
      />
    </View>
  );
}

function Stat({ value, label, color }) {
  return (
    <View style={styles.stat}>
      <Num color={color} style={styles.statValue}>{value}</Num>
      <Label color={colors.muted} style={styles.statLabel}>{label}</Label>
    </View>
  );
}

// Names are stored uppercased; show them in Title Case for the serif display.
function titleCase(s) {
  return String(s || 'Hunter').toLowerCase().replace(/(^|[\s.])\w/g, (c) => c.toUpperCase());
}
const up = (s) => String(s || '').toUpperCase();

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: space.xl, paddingTop: 64, paddingBottom: space.lg },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  kicker: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 24, marginTop: 1 },
  profileBtn: { width: 42, height: 42, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },

  card: { borderWidth: 1, borderColor: colors.line, padding: 20 },
  masteryTop: { flexDirection: 'row', alignItems: 'center' },
  stageName: { fontSize: 27, lineHeight: 30, marginTop: 1 },
  stageTitle: { fontSize: 14, marginTop: 2 },

  meritHead: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 6 },
  meritLabel: { fontSize: 9.5, letterSpacing: 0.6 },
  track: { height: 5, backgroundColor: colors.line2 },
  fill: { height: '100%', backgroundColor: colors.cyan },

  statRow: { flexDirection: 'row', marginTop: 16, gap: space.xl },
  stat: { flexDirection: 'row', alignItems: 'baseline' },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 9, marginLeft: 5 },

  precept: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', borderLeftWidth: 2, borderLeftColor: colors.cyan, paddingLeft: 16, marginTop: 20 },
  preceptKanji: { fontSize: 22, lineHeight: 24 },
  preceptText: { fontSize: 17, lineHeight: 24, marginTop: 4 },

  programHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 24, marginBottom: 14 },
  programTitle: { flexDirection: 'row', alignItems: 'baseline' },

  list: { borderWidth: 1, borderColor: colors.line },
  empty: { borderWidth: 1, borderColor: colors.line, padding: space.lg, alignItems: 'center' },

  trial: { borderWidth: 1, borderColor: colors.crimsonLine, padding: 18, marginTop: 20 },
  trialTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trialHead: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  dots: { flexDirection: 'row', gap: 5, marginTop: 14 },
  dot: { flex: 1, height: 6 },
  claim: { marginTop: 16, paddingVertical: 12, alignItems: 'center', borderWidth: 1 },
  claimReady: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  claimWait: { backgroundColor: 'transparent', borderColor: colors.crimsonLine },
  claimDone: { backgroundColor: 'transparent', borderColor: colors.crimsonLine },

  footer: { flexDirection: 'row', justifyContent: 'center', gap: space.xxl, marginTop: 22 },

  reviewBanner: {
    borderWidth: 1, borderColor: colors.cyan, padding: space.md,
    alignItems: 'center', marginBottom: space.md, backgroundColor: colors.cyanDeep,
  },
});
