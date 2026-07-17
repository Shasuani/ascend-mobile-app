// Weekly "System Report" modal (§9): completion ring, key metrics, tier change
// arrow, and the System's stern recap.

import React from 'react';
import { Modal, View, Pressable, ScrollView, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, space, fonts, ATTRS } from '../theme/tokens';
import { Title, Label, Txt, Num } from './typography';
import SystemWindow from './SystemWindow';

function Ring({ pct }) {
  const size = 120;
  const r = 50;
  const c = 2 * Math.PI * r;
  const dash = c * Math.max(0, Math.min(1, pct));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.line} strokeWidth={8} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.cyan}
          strokeWidth={8}
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Num color={colors.cyan} style={{ fontSize: 30 }}>{Math.round(pct * 100)}%</Num>
    </View>
  );
}

function Stat({ label, value, color = colors.text }) {
  return (
    <View style={styles.stat}>
      <Num color={color} style={{ fontSize: 22 }}>{value}</Num>
      <Label>{label}</Label>
    </View>
  );
}

export default function SystemReportModal({ report, recap, onClose }) {
  if (!report) return null;
  const { metrics, direction, oldTier, newTier, strongest } = report;
  const arrow = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '=';
  const arrowColor = direction === 'up' ? colors.green : direction === 'down' ? colors.gold : colors.muted;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Label color={colors.cyanDim}>System Report</Label>
          <SystemWindow style={styles.card}>
            <View style={{ alignItems: 'center' }}>
              <Ring pct={metrics.completion} />
            </View>

            <View style={styles.statsRow}>
              <Stat label="Days cleared" value={`${metrics.daysCleared}/${metrics.daysActive}`} />
              <Stat label="XP gained" value={metrics.xpGained} color={colors.gold} />
              <Stat label="Strongest" value={strongest || '—'} color={ATTRS[strongest]?.accent} />
            </View>

            <View style={styles.tierRow}>
              <Label>Difficulty</Label>
              <Num style={{ fontSize: 18 }} color={colors.muted}>{oldTier}</Num>
              <Txt color={arrowColor} style={{ fontSize: 18 }}>{arrow}</Txt>
              <Num style={{ fontSize: 18 }} color={colors.cyan}>{newTier}</Num>
            </View>

            <View style={styles.recap}>
              <Txt color={colors.text} style={{ lineHeight: 21 }}>{recap}</Txt>
            </View>
          </SystemWindow>

          <Pressable onPress={onClose} style={styles.btn}>
            <Txt color={colors.void} style={{ fontFamily: fonts.displayBold }}>ACKNOWLEDGE</Txt>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(2,4,10,0.92)' },
  scroll: { padding: space.lg, paddingTop: 72 },
  card: { marginTop: space.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: space.xl },
  stat: { alignItems: 'center', gap: 4 },
  tierRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.md, marginTop: space.xl },
  recap: { marginTop: space.xl, borderTopWidth: 1, borderTopColor: colors.line2, paddingTop: space.lg },
  btn: { backgroundColor: colors.cyan, borderRadius: 4, padding: space.md, alignItems: 'center', marginTop: space.xl },
});
