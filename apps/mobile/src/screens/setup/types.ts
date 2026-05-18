/**
 * Shared types for the SetupRitual flow.
 *
 * Steps receive the same shape of props so the orchestrator can route between
 * them with minimal ceremony.
 */

import type {
  IncomeSource,
  PriorityExpense,
  SavingsData,
  SplitPlan,
} from '@budgetplanner/core';

export interface SetupFormState {
  income: IncomeSource[];
  priorities: PriorityExpense[];
  savings: SavingsData;
  split: SplitPlan;
}

export interface StepProps {
  /** 1-indexed step number for the progress dots. Omit (or 0) to hide dots. */
  step?: number;
  totalSteps?: number;
  /**
   * 'create' (default) — SetupRitual flow. Primary button reads "Continue".
   * 'edit'           — AdjustPlan flow. Primary button reads "Save".
   * Caption above the question also adapts: "Step N of M · X" vs "Editing · X".
   */
  mode?: 'create' | 'edit';
  form: SetupFormState;
  setForm: React.Dispatch<React.SetStateAction<SetupFormState>>;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Generate a stable-enough id for a new list row (income/priority/savings).
 * Local-only — collisions are vanishingly unlikely with a 6-char random tail.
 */
export function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
