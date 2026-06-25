/**
 * Recurring transaction rules — fire logic + materialization.
 *
 * Pure functions; no AsyncStorage, no React. The mobile BudgetContext calls
 * `runRecurringRules(blob, now)` on hydration to generate any transactions
 * that should have fired this month but haven't.
 *
 * v1 semantics:
 *   • Each rule generates AT MOST ONE transaction per month (idempotent via
 *     `lastGeneratedMonth`).
 *   • Rules fire on `dayOfMonth`, clamped to the last day if the month is
 *     shorter (e.g., dayOfMonth=31 on Feb fires on Feb 28).
 *   • Missed months are NOT backfilled — only the current month is considered.
 *     If the user didn't open the app for 3 months, we generate at most one
 *     transaction for the current month per rule.
 *   • Inactive rules never fire.
 */

import type { BudgetBlob, RecurringTransaction, Transaction } from './types';
import { monthKeyFor } from './storage';

/**
 * The last day of the month for the given year/month-index (0–11).
 * Trick: day 0 of the *next* month is the last day of the current month.
 */
function lastDayOfMonth(year: number, monthIndex0: number): number {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
}

/**
 * Decide whether a rule should fire given the current date. Returns true when:
 *   • The rule is active
 *   • Today (UTC) >= the rule's clamped dayOfMonth
 *   • The rule hasn't already fired this month
 */
export function shouldFireRule(rule: RecurringTransaction, now: Date): boolean {
  if (!rule.active) return false;

  const currentMonthKey = monthKeyFor(now);
  if (rule.lastGeneratedMonth === currentMonthKey) return false;

  const day = now.getUTCDate();
  const lastDay = lastDayOfMonth(now.getUTCFullYear(), now.getUTCMonth());
  const fireDay = Math.min(rule.dayOfMonth, lastDay);
  return day >= fireDay;
}

/**
 * Build the Transaction that a rule generates. The transaction's `loggedAt`
 * is set to the rule's fire-day at noon UTC (not "now") so multiple rules
 * firing in the same launch cluster at predictable times in the day rather
 * than at exactly the open instant.
 */
export function materializeRule(
  rule: RecurringTransaction,
  now: Date,
  newId: () => string,
): Transaction {
  const lastDay = lastDayOfMonth(now.getUTCFullYear(), now.getUTCMonth());
  const fireDay = Math.min(rule.dayOfMonth, lastDay);
  const loggedAt = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), fireDay, 12, 0, 0),
  );
  return {
    id: newId(),
    amount: rule.amount,
    categoryId: rule.categoryId,
    note: rule.note?.trim() || rule.name,
    loggedAt: loggedAt.toISOString(),
    monthKey: monthKeyFor(now),
  };
}

/**
 * Run every recurring rule once. Returns the updated blob with:
 *   • Newly-generated transactions prepended to `current.transactions`
 *   • Each fired rule's `lastGeneratedMonth` bumped to the current month
 *
 * Idempotent — calling repeatedly in the same month is a no-op after the
 * first call.
 */
export function runRecurringRules(
  blob: BudgetBlob,
  now: Date,
  newId: () => string,
): BudgetBlob {
  const currentMonthKey = monthKeyFor(now);
  const newTxs: Transaction[] = [];
  const nextRecurring: RecurringTransaction[] = blob.recurring.map((rule) => {
    if (shouldFireRule(rule, now)) {
      newTxs.push(materializeRule(rule, now, newId));
      return { ...rule, lastGeneratedMonth: currentMonthKey };
    }
    return rule;
  });

  if (newTxs.length === 0) return blob;

  return {
    ...blob,
    recurring: nextRecurring,
    current: {
      ...blob.current,
      transactions: [...newTxs, ...blob.current.transactions],
    },
  };
}
