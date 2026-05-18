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
import { CATEGORY_IDS } from './categories';

/** Sum of all logged transactions for this month. */
export function totalSpent(month: MonthState): number {
  return month.transactions.reduce((s, t) => s + t.amount, 0);
}

/** Sum of spent per category as a Record. Categories with no spend return 0. */
export function spentByCategory(month: MonthState): Record<CategoryId, number> {
  const acc: Record<CategoryId, number> = {
    essentials: 0,
    growth: 0,
    stability: 0,
    rewards: 0,
  };
  for (const t of month.transactions) acc[t.categoryId] += t.amount;
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
 * Allocated amount per category, derived from the editable split preset.
 * Split percentages sum to 100; the four allocations sum exactly to the
 * flexible budget (rounding drift goes to essentials).
 */
export function allocatedByCategory(plan: BudgetPlan): Record<CategoryId, number> {
  const total = monthSafeToSpend(plan);
  const { essentials, growth, stability, rewards } = plan.split;
  const e = Math.round(total * (essentials / 100));
  const g = Math.round(total * (growth / 100));
  const s = Math.round(total * (stability / 100));
  const r = Math.round(total * (rewards / 100));
  // Correct rounding drift so the four allocations sum exactly.
  const drift = total - (e + g + s + r);
  return {
    essentials: e + drift,
    growth: g,
    stability: s,
    rewards: r,
  };
}

/** Remaining per category — allocated minus spent. Negative when over-budget. */
export function remainingByCategory(month: MonthState): Record<CategoryId, number> {
  const allocated = allocatedByCategory(month.plan);
  const spent = spentByCategory(month);
  return {
    essentials: allocated.essentials - spent.essentials,
    growth: allocated.growth - spent.growth,
    stability: allocated.stability - spent.stability,
    rewards: allocated.rewards - spent.rewards,
  };
}

/** Total remaining across all four categories. */
export function monthRemaining(month: MonthState): number {
  const r = remainingByCategory(month);
  return CATEGORY_IDS.reduce((s, id) => s + r[id], 0);
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
 * the FastLogSheet's category chip. Falls back to 'essentials' on a fresh
 * month because that's statistically the most likely first log.
 */
export function lastUsedCategory(month: MonthState): CategoryId {
  if (month.transactions.length === 0) return 'essentials';
  let mostRecent = month.transactions[0];
  for (const t of month.transactions) {
    if (t.loggedAt > mostRecent.loggedAt) mostRecent = t;
  }
  return mostRecent.categoryId;
}

function isoDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
