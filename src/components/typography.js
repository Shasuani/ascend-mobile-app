// Small themed Text wrappers so every screen uses the right HUD fonts (§12).
// Txt/Title/Label use Rajdhani (condensed). Num uses Share Tech Mono for all
// numbers, XP, and timers.

import React from 'react';
import { Text } from 'react-native';
import { colors, fonts } from '../theme/tokens';

export function Txt({ style, children, color = colors.text, ...rest }) {
  return (
    <Text {...rest} style={[{ fontFamily: fonts.body, color, fontSize: 15 }, style]}>
      {children}
    </Text>
  );
}

export function Title({ style, children, color = colors.text, ...rest }) {
  return (
    <Text
      {...rest}
      style={[{ fontFamily: fonts.displayBold, color, fontSize: 22, letterSpacing: 1 }, style]}
    >
      {children}
    </Text>
  );
}

export function Label({ style, children, color = colors.muted, ...rest }) {
  return (
    <Text
      {...rest}
      style={[
        { fontFamily: fonts.display, color, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Num({ style, children, color = colors.cyan, ...rest }) {
  return (
    <Text {...rest} style={[{ fontFamily: fonts.mono, color, fontSize: 15 }, style]}>
      {children}
    </Text>
  );
}
