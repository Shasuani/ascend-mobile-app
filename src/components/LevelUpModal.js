// Ascension — the rite shown when the player crosses into a new stage of mastery
// (or simply levels up). An ensō draws around the stage kanji; a Musashi-toned
// line marks the moment. Respects reduce-motion.

import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Pressable, Animated, AccessibilityInfo, StyleSheet } from 'react-native';
import { colors, space } from '../theme/tokens';
import { Title, Label, Precept, Kanji } from './typography';
import Enso from './Enso';
import { stageForLevel } from '../logic/mastery';

export default function LevelUpModal({ visible, level, onClose }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const breath = useRef(new Animated.Value(0.5)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.7);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 0.85, duration: 1100, useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0.5, duration: 1100, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, reduceMotion, scale, breath]);

  const stage = stageForLevel(level || 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.body, { transform: [{ scale }] }]}>
          <Animated.View style={{ opacity: reduceMotion ? 1 : breath }}>
            <Label color={colors.cyan} style={styles.kicker}>昇 · Ascension</Label>
          </Animated.View>

          <View style={styles.enso}>
            <Enso size={170} stroke={3.5} arc={238} rotate={-118}>
              <Kanji color={colors.text} style={{ fontSize: 76, lineHeight: 86 }}>{stage.kanji}</Kanji>
            </Enso>
          </View>

          <Title style={styles.name}>{stage.name}</Title>
          <Precept color={colors.text2} style={styles.msg}>
            The System acknowledges your discipline. You have risen to {stage.name}. This
            stage will ask more of you than the last.
          </Precept>
        </Animated.View>

        <Pressable onPress={onClose} style={styles.button}>
          <Title color={colors.text} style={styles.buttonLabel}>Walk on</Title>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(8,4,5,0.97)', alignItems: 'center', justifyContent: 'center', padding: 40 },
  body: { alignItems: 'center' },
  kicker: { fontSize: 12, letterSpacing: 6 },
  enso: { marginTop: 26 },
  name: { fontSize: 34, letterSpacing: 1, marginTop: 22 },
  msg: { fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 14, maxWidth: 300 },
  button: {
    position: 'absolute', bottom: 70,
    backgroundColor: colors.cyan, paddingVertical: 14, paddingHorizontal: 46,
    shadowColor: colors.cyan, shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
  },
  buttonLabel: { fontSize: 17, letterSpacing: 0.5 },
});
