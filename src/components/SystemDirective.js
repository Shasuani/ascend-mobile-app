// A slim daily "System Directive" line for the home screen — flavor + a reason
// to open the app each day.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, space } from '../theme/tokens';
import { Label, Txt } from './typography';
import { directiveForToday } from '../data/directives';
import { dateKey } from '../logic/dates';

export default function SystemDirective() {
  return (
    <View style={styles.wrap}>
      <View style={styles.bar} />
      <View style={{ flex: 1 }}>
        <Label color={colors.cyanDim}>System Directive</Label>
        <Txt color={colors.text} style={styles.txt}>{directiveForToday(dateKey())}</Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 4,
    padding: space.md,
    marginBottom: space.md,
    backgroundColor: colors.panel,
  },
  bar: { width: 3, backgroundColor: colors.cyan, borderRadius: 2, marginRight: space.md },
  txt: { fontSize: 14, marginTop: 3, fontStyle: 'italic' },
});
