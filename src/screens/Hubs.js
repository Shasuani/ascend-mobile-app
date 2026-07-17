// Content Hubs: a per-attribute selector. Intelligence opens the Library (books);
// the other four open their challenge hub.

import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { colors, space, ATTRS, ATTR_ORDER } from '../theme/tokens';
import { Title, Label, Txt } from '../components/typography';
import Library from './Library';
import ContentHub from './ContentHub';

const HUB_NAME = { STR: 'Training', INT: 'Library', WLTH: 'Ventures', VIT: 'Protocols', FOC: 'Codex' };
const HUB_TAG = {
  STR: 'Challenges that forge the body.',
  WLTH: 'Ventures that build wealth.',
  VIT: 'Protocols for health and recovery.',
  FOC: 'Disciplines that sharpen the mind.',
};

export default function Hubs() {
  const [sel, setSel] = useState('INT');
  const accent = ATTRS[sel].accent;

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <Label color={colors.cyanDim}>Content Hubs</Label>
        <View style={styles.selRow}>
          {ATTR_ORDER.map((k) => {
            const active = sel === k;
            return (
              <Pressable
                key={k}
                onPress={() => setSel(k)}
                style={[styles.chip, { borderColor: active ? ATTRS[k].accent : colors.line }, active && styles.chipActive]}
              >
                <Label color={active ? ATTRS[k].accent : colors.muted}>{k}</Label>
              </Pressable>
            );
          })}
        </View>
      </View>

      {sel === 'INT' ? (
        <Library />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Label color={accent}>{ATTRS[sel].domain}</Label>
          <Title style={{ marginTop: 2 }}>{HUB_NAME[sel]}</Title>
          <Txt color={colors.muted} style={{ marginTop: 4, marginBottom: space.lg }}>{HUB_TAG[sel]}</Txt>
          <ContentHub attr={sel} />
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { paddingTop: 52, paddingHorizontal: space.md, paddingBottom: space.sm },
  selRow: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  chip: { flex: 1, alignItems: 'center', borderWidth: 1, borderRadius: 4, paddingVertical: space.sm },
  chipActive: { backgroundColor: colors.panel },
  scroll: { padding: space.md },
});
