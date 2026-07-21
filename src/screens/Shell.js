// Post-calibration app shell: hosts the tab navigation between the Quests board
// and the Library.

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';
import Main from './Main';
import Hubs from './Hubs';
import Rings from './Rings';
import Journal from './Journal';
import BottomNav from '../components/BottomNav';

const SCREENS = {
  quests: Main,
  hubs: Hubs,
  journey: Rings,
  journal: Journal,
};

export default function Shell() {
  const [tab, setTab] = useState('quests');
  const Screen = SCREENS[tab] || Main;
  return (
    <View style={styles.root}>
      <View style={styles.body}>
        <Screen />
      </View>
      <BottomNav tab={tab} onChange={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  body: { flex: 1 },
});
