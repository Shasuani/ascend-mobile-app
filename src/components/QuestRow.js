// One quest row: checkbox / title / "why" / time / attribute tag / xp (§11).
// The checkbox "pops" on complete.

import React, { useEffect, useRef } from 'react';
import { View, Pressable, Animated, StyleSheet } from 'react-native';
import { colors, space, fonts, ATTRS } from '../theme/tokens';
import { Txt, Num, Label } from './typography';

export default function QuestRow({ quest, done, onToggle }) {
  const accent = ATTRS[quest.attr]?.accent || colors.cyan;
  const pop = useRef(new Animated.Value(done ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(pop, { toValue: done ? 1 : 0, useNativeDriver: true, friction: 5 }).start();
  }, [done, pop]);

  const scale = pop.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.3, 1] });

  return (
    <Pressable onPress={onToggle} style={styles.row}>
      <Animated.View
        style={[
          styles.box,
          { borderColor: done ? colors.cyan : colors.line, transform: [{ scale }] },
          done && { backgroundColor: colors.cyan },
        ]}
      >
        {done && <Txt color={colors.void} style={styles.check}>✓</Txt>}
      </Animated.View>

      <View style={styles.middle}>
        <Txt
          color={done ? colors.muted : colors.text}
          style={[styles.title, done && styles.struck]}
        >
          {quest.title}
        </Txt>
        {!!quest.why && (
          <Txt color={colors.muted} style={styles.why} numberOfLines={1}>
            {quest.why}
          </Txt>
        )}
      </View>

      <View style={styles.right}>
        <View style={[styles.tag, { borderColor: accent }]}>
          <Label color={accent} style={{ fontSize: 9 }}>{quest.attr}</Label>
        </View>
        <Num color={colors.gold} style={styles.xp}>+{quest.xp}</Num>
        {!!quest.window && <Num color={colors.muted} style={styles.time}>{quest.window}</Num>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  box: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { fontSize: 15, fontFamily: fonts.displayBold, lineHeight: 20 },
  middle: { flex: 1, paddingHorizontal: space.md },
  title: { fontSize: 16 },
  struck: { textDecorationLine: 'line-through' },
  why: { fontSize: 11, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  tag: { borderWidth: 1, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1 },
  xp: { fontSize: 13, marginTop: 3 },
  time: { fontSize: 11, marginTop: 1 },
});
