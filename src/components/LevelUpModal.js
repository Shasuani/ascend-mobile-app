// Level-Up celebration (§12): gold number, rotating light rays, four L-shaped
// corner brackets, spring-in. Respects reduce-motion.

import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Pressable, Animated, Easing, AccessibilityInfo, StyleSheet } from 'react-native';
import { colors, space, fonts } from '../theme/tokens';
import { Title, Label, Num } from './typography';

function Bracket({ style }) {
  return <View style={[styles.bracket, style]} />;
}

export default function LevelUpModal({ visible, level, onClose }) {
  const spin = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.6);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [visible, reduceMotion, spin, scale]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          {!reduceMotion && (
            <Animated.View style={[styles.rays, { transform: [{ rotate }] }]} pointerEvents="none">
              {Array.from({ length: 12 }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.ray, { transform: [{ rotate: `${i * 30}deg` }] }]}
                />
              ))}
            </Animated.View>
          )}

          <Bracket style={styles.tl} />
          <Bracket style={styles.tr} />
          <Bracket style={styles.bl} />
          <Bracket style={styles.br} />

          <Label color={colors.gold}>Level Up</Label>
          <Num color={colors.gold} style={styles.big}>{level}</Num>
          <Title color={colors.text} style={{ fontSize: 14 }}>+2 ATTRIBUTE POINTS</Title>
          <Label color={colors.muted} style={{ marginTop: space.md }}>Tap to continue</Label>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const BRACKET = 22;
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(2,4,10,0.85)', alignItems: 'center', justifyContent: 'center' },
  card: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  big: { fontSize: 84, lineHeight: 92, marginVertical: space.sm },
  rays: { position: 'absolute', width: 400, height: 400, alignItems: 'center', justifyContent: 'center' },
  ray: {
    position: 'absolute',
    width: 1,
    height: 400,
    backgroundColor: colors.gold,
    opacity: 0.08,
  },
  bracket: { position: 'absolute', width: BRACKET, height: BRACKET, borderColor: colors.gold },
  tl: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2 },
  tr: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2 },
  bl: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2 },
  br: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 },
});
