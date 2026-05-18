/**
 * Web-side selectors. Mirror of `apps/mobile/src/state/selectors.ts`.
 *
 * Kept separate so the web preview doesn't pull in React Native deps.
 * Both files compute the same numbers from the same shared types.
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

const CATEGORY_IDS: readonly CategoryId[] = ['essentials', 'growth', 'stability', 'rewards'];

export function spentByCategory(month: MonthState): Record<CategoryId, number> {
  const acc: Record<CategoryId, number> = { essentials: 0, growth: 0, stability: 0, rewards: 0 };
  for (const t of month.transactions) acc[t.categoryId] += t.amount;
  return acc;
}

export function monthSafeToSpend(plan: BudgetPlan): number {
  const income = calcTotalIncome(plan.income);
  const priorities = calcTotalPriorities(plan.priorities);
  const remainingAfterPriorities = income - priorities;
  const savings = calcSavingsTotal(plan.savings, remainingAfterPriorities);
  return calcSafeToSpend(income, priorities, savings);
}

export function allocatedByCategory(plan: BudgetPlan): Record<CategoryId, number> {
  const total = monthSafeToSpend(plan);
  const { essentials, growth, stability, rewards } = plan.split;
  const e = Math.round(total * (essentials / 100));
  const g = Math.round(total * (growth / 100));
  const s = Math.round(total * (stability / 100));
  const r = Math.round(total * (rewards / 100));
  const drift = total - (e + g + s + r);
  return { essentials: e + drift, growth: g, stability: s, rewards: r };
}

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

export function monthRemaining(month: MonthState): number {
  const r = remainingByCategory(month);
  return CATEGORY_IDS.reduce((s, id) => s + r[id], 0);
}

export function daysRemainingIn(monthKey: string, now: Date = new Date()): number {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m) return 1;
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const today =
    now.getUTCFullYear() === y && now.getUTCMonth() + 1 === m ? now.getUTCDate() : 1;
  return Math.max(1, lastDay - today + 1);
}

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

export function recentTransactions(month: MonthState, n: number): Transaction[] {
  return [...month.transactions]
    .sort((a, b) => (a.loggedAt < b.loggedAt ? 1 : -1))
    .slice(0, n);
}

function isoDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
