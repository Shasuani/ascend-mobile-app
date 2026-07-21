// A calm "ink" panel. Deliberately NOT a sci-fi HUD frame — no scan line, no
// corner brackets, no neon border. Just a quiet charcoal card with a hairline
// border and a single accent edge on the left (a brush-stroke of colour), plus a
// soft natural drop shadow for depth. `accent` tints the left edge; `scan` is
// accepted for API compatibility but intentionally ignored.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, space } from '../theme/tokens';

export default function SystemWindow({ children, style, accent = colors.cyan, scan, padded = true }) {
  return (
    <View style={[styles.wrap, { borderLeftColor: accent }, style]}>
      <View style={padded ? styles.content : null}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 2,
    borderRadius: 3,
    // soft, natural depth — not a neon glow
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  content: { padding: space.lg },
});
