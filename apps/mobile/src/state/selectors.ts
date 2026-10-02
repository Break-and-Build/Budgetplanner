/**
 * Pure selector helpers — derive UI numbers from a `MonthState`.
 *
 * Kept free of React and AsyncStorage so they're unit-testable. The mobile
 * BudgetContext / BudgetStore wires them up; tests can call them directly.
 */

import type {
  BudgetPlan,
  CategoryId,
  MonthState,
  RecurringTransaction,
  Transaction,
} from '@budgetplanner/core';
import {
  calcTotalIncome,
  calcTotalPriorities,
  calcSavingsTotal,
  calcSafeToSpend,
} from '@budgetplanner/core';

/** Sum of all logged transactions for this month. */
export function totalSpent(month: MonthState): number {
  return month.transactions.reduce((s, t) => s + t.amount, 0);
}

/**
 * Sum of spent per category id. Every current plan category is present (0 if
 * unspent); transactions under a deleted category keep their old id so their
 * spend still counts toward month totals.
 */
export function spentByCategory(month: MonthState): Record<CategoryId, number> {
  const acc: Record<CategoryId, number> = {};
  for (const c of month.plan.categories) acc[c.id] = 0;
  for (const t of month.transactions) acc[t.categoryId] = (acc[t.categoryId] ?? 0) + t.amount;
  return acc;
}

/**
 * Total "flexible" budget for the month — what the four category bars share.
 * Income − Priorities − Savings, clamped at 0. Matches the wizard's
 * "safe to spend" formula.
 */
export function monthSafeToSpend(plan: BudgetPlan): number {
  const income = calcTotalIncome(plan.income);
  const priorities = calcTotalPriorities(plan.priorities);
  const remainingAfterPriorities = income - priorities;
  const savings = calcSavingsTotal(plan.savings, remainingAfterPriorities);
  return calcSafeToSpend(income, priorities, savings);
}

/**
 * Allocated amount per category id, derived from each category's percentage
 * of the flexible budget. Percentages sum to 100; the allocations sum exactly
 * to the flexible budget (rounding drift goes to the first category).
 */
export function allocatedByCategory(plan: BudgetPlan): Record<CategoryId, number> {
  const total = monthSafeToSpend(plan);
  const out: Record<CategoryId, number> = {};
  let allocated = 0;
  for (const c of plan.categories) {
    const v = Math.round(total * ((c.percent || 0) / 100));
    out[c.id] = v;
    allocated += v;
  }
  // Correct rounding drift so the allocations sum exactly to the budget.
  if (plan.categories.length > 0) {
    const first = plan.categories[0].id;
    out[first] += total - allocated;
  }
  return out;
}

/** Remaining per category — allocated minus spent. Negative when over-budget. */
export function remainingByCategory(month: MonthState): Record<CategoryId, number> {
  const allocated = allocatedByCategory(month.plan);
  const spent = spentByCategory(month);
  const out: Record<CategoryId, number> = {};
  for (const c of month.plan.categories) {
    out[c.id] = (allocated[c.id] ?? 0) - (spent[c.id] ?? 0);
  }
  return out;
}

/**
 * Sum of active recurring rules that haven't fired yet this month.
 *
 * "Already fired" means `lastGeneratedMonth === currentMonthKey` — those are
 * live transactions and already counted in `totalSpent`. Anything else is
 * money the user has committed to spending but hasn't yet, and should be
 * reserved from the "what's safe to spend" math so the hero number tells the
 * honest truth throughout the month, not just after the rule's day arrives.
 *
 * Rules added mid-month after their `dayOfMonth` has passed won't fire until
 * next month and are correctly excluded by that same check.
 */
export function pendingRecurring(
  recurring: RecurringTransaction[],
  currentMonthKey: string,
): number {
  return recurring
    .filter((r) => r.active && r.lastGeneratedMonth !== currentMonthKey)
    .reduce((s, r) => s + r.amount, 0);
}

/**
 * Total remaining across the month: flexible budget minus everything spent
 * (including spend under since-deleted categories, which has no allocation),
 * minus any recurring rules that still have to fire this month.
 *
 * Reserving pending recurring here is what keeps the hero figure honest
 * throughout the month — the money the user has committed to internet, rent
 * etc. is out of the pot from day 1, not from the day it posts.
 */
export function monthRemaining(
  month: MonthState,
  recurring: RecurringTransaction[] = [],
): number {
  return (
    monthSafeToSpend(month.plan) -
    totalSpent(month) -
    pendingRecurring(recurring, month.monthKey)
  );
}

