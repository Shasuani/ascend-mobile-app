// Lightweight vertical bar chart (no SVG needed — flex heights).
// data: [{ label, value }]. Bars scale to the max value in the set.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, space } from '../theme/tokens';
import { Label } from './typography';

export default function BarChart({ data, color = colors.cyan, barHeight = 90 }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={[styles.row, { height: barHeight + 16 }]}>
      {data.map((d, i) => (
        <View key={i} style={styles.col}>
          <View
            style={{
              width: '68%',
              height: Math.max(2, (d.value / max) * barHeight),
              backgroundColor: color,
              borderRadius: 2,
              opacity: d.value > 0 ? 1 : 0.25,
            }}
          />
          <Label color={colors.muted} style={styles.label}>{d.label}</Label>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: space.sm },
  col: { flex: 1, alignItems: 'center' },
  label: { fontSize: 8, marginTop: 4 },
});
