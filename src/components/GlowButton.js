// Angular glowing button with a gradient fill — the standard CTA (§12).

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, fonts, glow } from '../theme/tokens';
import { Label } from './typography';

export default function GlowButton({ label, onPress, disabled, variant = 'primary', style, size = 'md' }) {
  const grad = variant === 'gold' ? gradients.gold : variant === 'red' ? gradients.red : gradients.cyan;
  const accent = variant === 'gold' ? colors.gold : variant === 'red' ? colors.red : colors.cyan;
  const pad = size === 'sm' ? styles.sm : styles.md;

  if (variant === 'ghost') {
    return (
      <Pressable onPress={onPress} disabled={disabled} style={[styles.ghost, pad, disabled && styles.dim, style]}>
        <Label color={accent}>{label}</Label>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={disabled} style={[glow(accent, 7, 0.3), disabled && styles.dim, style]}>
      <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.fill, pad]}>
        {/* dark text on bright gold; bone text on crimson/red for contrast */}
        <Label color={variant === 'gold' ? colors.ink : colors.text} style={{ fontFamily: fonts.mono, fontSize: 12 }}>{label}</Label>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  ghost: { borderRadius: 4, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  md: { paddingVertical: 12, paddingHorizontal: 20 },
  sm: { paddingVertical: 7, paddingHorizontal: 14 },
  dim: { opacity: 0.4 },
});
