// Bottom tab bar — glassy gradient with a glowing active indicator.

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, space, glow } from '../theme/tokens';
import { Label } from './typography';

const TABS = [
  { key: 'quests', icon: '◈', label: 'Quests' },
  { key: 'hubs', icon: '📚', label: 'Hubs' },
  { key: 'journey', icon: '📈', label: 'Journey' },
  { key: 'journal', icon: '✒', label: 'Journal' },
];

export default function BottomNav({ tab, onChange }) {
  return (
    <LinearGradient colors={['#16171f', '#0a0b0e']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.bar}>
      {TABS.map((t) => {
        const active = tab === t.key;
        return (
          <Pressable key={t.key} onPress={() => onChange(t.key)} style={styles.tab}>
            {active && <LinearGradient colors={[colors.cyan, colors.cyanDim]} style={[styles.indicator, glow(colors.cyan, 6, 0.9)]} />}
            <Label color={active ? colors.cyanBright : colors.muted} style={styles.icon}>{t.icon}</Label>
            <Label color={active ? colors.cyan : colors.muted} style={{ fontSize: 10 }}>{t.label}</Label>
          </Pressable>
        );
      })}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingBottom: 24,
    paddingTop: space.md,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  icon: { fontSize: 18 },
  indicator: { position: 'absolute', top: -space.md, width: 30, height: 3, borderRadius: 2 },
});
