/**
 * Notifications — local-only, on by default.
 *
 * Two scheduled reminders, both via `expo-notifications` (no server needed,
 * no push tokens, no Supabase dependency):
 *
 *   1. Daily at a user-chosen time — "Today's budget" (taps open Home)
 *   2. 28th of each month, 10am — "[Month] is winding down" (taps open MonthClose)
 *
 * Tone matches the brief — calm, factual, not preachy. No emoji, no streaks.
 *
 * Reminders are scheduled automatically once the OS grants permission; the only
 * way to turn them off is the system notification settings. The daily time
 * lives in BudgetBlob.reminderHour/reminderMinute.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/** Identifier for our daily reminder. Used to find + cancel it. */
const DAILY_ID = 'budgetplanner.reminder.daily';
/** Identifier for the 28th-of-month close-out reminder. */
const MONTH_END_ID = 'budgetplanner.reminder.monthEnd';

// Notifications display behavior when the app is in the foreground.
// (Without this, foreground notifications are silently swallowed on iOS.)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Ask the OS for notification permission. Idempotent — calling when already
 * granted is a no-op. Returns true if granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return true;
  if (existing.status === 'denied' && !existing.canAskAgain) {
    // User has hard-denied; OS won't show the prompt again. Caller should
    // surface "enable in Settings" copy.
    return false;
  }
  const next = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: false,
    },
  });
  return next.status === 'granted';
}

/** True when notifications are currently permitted (does not prompt). */
export async function getNotificationsGranted(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  return existing.status === 'granted';
}

/**
 * Cancel any existing reminder and schedule the daily reminder fresh at the
 * given time. Idempotent — safe to call on every app launch (cheap, doesn't
 * pile up).
 */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  // Clean up any previous instance under this identifier.
  await Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_ID,
    content: {
      // NOTE: never pass `sound: null` — the native module expects
      // `boolean | string`, and null makes scheduleNotificationAsync reject.
      // Omitting `sound` is what gives us a silent notification on iOS.
      title: "Today's budget",
      body: 'Tap to log the day and see what you have left to spend.',
      data: { type: 'daily' },
    },
    // DAILY is the purpose-built "every day at HH:MM" trigger. It repeats on
    // its own (no `repeats` flag), and is more reliable than a CALENDAR trigger
    // with partial date components for a plain daily reminder.
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/**
 * Schedule the next 28th-of-the-month reminder at 10am. We schedule one at
 * a time (not as a repeating trigger) so the body text can include the
 * specific month name. Re-schedule from the app whenever the previous one
 * fires (e.g., on next app launch after the 28th).
 */
export async function scheduleMonthEndReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(MONTH_END_ID).catch(() => {});

  const now = new Date();
  // Target: this month's 28th at 10am — or next month's 28th if already past.
  const target = new Date(now.getFullYear(), now.getMonth(), 28, 10, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setMonth(target.getMonth() + 1);
  }
  const monthName = target.toLocaleDateString(undefined, { month: 'long' });

  await Notifications.scheduleNotificationAsync({
    identifier: MONTH_END_ID,
    content: {
      title: `${monthName} is winding down`,
      body: 'Tap to close out and start the next month.',
      data: { type: 'monthEnd' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: target,
    },
  });
}

/** Cancel both scheduled reminders. Safe to call when nothing is scheduled. */
export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(MONTH_END_ID).catch(() => {});
}

/**
 * Schedule everything fresh at the given daily time. Called on every app launch
 * (once permission is granted) so notifications stay scheduled even if the OS
 * dropped them — happens sometimes after reboot — and whenever the user changes
 * the reminder time.
 */
export async function scheduleAllReminders(hour: number, minute: number): Promise<void> {
  await scheduleDailyReminder(hour, minute);
  await scheduleMonthEndReminder();
}

/**
 * Inspect what's currently scheduled. Useful for debugging / a future
 * "view scheduled reminders" screen.
 */
export async function getScheduledReminders() {
  return Notifications.getAllScheduledNotificationsAsync();
}

/** True when we're on iOS — used by Settings UI to show iOS-specific copy. */
export const isIOS = Platform.OS === 'ios';
