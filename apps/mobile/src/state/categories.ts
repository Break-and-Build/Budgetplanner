/**
 * The four budget categories — display labels & IDs.
 *
 * Locked enum per the brief; not user-editable in v1. Kept in one place so
 * UI copy can't drift between screens.
 */

import type { CategoryId } from '@budgetplanner/core';

export const CATEGORY_IDS: readonly CategoryId[] = [
  'essentials',
  'growth',
  'stability',
  'rewards',
] as const;

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  essentials: 'Essentials',
  growth: 'Growth',
  stability: 'Stability',
  rewards: 'Rewards',
};
