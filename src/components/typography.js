// Themed Text wrappers (samurai/ink direction).
//   Title  → elegant serif (EB Garamond) for headings + the player's name.
//   Precept→ serif italic — the Dokkōdō "wisdom" voice.
//   Label  → mono uppercase, letter-spaced — micro-labels and data captions.
//   Txt    → clean system sans for reading text.
//   Num    → mono — all numbers, times, XP.

import React from 'react';
import { Text } from 'react-native';
import { colors, fonts } from '../theme/tokens';

export function Txt({ style, children, color = colors.text, ...rest }) {
  return (
    <Text {...rest} style={[{ fontFamily: fonts.body, color, fontSize: 15 }, style]}>
      {children}
    </Text>
  );
}

export function Title({ style, children, color = colors.text, ...rest }) {
  return (
    <Text {...rest} style={[{ fontFamily: fonts.serif, color, fontSize: 24, letterSpacing: 0.2 }, style]}>
      {children}
    </Text>
  );
}

export function Precept({ style, children, color = colors.text, ...rest }) {
  return (
    <Text {...rest} style={[{ fontFamily: fonts.serifItalic, color, fontSize: 16, lineHeight: 23 }, style]}>
      {children}
    </Text>
  );
}

export function Label({ style, children, color = colors.muted, ...rest }) {
  return (
    <Text
      {...rest}
      style={[
        { fontFamily: fonts.body, color, fontSize: 10.5, letterSpacing: 1.4, textTransform: 'uppercase' },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Num({ style, children, color = colors.cyan, ...rest }) {
  return (
    <Text {...rest} style={[{ fontFamily: fonts.mono, color, fontSize: 15 }, style]}>
      {children}
    </Text>
  );
}

// Brush-serif kanji (Noto Serif JP). `heavy` swaps to the 900 weight for display
// glyphs (昇, 試). Line-height is tight so the glyph sits centered in a badge.
export function Kanji({ style, children, color = colors.text, heavy, ...rest }) {
  return (
    <Text {...rest} style={[{ fontFamily: heavy ? fonts.kanjiHeavy : fonts.kanji, color, includeFontPadding: false }, style]}>
      {children}
    </Text>
  );
}
