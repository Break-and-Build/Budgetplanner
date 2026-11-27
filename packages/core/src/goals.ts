/**
 * Named savings goals — pure helpers (no React, no storage). The mobile
 * BudgetContext wires these up; tests can call them directly.
 *
 * Progress shape: sum(contributions) / targetAmount, clamped at 1.
 * Pace shape (when a targetDate exists): compare "contributed per
 * elapsed-day" to "required per-day-to-target."
 */

import type { Goal, GoalContribution } from './types';

/** Sum every contribution amount on a goal. */
export function goalContributed(goal: Goal): number {
  return goal.contributions.reduce((s, c) => s + c.amount, 0);
}

/** Remaining until the goal's target. Non-negative — reached goals return 0. */
export function goalRemaining(goal: Goal): number {
  return Math.max(0, goal.targetAmount - goalContributed(goal));
}

/**
 * Progress 0..1. A target of 0 returns 1 (degenerate: the goal is nominally
 * reached with any contribution at all).
 */
export function goalProgress(goal: Goal): number {
  if (goal.targetAmount <= 0) return 1;
  return Math.min(1, goalContributed(goal) / goal.targetAmount);
}

/** True when contributions have met or passed the target. */
export function goalReached(goal: Goal): boolean {
  return goalContributed(goal) >= goal.targetAmount;
}

export type GoalPace = 'ahead' | 'onTrack' | 'behind' | 'noDate';

/**
 * Pace signal for a goal with a target date. Compares actual per-day
 * contribution rate to the required per-day-to-target rate. 5% dead zone
 * matches the paceStatus convention for budget pace — mood indicator, not
 * accountant.
 *
 * Goals without a targetDate return 'noDate' — pace is meaningless without
 * a deadline.
 */
export function goalPace(goal: Goal, now: Date = new Date()): GoalPace {
  if (!goal.targetDate) return 'noDate';
  if (goalReached(goal)) return 'ahead';

  const created = new Date(goal.createdAt).getTime();
  const target = new Date(goal.targetDate).getTime();
  const nowMs = now.getTime();
  if (!Number.isFinite(created) || !Number.isFinite(target)) return 'noDate';
  if (target <= created) return 'noDate';

  const totalDays = Math.max(1, (target - created) / 86400000);
  const elapsedDays = Math.max(0, (nowMs - created) / 86400000);
  if (elapsedDays <= 0) return 'onTrack';

  const contributed = goalContributed(goal);
  const requiredPerDay = goal.targetAmount / totalDays;
  const actualPerDay = contributed / elapsedDays;

  const delta = (actualPerDay - requiredPerDay) / Math.max(1, requiredPerDay);
  if (delta >= 0.05) return 'ahead';
  if (delta <= -0.05) return 'behind';
  return 'onTrack';
}

/** Generate a new goal id. Collision-safe enough for a local-only app. */
export function newGoalId(): string {
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Generate a new contribution id. */
export function newGoalContributionId(): string {
  return `gc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Append a contribution to a goal and return the updated goal. Pure — the
 * BudgetContext wraps this when setBlob'ing.
 */
export function addGoalContribution(goal: Goal, contribution: GoalContribution): Goal {
  return {
    ...goal,
    contributions: [...goal.contributions, contribution],
  };
}

/** Remove one contribution by id. */
export function removeGoalContribution(goal: Goal, contributionId: string): Goal {
  return {
    ...goal,
    contributions: goal.contributions.filter((c) => c.id !== contributionId),
  };
}
