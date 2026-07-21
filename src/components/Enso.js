// The ensō — an open ink circle, the signature motif of ASCEND's Musashi skin.
// Used decoratively (a near-complete ring behind a stage kanji) and as a value
// gauge (a track + a crimson fill arc, for the Five Rings).
//
//   <Enso size={72}><Kanji>初</Kanji></Enso>                     decorative
//   <Enso size={106} fillPct={0.8}><Kanji>火</Kanji></Enso>      gauge (80%)

import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/tokens';

const R = 42;                 // radius in the 100×100 viewBox
const FULL = 2 * Math.PI * R; // ≈ 263.9 — full circumference

export default function Enso({
  size = 72,
  stroke = 4,
  color = colors.cyan,
  trackColor = colors.line,
  arc = 224,        // drawn length of the ring (leaves the ensō opening)
  fillPct = null,   // 0..1 → draws a crimson fill arc over a faint track
  rotate = -118,    // rotation that places the opening
  children,
}) {
  const gauge = fillPct != null;
  const clamped = Math.max(0, Math.min(1, fillPct || 0));
  const rot = `rotate(${rotate} 50 50)`;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* base ring — full accent when decorative, faint track when a gauge */}
        <Circle
          cx={50} cy={50} r={R} fill="none"
          stroke={gauge ? trackColor : color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${arc} ${FULL}`}
          transform={rot}
        />
        {/* fill arc — only for gauges */}
        {gauge && (
          <Circle
            cx={50} cy={50} r={R} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${arc * clamped} ${FULL}`}
            transform={rot}
          />
        )}
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  );
}
