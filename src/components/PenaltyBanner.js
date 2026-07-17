// Fixed-bottom penalty banner (§8, §11). Humane: states the loss AND promises a
// comeback bonus. Never berates.

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { colors, space } from '../theme/tokens';
import { Txt, Label } from './typography';

export default function PenaltyBanner({ message, onDismiss }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.inner}>
        <Label color={colors.red}>System Warning</Label>
        <Txt color={colors.text} style={styles.msg}>{message}</Txt>
      </View>
      <Pressable onPress={onDismiss} hitSlop={12} style={styles.close}>
        <Txt color={colors.red}>✕</Txt>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: space.md,
    right: space.md,
    bottom: space.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1a0a10',
    borderWidth: 1,
    borderColor: colors.red,
    borderRadius: 6,
    padding: space.md,
    shadowColor: colors.red,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  inner: { flex: 1 },
  msg: { marginTop: 4, fontSize: 13, lineHeight: 18 },
  close: { paddingLeft: space.md },
});
