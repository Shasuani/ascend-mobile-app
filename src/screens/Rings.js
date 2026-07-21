// The Five Rings (五輪書) — Musashi's five elements as ensō gauges, one per
// attribute. Tap a ring to spend a free point. Below: the harmony summary and the
// history charts (kept from the old Journey view).

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { colors, space, ATTR_ORDER } from '../theme/tokens';
import { Title, Label, Txt, Num, Precept, Kanji } from '../components/typography';
import Enso from '../components/Enso';
import BarChart from '../components/BarChart';
import { useStore } from '../state/StoreContext';
import { stageForLevel, ringFor, ringKanji, RING_MEANING } from '../logic/mastery';
import { dailyXpSeries, dailyCompletionSeries } from '../logic/history';

const MAX = 40; // gauge full-scale for an attribute value

function Ring({ k, value, canAdd, onAllocate }) {
  return (
    <Pressable style={styles.ring} disabled={!canAdd} onPress={() => onAllocate && onAllocate(k)}>
      <Enso size={104} stroke={5} arc={224} rotate={-122} fillPct={value / MAX} trackColor={'#241a16'}>
        <Kanji color={colors.text} style={styles.ringKanji}>{ringKanji(k)}</Kanji>
        {canAdd && (
          <View style={styles.plus}><Num color={colors.cyan} style={{ fontSize: 12 }}>＋</Num></View>
        )}
      </Enso>
      <Num color={colors.text} style={styles.ringName}>
        {ringFor(k).toUpperCase()} <Num color={colors.cyan} style={styles.ringVal}>{value}</Num>
      </Num>
      <Precept color={colors.muted2} style={styles.ringMeaning}>{RING_MEANING[k]}</Precept>
    </Pressable>
  );
}

export default function Rings() {
  const { state, stats, actions } = useStore();
  const canAdd = stats.freePoints > 0;

  const values = ATTR_ORDER.map((k) => stats.attributes[k].value);
  const harmony = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const stage = stageForLevel(stats.level);

  const xpData = dailyXpSeries(state, 14).map((d) => ({ label: d.label, value: d.xp }));
  const compData = dailyCompletionSeries(state, 14).map((d) => ({ label: d.label, value: Math.round(d.pct * 100) }));

  return (
    <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.head}>
        <Kanji color={colors.text} style={{ fontSize: 22 }}>五輪書</Kanji>
        <Title style={{ fontSize: 22 }}> · The Five Rings</Title>
      </View>
      <Precept color={colors.muted2} style={styles.subtitle}>Know the smallest things and the biggest things.</Precept>
      {canAdd && <Label color={colors.cyan} style={{ marginTop: space.md }}>◆ {stats.freePoints} to allocate — tap a ring</Label>}

      {/* 2×2 grid + Void centered below */}
      <View style={styles.grid}>
        {ATTR_ORDER.slice(0, 4).map((k) => (
          <Ring key={k} k={k} value={stats.attributes[k].value} canAdd={canAdd} onAllocate={actions.allocatePoint} />
        ))}
      </View>
      <View style={styles.voidRow}>
        <Ring k={ATTR_ORDER[4]} value={stats.attributes[ATTR_ORDER[4]].value} canAdd={canAdd} onAllocate={actions.allocatePoint} />
      </View>

      {/* Harmony summary */}
      <View style={styles.summary}>
        <Stat value={harmony} label="Harmony" color={colors.cyan} />
        <StatKanji kanji={stage.kanji} label={stage.name} />
        <Stat value={state.streak || 0} label="Perfect Days" color={colors.text} />
      </View>

      {/* History */}
      <View style={styles.chartBlock}>
        <Label color={colors.muted} style={{ marginBottom: space.md }}>Daily Merit · last 14 days</Label>
        <BarChart data={xpData} color={colors.cyan} />
      </View>
      <View style={styles.chartBlock}>
        <Label color={colors.muted} style={{ marginBottom: space.md }}>Completion % · last 14 days</Label>
        <BarChart data={compData} color={colors.green} />
      </View>

      <View style={{ height: 90 }} />
    </ScrollView>
  );
}

function Stat({ value, label, color }) {
  return (
    <View style={styles.stat}>
      <Num color={color} style={styles.statValue}>{value}</Num>
      <Label color={colors.muted} style={{ fontSize: 9, marginTop: 3 }}>{label}</Label>
    </View>
  );
}
function StatKanji({ kanji, label }) {
  return (
    <View style={styles.stat}>
      <Kanji color={colors.text} style={{ fontSize: 24, lineHeight: 28 }}>{kanji}</Kanji>
      <Label color={colors.muted} style={{ fontSize: 9, marginTop: 3 }}>{label}</Label>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: space.xl, paddingTop: 64 },
  head: { flexDirection: 'row', alignItems: 'baseline' },
  subtitle: { fontSize: 15, marginTop: 3 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 24, rowGap: 22 },
  voidRow: { alignItems: 'center', marginTop: 22 },
  ring: { width: '46%', alignItems: 'center' },
  ringKanji: { fontSize: 38, lineHeight: 44 },
  ringName: { fontSize: 12, letterSpacing: 1.4, marginTop: 12 },
  ringVal: { fontSize: 12 },
  ringMeaning: { fontSize: 13.5, marginTop: 2, textAlign: 'center', lineHeight: 18 },
  plus: {
    position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderRadius: 10,
    borderWidth: 1, borderColor: colors.cyan, backgroundColor: colors.panel,
    alignItems: 'center', justifyContent: 'center',
  },

  summary: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 18, marginTop: 28,
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 22 },

  chartBlock: {
    borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel,
    padding: space.lg, marginTop: space.lg,
  },
});
