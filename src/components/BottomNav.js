// Bottom tab bar — a quiet ink strip with brush-kanji tabs and a crimson top edge
// marking the active screen.

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { colors, space } from '../theme/tokens';
import { Kanji, Label } from './typography';

const TABS = [
  { key: 'quests', kanji: '道', label: 'Way' },
  { key: 'hubs', kanji: '導', label: 'Paths' },
  { key: 'journey', kanji: '輪', label: 'Rings' },
  { key: 'journal', kanji: '記', label: 'Ledger' },
];

export default function BottomNav({ tab, onChange }) {
  return (
    <View style={styles.bar}>
      {TABS.map((t) => {
        const active = tab === t.key;
        const tint = active ? colors.cyan : colors.muted;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={[styles.tab, { borderTopColor: active ? colors.cyan : 'transparent' }]}
          >
            <Kanji color={tint} style={styles.kanji}>{t.kanji}</Kanji>
            <Label color={tint} style={styles.label}>{t.label}</Label>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: '#0a0706',
  },
  tab: {
    flex: 1, alignItems: 'center', gap: 5,
    paddingTop: 11, paddingBottom: 24,
    borderTopWidth: 2,
    marginTop: -1, // overlap the bar's hairline so the active edge sits on it
  },
  kanji: { fontSize: 20, lineHeight: 24 },
  label: { fontSize: 8, letterSpacing: 1.2 },
});
