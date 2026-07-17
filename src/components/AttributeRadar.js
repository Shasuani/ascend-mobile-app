// Five-axis attribute radar for the status window (§11). Pure SVG.
// Values are clamped to a sensible display range so the shape stays readable.

import React from 'react';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { colors, fonts, ATTRS, ATTR_ORDER } from '../theme/tokens';

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 74;
const DISPLAY_MAX = 30; // value that reaches the outer ring

function pointAt(index, ratio) {
  // Start at the top (-90°) and go clockwise around the five axes.
  const angle = (-90 + index * (360 / ATTR_ORDER.length)) * (Math.PI / 180);
  const r = RADIUS * Math.max(0.08, Math.min(1, ratio));
  return {
    x: CENTER + r * Math.cos(angle),
    y: CENTER + r * Math.sin(angle),
    lx: CENTER + (RADIUS + 16) * Math.cos(angle),
    ly: CENTER + (RADIUS + 16) * Math.sin(angle),
  };
}

export default function AttributeRadar({ attributes }) {
  const axes = ATTR_ORDER.map((k, i) => {
    const value = attributes?.[k]?.value ?? 10;
    return { key: k, ...pointAt(i, value / DISPLAY_MAX), accent: ATTRS[k].accent };
  });

  const shape = axes.map((a) => `${a.x},${a.y}`).join(' ');
  const rings = [0.33, 0.66, 1];

  return (
    <Svg width={SIZE} height={SIZE}>
      {/* concentric guide rings */}
      {rings.map((r, idx) => (
        <Polygon
          key={`ring-${idx}`}
          points={ATTR_ORDER.map((_, i) => {
            const p = pointAt(i, r);
            return `${p.x},${p.y}`;
          }).join(' ')}
          fill="none"
          stroke={colors.line}
          strokeWidth={1}
          strokeOpacity={0.5}
        />
      ))}

      {/* spokes */}
      {axes.map((a) => (
        <Line
          key={`spoke-${a.key}`}
          x1={CENTER}
          y1={CENTER}
          x2={pointAt(ATTR_ORDER.indexOf(a.key), 1).x}
          y2={pointAt(ATTR_ORDER.indexOf(a.key), 1).y}
          stroke={colors.line}
          strokeWidth={1}
          strokeOpacity={0.4}
        />
      ))}

      {/* the player's shape */}
      <Polygon points={shape} fill={colors.cyan} fillOpacity={0.18} stroke={colors.cyan} strokeWidth={2} />

      {/* vertices + axis labels */}
      {axes.map((a) => (
        <React.Fragment key={`v-${a.key}`}>
          <Circle cx={a.x} cy={a.y} r={3} fill={a.accent} />
          <SvgText
            x={a.lx}
            y={a.ly + 3}
            fill={colors.muted}
            fontSize={10}
            fontFamily={fonts.display}
            textAnchor="middle"
          >
            {a.key}
          </SvgText>
        </React.Fragment>
      ))}
    </Svg>
  );
}
