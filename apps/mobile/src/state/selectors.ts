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
 * Total remaining across the month: flexible budget minus everything spent
 * (including spend under since-deleted categories, which has no allocation).
 */
export function monthRemaining(month: MonthState): number {
  return monthSafeToSpend(month.plan) - totalSpent(month);
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
export function todaysSafeToSpend(month: MonthState, now: Date = new Date()): number {
  const remaining = monthRemaining(month);
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