/**
 * How many calendar days are left in the month, inclusive of `now`.
 * Returns at least 1 so per-day math never divides by zero.
 */
export function daysRemainingIn(monthKey: string, now: Date = new Date()): number {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m) return 1;
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate(); // 28/29/30/31
  const today = now.getUTCFullYear() === y && now.getUTCMonth() + 1 === m ? now.getUTCDate() : 1;
  return Math.max(1, lastDay - today + 1);
}

/**
 * Today's safe-to-spend.
 *
 *   (monthRemaining − todaySpentAlready) / daysRemaining
 *
 * Clamped at 0. The "today spent" subtraction means: if you've already burned
 * through today's allowance, the hero number says 0 — the bars and the
 * "over today" implication tell the user the rest.
 */
export function todaysSafeToSpend(
  month: MonthState,
  now: Date = new Date(),
  recurring: RecurringTransaction[] = [],
): number {
  const remaining = monthRemaining(month, recurring);
  const days = daysRemainingIn(month.monthKey, now);
  const perDay = remaining / days;

  const todayKey = isoDateKey(now);
  const todaySpent = month.transactions
    .filter((t) => isoDateKey(new Date(t.loggedAt)) === todayKey)
    .reduce((s, t) => s + t.amount, 0);

  return Math.max(0, Math.round(perDay - todaySpent));
}

/** Last `n` transactions across all categories, newest first. */
export function recentTransactions(month: MonthState, n: number): Transaction[] {
  return [...month.transactions]
    .sort((a, b) => (a.loggedAt < b.loggedAt ? 1 : -1))
    .slice(0, n);
}

/**
 * The category of the most recently logged transaction — used to pre-select
 * the FastLogSheet's category chip. Falls back to the first category on a
 * fresh month, or when the last-used category has since been deleted.
 */
export function lastUsedCategory(month: MonthState): CategoryId {
  const fallback = month.plan.categories[0]?.id ?? '';
  if (month.transactions.length === 0) return fallback;
  let mostRecent = month.transactions[0];
  for (const t of month.transactions) {
    if (t.loggedAt > mostRecent.loggedAt) mostRecent = t;
  }
  const exists = month.plan.categories.some((c) => c.id === mostRecent.categoryId);
  return exists ? mostRecent.categoryId : fallback;
}

function isoDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─── Pace ──────────────────────────────────────────────────────────────────
// Comparing "spent so far" to "even-burn suggested spend so far" gives us the
// pace read-out on Home. The user isn't watching a spreadsheet — they want to
// know at a glance whether they're on track. One chip, one word.

export type Pace = 'ahead' | 'onPace' | 'behind' | 'atLimit';

/** Days completed in `monthKey` up to and including `now`. At least 0. */
function daysElapsedIn(monthKey: string, now: Date = new Date()): number {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m) return 0;
  const inThisMonth = now.getUTCFullYear() === y && now.getUTCMonth() + 1 === m;
  return inThisMonth ? Math.max(0, now.getUTCDate() - 1) : 0;
}

/**
 * How you're doing vs. an even burn rate.
 *
 *   suggestedSpentSoFar = flexibleBudget × (daysElapsed / daysInMonth)
 *
 * ahead  = spent is ≥5% under suggestion
 * onPace = spent is within ±5% of suggestion
 * behind = spent is ≥5% over suggestion (but budget still positive)
 * atLimit = nothing left to spend today
 *
 * The 5% dead-zone stops the chip flip-flopping day-to-day; it's a mood
 * indicator, not an accountant.
 */
export function paceStatus(
  month: MonthState,
  now: Date = new Date(),
  recurring: RecurringTransaction[] = [],
): Pace {
  if (todaysSafeToSpend(month, now, recurring) <= 0) return 'atLimit';
  const budget = monthSafeToSpend(month.plan);
  if (budget <= 0) return 'onPace';
  const elapsed = daysElapsedIn(month.monthKey, now);
  const total = elapsed + daysRemainingIn(month.monthKey, now);
  if (elapsed <= 0) return 'onPace'; // day 1 — nothing to judge against
  const suggested = budget * (elapsed / total);
  // Count the reserved-but-not-yet-fired recurring as "already committed" so
  // the pace read matches what the user sees in the hero.
  const spent = totalSpent(month) + pendingRecurring(recurring, month.monthKey);
  const delta = (spent - suggested) / Math.max(1, suggested);
  if (delta <= -0.05) return 'ahead';
  if (delta >= 0.05) return 'behind';
  return 'onPace';
}
