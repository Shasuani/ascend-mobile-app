// Onboarding — "System Calibration" (§5). Themed as the System assessing the
// user. Five quick steps → generate the first board (fast first win).

import React, { useState } from 'react';
import { View, ScrollView, Pressable, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, space, fonts, glow, ATTRS, ATTR_ORDER } from '../theme/tokens';
import { TIERS } from '../logic/constants';
import { Title, Label, Txt, Num } from '../components/typography';
import SystemWindow from '../components/SystemWindow';
import GlowButton from '../components/GlowButton';
import { useStore } from '../state/StoreContext';

const DAYS = [
  ['MO', 'Mon'], ['TU', 'Tue'], ['WE', 'Wed'], ['TH', 'Thu'],
  ['FR', 'Fri'], ['SA', 'Sat'], ['SU', 'Sun'],
];

const BUDGETS = [15, 30, 60, 90];

const RATINGS = [
  ['Just starting out', 'E'],
  ['Often inconsistent', 'D'],
  ['Some discipline', 'C'],
  ['Fairly disciplined', 'B'],
  ['Very disciplined', 'A'],
  ['Relentless', 'S'],
];

function Chip({ active, accent = colors.cyan, onPress, children }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: active ? accent : colors.line },
        active && { backgroundColor: colors.cyanDeep, ...glow(accent, 8, 0.5) },
      ]}
    >
      <Txt color={active ? colors.text : colors.muted} style={styles.chipTxt}>
        {children}
      </Txt>
    </Pressable>
  );
}

function TimeField({ label, value, onChange }) {
  return (
    <View style={styles.timeField}>
      <Label>{label}</Label>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="00:00"
        placeholderTextColor={colors.muted}
        keyboardType="numbers-and-punctuation"
        maxLength={5}
        style={styles.timeInput}
      />
    </View>
  );
}

