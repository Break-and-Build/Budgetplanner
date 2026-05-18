import type {
  IncomeSource,
  PriorityExpense,
  SavingsData,
  SavingsEntry,
  SplitPlan,
} from './types';

// ─── Income ───────────────────────────────────────────────────────────────────

/**
 * Returns the sum of all income source amounts.
 */
export function calcTotalIncome(sources: IncomeSource[]): number {
  return sources.reduce((sum, s) => sum + (s.amount || 0), 0);
}

// ─── Priority Expenses ────────────────────────────────────────────────────────

/**
 * Returns the sum of all priority expense amounts.
 */
export function calcTotalPriorities(expenses: PriorityExpense[]): number {
  return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
}

// ─── Savings ──────────────────────────────────────────────────────────────────

/**
 * Calculates the monetary amount for a single savings entry.
 * - type === 'amount'     → entry.value directly
 * - type === 'percentage' → (entry.value / 100) * base
 */
export function calcSavingsEntryAmount(
  entry: SavingsEntry,
  base: number
): number {
  if (entry.type === 'percentage') {
    return Math.round(((entry.value || 0) / 100) * base);
  }
  return entry.value || 0;
}

/**
 * Returns total savings across all enabled entries.
 * Returns 0 if savings is disabled.
 */
export function calcSavingsTotal(
  savings: SavingsData,
  remainingAfterPriorities: number
): number {
  if (!savings.enabled || savings.entries.length === 0) return 0;
  return savings.entries.reduce(
    (sum, entry) =>
      sum + calcSavingsEntryAmount(entry, remainingAfterPriorities),
    0
  );
}

// ─── Safe To Spend ────────────────────────────────────────────────────────────

/**
 * Safe to spend = income − priority expenses − savings.
 * Clamped to 0 so it never goes negative in the UI display.
 */
export function calcSafeToSpend(
  totalIncome: number,
  totalPriorities: number,
  totalSavings: number
): number {
  return Math.max(0, totalIncome - totalPriorities - totalSavings);
}

// ─── Split Plan ───────────────────────────────────────────────────────────────

/**
 * Drafts a 50/25/15/10 split plan from the safe-to-spend amount.
 *
 * Percentages:
 *   50% → Essentials  (needs, groceries, transport)
 *   25% → Growth      (savings, investments, upskilling)
 *   15% → Stability   (emergency fund, insurance)
 *   10% → Rewards     (entertainment, treats, dining out)
 *
 * Values are rounded to whole numbers; any remainder (from rounding) is
 * added to essentials so the four values always sum exactly to the input.
 */
export function calcSplitPlan(safeToSpend: number): SplitPlan {
  const essentials = Math.round(safeToSpend * 0.5);
  const growth = Math.round(safeToSpend * 0.25);
  const stability = Math.round(safeToSpend * 0.15);
  const rewards = Math.round(safeToSpend * 0.1);

  // Correct for rounding drift
  const allocated = essentials + growth + stability + rewards;
  const drift = safeToSpend - allocated;

  return {
    essentials: essentials + drift,
    growth,
    stability,
    rewards,
  };
}