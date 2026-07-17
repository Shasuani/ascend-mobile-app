// Settings modal (§11): recalibrate, run review now, reset.

import React from 'react';
import { Modal, View, Pressable, StyleSheet, Alert } from 'react-native';
import { colors, space } from '../theme/tokens';
import { Title, Label, Txt } from './typography';
import SystemWindow from './SystemWindow';

function Item({ label, hint, onPress, danger }) {
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <View style={{ flex: 1 }}>
        <Txt color={danger ? colors.red : colors.text} style={{ fontSize: 16 }}>{label}</Txt>
        {!!hint && <Txt color={colors.muted} style={{ fontSize: 12, marginTop: 2 }}>{hint}</Txt>}
      </View>
      <Txt color={colors.muted}>›</Txt>
    </Pressable>
  );
}

export default function SettingsModal({ visible, onClose, onReview, onReset, onLogout }) {
  const confirmReset = () =>
    Alert.alert('Reset all progress?', 'This wipes your level, streak, and quests. Cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => { onReset(); onClose(); } },
    ]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Title>Settings</Title>
            <Pressable onPress={onClose} hitSlop={12}><Txt color={colors.muted}>✕</Txt></Pressable>
          </View>

          <SystemWindow scan={false}>
            <Item label="Run System Report now" hint="Review the last 7 days and recalibrate" onPress={() => { onReview(); onClose(); }} />
            <Item label="Log out" hint="Return to the sign-in screen" onPress={() => { onClose(); onLogout(); }} />
            <Item label="Reset all progress" hint="Start over from calibration" onPress={confirmReset} danger />
          </SystemWindow>

          <Label color={colors.muted} style={{ marginTop: space.lg, textAlign: 'center' }}>ASCEND · on-device · v1</Label>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(2,4,10,0.9)', justifyContent: 'flex-end' },
  sheet: { padding: space.lg, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md },
});