export default function Calibration() {
  const { actions } = useStore();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [focusAreas, setFocusAreas] = useState(['STR', 'INT', 'WLTH', 'VIT', 'FOC']);
  const [workDays, setWorkDays] = useState(['MO', 'TU', 'WE', 'TH', 'FR']);
  const [wake, setWake] = useState('06:30');
  const [workStart, setWorkStart] = useState('08:00');
  const [workEnd, setWorkEnd] = useState('17:00');
  const [sleep, setSleep] = useState('23:00');
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [tier, setTier] = useState('C');
  const [goalText, setGoalText] = useState('');

  const toggleFocus = (k) =>
    setFocusAreas((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );

  const toggleDay = (d) =>
    setWorkDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const canAdvance = () => {
    if (step === 0) return focusAreas.length >= 1;
    return true;
  };

  const finish = async () => {
    setBusy(true);
    await actions.calibrate({
      focusAreas,
      workDays,
      wake,
      workStart,
      workEnd,
      sleep,
      dailyMinutes,
      tier,
      goalText: goalText.trim(),
    });
    // calibrate() flips `calibrated` → the app swaps to the Main screen.
  };

  const steps = [
    // 1. Focus
    {
      label: 'Assessment 1 / 5',
      title: 'Choose your battles',
      hint: 'Pick every area you want to build. All of them, if you are ready.',
      body: (
        <View style={styles.wrapRow}>
          {ATTR_ORDER.map((k) => (
            <Chip key={k} active={focusAreas.includes(k)} accent={ATTRS[k].accent} onPress={() => toggleFocus(k)}>
              {ATTRS[k].label}
            </Chip>
          ))}
        </View>
      ),
    },
    // 2. Work days
    {
      label: 'Assessment 2 / 5',
      title: 'Your work days',
      hint: 'The System schedules around your obligations.',
      body: (
        <View style={styles.wrapRow}>
          {DAYS.map(([code, name]) => (
            <Chip key={code} active={workDays.includes(code)} onPress={() => toggleDay(code)}>
              {name}
            </Chip>
          ))}
        </View>
      ),
    },
    // 3. Daily rhythm
    {
      label: 'Assessment 3 / 5',
      title: 'Your daily rhythm',
      hint: 'So the System knows your free windows.',
      body: (
        <View style={styles.timeGrid}>
          <TimeField label="Wake" value={wake} onChange={setWake} />
          <TimeField label="Work start" value={workStart} onChange={setWorkStart} />
          <TimeField label="Work end" value={workEnd} onChange={setWorkEnd} />
          <TimeField label="Sleep" value={sleep} onChange={setSleep} />
        </View>
      ),
    },
    // 4. Time budget
    {
      label: 'Assessment 4 / 5',
      title: 'Daily time budget',
      hint: 'A hard cap on total quest minutes per day.',
      body: (
        <View style={styles.wrapRow}>
          {BUDGETS.map((m) => (
            <Chip key={m} active={dailyMinutes === m} onPress={() => setDailyMinutes(m)}>
              {m} min
            </Chip>
          ))}
        </View>
      ),
    },
    // 5. Discipline self-rating → tier + goal
    {
      label: 'Assessment 5 / 5',
      title: 'Rate your discipline',
      hint: 'Provisional. The System recalibrates as it observes you.',
      body: (
        <View>
          <View style={styles.wrapRow}>
            {RATINGS.map(([txt, t]) => (
              <Chip key={t} active={tier === t} onPress={() => setTier(t)}>
                {txt}  ·  {t}
              </Chip>
            ))}
          </View>
          <View style={{ height: space.lg }} />
          <Label>Your goal (optional)</Label>
          <TextInput
            value={goalText}
            onChangeText={setGoalText}
            placeholder="e.g. Get lean and start earning online"
            placeholderTextColor={colors.muted}
            style={styles.goalInput}
            multiline
          />
        </View>
      ),
    },
  ];

  if (busy) {
    return (
      <View style={styles.busy}>
        <ActivityIndicator color={colors.cyan} size="large" />
        <View style={{ height: space.lg }} />
        <Label>The System is assessing you…</Label>
      </View>
    );
  }

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <Label color={colors.cyanDim}>ASCEND</Label>
      <View style={{ height: space.xs }} />
      <Label>{current.label}</Label>

      <SystemWindow style={styles.card}>
        <Title>{current.title}</Title>
        <View style={{ height: space.xs }} />
        <Txt color={colors.muted}>{current.hint}</Txt>
        <View style={{ height: space.lg }} />
        {current.body}
      </SystemWindow>

      <View style={styles.nav}>
        {step > 0 ? (
          <Pressable onPress={() => setStep((s) => s - 1)} style={styles.navBtn}>
            <Txt color={colors.muted}>Back</Txt>
          </Pressable>
        ) : (
          <View style={styles.navBtn} />
        )}

        <Num color={colors.muted}>{step + 1} / {steps.length}</Num>

        <GlowButton
          label={isLast ? 'BEGIN' : 'Next'}
          variant={isLast ? 'gold' : 'primary'}
          disabled={!canAdvance()}
          onPress={() => (isLast ? finish() : setStep((s) => s + 1))}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: space.lg, paddingTop: 64, paddingBottom: 48 },
  card: { marginTop: space.md },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
  },
  chipTxt: { fontSize: 14 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  timeField: { width: '46%' },
  timeInput: {
    marginTop: space.xs,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 4,
    padding: space.sm,
    color: colors.cyan,
    fontFamily: fonts.mono,
    fontSize: 18,
  },
  goalInput: {
    marginTop: space.xs,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 4,
    padding: space.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
    minHeight: 60,
  },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xl },
  navBtn: { minWidth: 84, paddingVertical: space.md, paddingHorizontal: space.md, alignItems: 'center' },
  primary: { backgroundColor: colors.cyan, borderRadius: 4 },
  busy: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
