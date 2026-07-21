// The Five Rings shown as five ensō — open ink circles, each filled by the ring's
// value. Calm and Zen, in place of the old sci-fi stat radar. Tap a ring to spend
// a free attribute point.

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, space, ATTRS, ATTR_ORDER } from '../theme/tokens';
import { Label, Num } from './typography';
import { ringFor } from '../logic/mastery';

const SIZE = 56;
const R = 22;
const SW = 3;
const C = 2 * Math.PI * R;
const GAP = 0.12;         // the ensō opening
const DISPLAY_MAX = 30;

function Enso({ value, color }) {
  const pct = Math.max(0, Math.min(1, value / DISPLAY_MAX));
  const base = C * (1 - GAP);
  return (
    <Svg width={SIZE} height={SIZE}>
      <Circle
        cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
        stroke={colors.line} strokeWidth={SW} strokeOpacity={0.7}
        strokeDasharray={`${base} ${C}`} strokeLinecap="round"
        transform={`rotate(128 ${SIZE / 2} ${SIZE / 2})`}
      />
      <Circle
        cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
        stroke={color} strokeWidth={SW}
        strokeDasharray={`${base * pct} ${C}`} strokeLinecap="round"
        transform={`rotate(128 ${SIZE / 2} ${SIZE / 2})`}
      />
    </Svg>
  );
}

export default function FiveRings({ attributes, focusAreas = [], freePoints = 0, onAllocate }) {
  const canAdd = freePoints > 0;
  return (
    <View style={styles.row}>
      {ATTR_ORDER.map((k) => {
        const a = attributes[k];
        const accent = ATTRS[k].accent;
        const isFocus = focusAreas.includes(k);
        return (
          <Pressable key={k} disabled={!canAdd} onPress={() => onAllocate && onAllocate(k)} style={styles.item}>
            <View style={styles.enso}>
              <Enso value={a.value} color={accent} />
              <View style={styles.center}>
                <Num color={colors.text} style={{ fontSize: 15 }}>{a.value}</Num>
              </View>
              {canAdd && (
                <View style={[styles.plus, { borderColor: accent, backgroundColor: colors.panel }]}>
                  <Num color={accent} style={{ fontSize: 11 }}>＋</Num>
                </View>
              )}
            </View>
            <Label color={isFocus ? accent : colors.muted} style={styles.name}>
              {isFocus ? '◆ ' : ''}{ringFor(k)}
            </Label>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space.sm },
  item: { alignItems: 'center' },
  enso: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  plus: {
    position: 'absolute', top: -3, right: -3, width: 18, height: 18, borderRadius: 9,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  name: { marginTop: 9, fontSize: 9, letterSpacing: 1 },
});
