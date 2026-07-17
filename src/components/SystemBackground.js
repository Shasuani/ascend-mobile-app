// The app's living background: a dark void with faint radial cyan glows, a
// subtle HUD grid, and a slow drifting sheen. Sits behind every screen (§12).

import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, AccessibilityInfo, Dimensions, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Rect, Line } from 'react-native-svg';
import { colors } from '../theme/tokens';

const { width: W, height: H } = Dimensions.get('window');
const GRID = 44;

export default function SystemBackground() {
  const drift = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.timing(drift, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, drift]);

  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [-H, H] });

  const vLines = [];
  for (let x = GRID; x < W; x += GRID) vLines.push(x);
  const hLines = [];
  for (let y = GRID; y < H + 100; y += GRID) hLines.push(y);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={W} height={H + 100} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="base" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0b0d14" />
            <Stop offset="1" stopColor="#050608" />
          </LinearGradient>
          <RadialGradient id="glowTop" cx="28%" cy="12%" r="65%">
            <Stop offset="0" stopColor={colors.cyan} stopOpacity="0.22" />
            <Stop offset="1" stopColor={colors.void} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="glowBottom" cx="82%" cy="90%" r="65%">
            <Stop offset="0" stopColor="#3a1c0c" stopOpacity="0.55" />
            <Stop offset="1" stopColor={colors.void} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect x="0" y="0" width={W} height={H + 100} fill="url(#base)" />
        {/* HUD grid */}
        {vLines.map((x) => (
          <Line key={`v${x}`} x1={x} y1="0" x2={x} y2={H + 100} stroke={colors.line} strokeWidth="0.5" strokeOpacity="0.12" />
        ))}
        {hLines.map((y) => (
          <Line key={`h${y}`} x1="0" y1={y} x2={W} y2={y} stroke={colors.line} strokeWidth="0.5" strokeOpacity="0.12" />
        ))}
        {/* radial glows on top of the grid */}
        <Rect x="0" y="0" width={W} height={H + 100} fill="url(#glowTop)" />
        <Rect x="0" y="0" width={W} height={H + 100} fill="url(#glowBottom)" />
      </Svg>

      {/* slow drifting sheen for life */}
      {!reduceMotion && (
        <Animated.View style={[styles.sheen, { transform: [{ translateY }, { rotate: '8deg' }] }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sheen: {
    position: 'absolute',
    left: -W * 0.3,
    width: W * 1.6,
    height: 160,
    backgroundColor: colors.cyan,
    opacity: 0.04,
  },
});
