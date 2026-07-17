// Journey — progress history charts + achievements. All derived from the log.

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { colors, space, ATTRS, ATTR_ORDER } from '../theme/tokens';
import { Title, Label, Txt, Num } from '../components/typography';
import SystemWindow from '../components/SystemWindow';
import BarChart from '../components/BarChart';
import XpBar from '../components/XpBar';
import { useStore } from '../state/StoreContext';
import { titleFor, evaluateAchievements } from '../logic/achievements';
import { dailyXpSeries, dailyCompletionSeries } from '../logic/history';

export default function Journey() {
  const { state, stats } = useStore();

  const xpData = dailyXpSeries(state, 14).map((d) => ({ label: d.label, value: d.xp }));
  const compData = dailyCompletionSeries(state, 14).map((d) => ({ label: d.label, value: Math.round(d.pct * 100) }));
  const attrData = ATTR_ORDER.map((k) => ({ label: k, value: stats.attributes[k].xp }));
  const achievements = evaluateAchievements(state, stats);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Label color={colors.cyanDim}>Journey</Label>
      <Title style={{ marginTop: 2 }}>{titleFor(stats.rank)}</Title>
      <Txt color={colors.muted} style={{ marginTop: 4 }}>
        Rank {stats.rank} · Level {stats.level} · {unlockedCount}/{achievements.length} achievements
      </Txt>

      <SystemWindow style={styles.block} scan={false}>
        <Label style={{ marginBottom: space.sm }}>Daily XP · last 14 days</Label>
        <BarChart data={xpData} color={colors.cyan} />
      </SystemWindow>

      <SystemWindow style={styles.block} scan={false}>
        <Label style={{ marginBottom: space.sm }}>Completion % · last 14 days</Label>
        <BarChart data={compData} color={colors.green} />
      </SystemWindow>

      <SystemWindow style={styles.block} scan={false}>
        <Label style={{ marginBottom: space.sm }}>Attribute XP</Label>
        {ATTR_ORDER.map((k) => (
          <View key={k} style={styles.attrRow}>
            <Label color={ATTRS[k].accent} style={{ width: 44 }}>{k}</Label>
            <View style={{ flex: 1, marginHorizontal: space.md }}>
              <XpBar pct={Math.min(1, stats.attributes[k].xp / Math.max(1, Math.max(...attrData.map((a) => a.value))))} color={ATTRS[k].accent} height={6} />
            </View>
            <Num color={colors.muted} style={{ width: 44, textAlign: 'right', fontSize: 12 }}>{stats.attributes[k].xp}</Num>
          </View>
        ))}
      </SystemWindow>

      <Label style={{ marginTop: space.xl, marginBottom: space.sm }}>Achievements</Label>
      {achievements.map((a) => (
        <View key={a.id} style={[styles.ach, { borderColor: a.unlocked ? colors.gold : colors.line }]}>
          <View style={styles.achHead}>
            <Txt color={a.unlocked ? colors.gold : colors.text} style={{ fontSize: 15 }}>
              {a.unlocked ? '★ ' : '☆ '}{a.name}
            </Txt>
            {!a.unlocked && <Num color={colors.muted} style={{ fontSize: 11 }}>{Math.min(a.value, a.target)}/{a.target}</Num>}
          </View>
          <Txt color={colors.muted} style={{ fontSize: 12, marginTop: 2 }}>{a.desc}</Txt>
          {!a.unlocked && (
            <View style={{ marginTop: space.sm }}>
              <XpBar pct={a.progress} height={4} />
            </View>
          )}
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: space.md, paddingTop: 56 },
  block: { marginTop: space.lg },
  attrRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  ach: { borderWidth: 1, borderRadius: 6, padding: space.md, marginBottom: space.sm, backgroundColor: colors.panel },
  achHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
