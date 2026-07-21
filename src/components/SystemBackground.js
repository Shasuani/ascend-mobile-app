// A quiet ink ground: deep warm-black with one soft crimson wash at the top and a
// vignette that darkens the edges. No grid, no scan sheen — calm, not a HUD.

import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors } from '../theme/tokens';

const { width: W, height: H } = Dimensions.get('window');

export default function SystemBackground() {
  const h = H + 120;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={W} height={h} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#120c0c" />
            <Stop offset="1" stopColor="#070505" />
          </LinearGradient>
          <RadialGradient id="wash" cx="50%" cy="0%" r="85%">
            <Stop offset="0" stopColor={colors.cyan} stopOpacity="0.10" />
            <Stop offset="1" stopColor="#070505" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="vig" cx="50%" cy="40%" r="80%">
            <Stop offset="0" stopColor="#000000" stopOpacity="0" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0.5" />
          </RadialGradient>
        </Defs>
        <Rect width={W} height={h} fill="url(#bg)" />
        <Rect width={W} height={h} fill="url(#wash)" />
        <Rect width={W} height={h} fill="url(#vig)" />
      </Svg>
    </View>
  );
}
