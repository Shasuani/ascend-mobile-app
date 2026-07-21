// ASCEND — a Solo-Leveling-style self-improvement RPG.
// Root: load HUD fonts → auth gate → per-account store → calibration or board.

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Rajdhani_500Medium,
  Rajdhani_600SemiBold,
  Rajdhani_700Bold,
} from '@expo-google-fonts/rajdhani';
import { ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono';
import {
  EBGaramond_500Medium,
  EBGaramond_600SemiBold,
  EBGaramond_400Regular_Italic,
} from '@expo-google-fonts/eb-garamond';
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';
import {
  NotoSerifJP_600SemiBold,
  NotoSerifJP_900Black,
} from '@expo-google-fonts/noto-serif-jp';

import { colors } from './src/theme/tokens';
import { StoreProvider, useStore } from './src/state/StoreContext';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import SystemBackground from './src/components/SystemBackground';
import Auth from './src/screens/Auth';
import Calibration from './src/screens/Calibration';
import Shell from './src/screens/Shell';

function Loader() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.cyan} size="large" />
    </View>
  );
}

// Inside the per-account store: route between calibration and the main board.
function Root() {
  const { ready, state } = useStore();
  if (!ready) return <Loader />;
  return state.calibrated ? <Shell /> : <Calibration />;
}

// Auth gate: unauthenticated → Auth screen; authenticated → their own store.
function Gate() {
  const { ready, user } = useAuth();
  if (!ready) return <Loader />;
  if (!user) return <Auth />;
  return (
    <StoreProvider key={user.id} userId={user.id} userName={user.name}>
      <Root />
    </StoreProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Rajdhani_500Medium,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
    ShareTechMono_400Regular,
    EBGaramond_500Medium,
    EBGaramond_600SemiBold,
    EBGaramond_400Regular_Italic,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    NotoSerifJP_600SemiBold,
    NotoSerifJP_900Black,
  });

  return (
    <View style={styles.app}>
      <StatusBar style="light" />
      <SystemBackground />
      {fontsLoaded ? (
        <AuthProvider>
          <Gate />
        </AuthProvider>
      ) : (
        <Loader />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.void },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
});
