// Animated progress bar with a glowing gradient fill (§12).

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, glow } from '../theme/tokens';

export default function XpBar({ pct = 0, color = colors.cyan, height = 9 }) {
  const w = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(w, {
      toValue: Math.max(0, Math.min(1, pct)),
      duration: 550,
      useNativeDriver: false,
    }).start();
  }, [pct, w]);

  const width = w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.track, { height }]}>
      <Animated.View style={[styles.fillWrap, { width }, glow(color, 4, 0.35)]}>
        <LinearGradient
          colors={[color, color + '55']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: '#1a1012',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  fillWrap: { height: '100%', borderRadius: 3, overflow: 'hidden' },
  fill: { flex: 1 },
});
