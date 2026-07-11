/**
 * Reminder-time helpers — pure, shared by the app and tests.
 *
 * Users can set several daily reminder times (e.g. morning / midday / evening).
 * These helpers keep that list clean: clamped to valid 24h values, de-duplicated,
 * sorted, and capped.
 */

import type { ReminderTime } from './types';

/** Most daily reminder times a user can set. */
export const MAX_REMINDER_TIMES = 5;

/** The default when none are set — a single evening nudge. */
export function defaultReminderTimes(): ReminderTime[] {
  return [{ hour: 20, minute: 0 }];
}

/**
 * Clamp each time to valid 24h values and cap the count. Insertion order is
 * preserved on purpose — the Settings list shows times in the order the user
 * added them, so editing a row never makes it jump under their finger. Order
 * has no effect on scheduling.
 */
export function normalizeReminderTimes(times: ReminderTime[]): ReminderTime[] {
  return (Array.isArray(times) ? times : [])
    .filter((t) => t && typeof t.hour === 'number' && typeof t.minute === 'number')
    .map((t) => ({
      hour: Math.max(0, Math.min(23, Math.floor(t.hour))),
      minute: Math.max(0, Math.min(59, Math.floor(t.minute))),
    }))
    .slice(0, MAX_REMINDER_TIMES);
}
