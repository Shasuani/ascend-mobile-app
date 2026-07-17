// Local notifications (§7): a reminder before the reset and a penalty warning
// near midnight. Works fully offline — no backend, no push tokens.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Foreground display behavior.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const REMINDER_HOUR = 20;   // 20:00 — "quests still await"
const REMINDER_MIN = 0;
const WARNING_HOUR = 23;    // 23:30 — "final hour before penalty"
const WARNING_MIN = 30;

async function ensurePermission() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === 'granted';
}

async function schedule(hour, minute, title, body) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { hour, minute, repeats: true },
  });
}

// Request permission (once) and (re)install the two daily reminders.
export async function setupNotifications() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily', {
        name: 'Daily Quests',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const ok = await ensurePermission();
    if (!ok) return false;

    // Clear stale schedules so we never stack duplicates across app launches.
    await Notifications.cancelAllScheduledNotificationsAsync();

    await schedule(REMINDER_HOUR, REMINDER_MIN, 'THE SYSTEM', 'Quests remain. The System is watching.');
    await schedule(WARNING_HOUR, WARNING_MIN, 'THE SYSTEM', 'Final hour. Unfinished quests will cost you XP.');
    return true;
  } catch (e) {
    return false; // notifications are best-effort; never block the app
  }
}

export async function cancelNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {}
}
