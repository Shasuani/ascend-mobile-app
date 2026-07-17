// SystemWindow — the product's signature frame (§12).
// Angular clipped corners (top-left + bottom-right cut), a gradient holographic
// fill, a glowing border, L-shaped corner brackets on the sharp corners, and an
// animated scan line. Emulated with SVG. Respects "reduce motion".

import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, AccessibilityInfo, Easing, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Polygon, Polyline } from 'react-native-svg';
import { colors, space, glow } from '../theme/tokens';

const CUT = 16;
const BR = 18; // corner-bracket length
let uid = 0;

export default function SystemWindow({ children, style, accent = colors.cyan, scan = true, padded = true }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const scanY = useRef(new Animated.Value(0)).current;
  const gid = useRef(`sw${uid++}`).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    if (!scan || reduceMotion || size.h === 0) return;
    const loop = Animated.loop(
      Animated.timing(scanY, { toValue: 1, duration: 3600, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [scan, reduceMotion, size.h, scanY]);

  const { w, h } = size;
  const points = w && h ? `${CUT},0 ${w},0 ${w},${h - CUT} ${w - CUT},${h} 0,${h} 0,${CUT}` : '';
  const translateY = scanY.interpolate({ inputRange: [0, 1], outputRange: [0, h] });

  return (
    <View
      style={[styles.wrap, glow(accent, 16, 0.35), style]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
      }}
    >
      {!!points && (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={gid} x1="0" y1="0" x2="0.5" y2="1">
              <Stop offset="0" stopColor="#181a24" />
              <Stop offset="1" stopColor="#0c0e15" />
            </LinearGradient>
          </Defs>
          <Polygon points={points} fill={`url(#${gid})`} stroke={accent} strokeWidth={1.5} strokeOpacity={0.9} />
          {/* corner brackets on the two sharp corners */}
          <Polyline points={`${w - BR},2.5 ${w - 2.5},2.5 ${w - 2.5},${BR}`} fill="none" stroke={colors.cyanBright} strokeWidth={2.5} />
          <Polyline points={`2.5,${h - BR} 2.5,${h - 2.5} ${BR},${h - 2.5}`} fill="none" stroke={colors.cyanBright} strokeWidth={2.5} />
        </Svg>
      )}

      {scan && !reduceMotion && !!h && (
        <Animated.View pointerEvents="none" style={[styles.scan, { backgroundColor: accent, transform: [{ translateY }] }]} />
      )}

      <View style={padded ? styles.content : null}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: 'transparent' },
  content: { padding: space.lg },
  scan: { position: 'absolute', left: 2, right: 2, height: 2, opacity: 0.22 },
});
