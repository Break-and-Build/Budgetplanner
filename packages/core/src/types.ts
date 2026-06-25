// ─── Income ───────────────────────────────────────────────────────────────────

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
}

// ─── Priority Expenses ────────────────────────────────────────────────────────

export interface PriorityExpense {
  id: string;
  name: string;
  amount: number;
  isFixed: boolean;
}

// ─── Savings ──────────────────────────────────────────────────────────────────

export type SavingsType = 'amount' | 'percentage';

export interface SavingsEntry {
  id: string;
  name: string;
  type: SavingsType;
  value: number;
}

export interface SavingsData {
  enabled: boolean;
  entries: SavingsEntry[];
}

// ─── Flexible Buckets ─────────────────────────────────────────────────────────

export interface BucketsData {
  needs: number;
  lifestyle: number;
  niceToHave: number;
}

// ─── Monthly Reflection ───────────────────────────────────────────────────────

export interface ReflectionData {
  tight: string;
  flexible: string;
  intentional: string;
}

// ─── Split Plan ───────────────────────────────────────────────────────────────

export interface SplitPlan {
  essentials: number;
  growth: number;
  stability: number;
  rewards: number;
}

// ─── v2: Tracking model ───────────────────────────────────────────────────────
// Added by the v1→v2 migration. The wizard model above continues to live inside
// MonthState.plan; v2 layers transactions on top of it.

/** The four budget categories. Locked enum — not user-defined in v1. */
export type CategoryId = 'essentials' | 'growth' | 'stability' | 'rewards';

/**
 * A single logged spend. Money only — income is captured per-month in `plan`.
 * `monthKey` is the YYYY-MM the transaction is bucketed under (independent of
 * the system clock at log time, so a late-logged transaction can be backdated).
 */
export interface Transaction {
  id: string;
  amount: number;
  categoryId: CategoryId;
  note?: string;
  /** ISO timestamp of when the spend occurred. */
  loggedAt: string;
  /** YYYY-MM. The month this transaction counts against. */
  monthKey: string;
}

/** A frozen snapshot of the user's plan at the start of a month. */
export interface BudgetPlan {
  income: IncomeSource[];
  priorities: PriorityExpense[];
  savings: SavingsData;
  /** The four-category split. Editable preset; defaults to 50/25/15/10. */
  split: SplitPlan;
}

/**
 * Everything about a single calendar month. The active month sits at the top
 * of `BudgetBlob.months[]`; historical months keep `closedAt`.
 */
export interface MonthState {
  /** YYYY-MM. */
  monthKey: string;
  plan: BudgetPlan;
  transactions: Transaction[];
  reflection?: ReflectionData;
  /** ISO timestamp. Present only when the user has closed out the month. */
  closedAt?: string;
}

/**
 * A recurring transaction rule — a subscription, gym fee, etc. that auto-
 * generates a `Transaction` on the configured day of each month.
 *
 * Distinct from `PriorityExpense` (which is a pre-budget deduction with no
 * category and never becomes a transaction). Recurring rules ARE budget
 * spend and DO have a category.
 */
export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  categoryId: CategoryId;
  note?: string;
  /**
   * Calendar day-of-month the transaction fires on. 1–31. If the month has
   * fewer days, falls back to the last day (e.g., 31 → Feb 28).
   */
  dayOfMonth: number;
  /**
   * YYYY-MM of the last month we generated a transaction for this rule.
   * Prevents double-firing if the app is opened multiple times in the same
   * month after the trigger day.
   */
  lastGeneratedMonth?: string;
  /** False to pause without deleting. */
  active: boolean;
  /** ISO timestamp the rule was created. */
  createdAt: string;
}

/**
 * The persisted shape. One blob per device. `current` is the active month;
 * `history` is closed months in reverse-chronological order.
 */
export interface BudgetBlob {
  schemaVersion: 2;
  currency: string;
  current: MonthState;
  history: MonthState[];
  /** Recurring subscription rules. Auto-generates transactions on their day. */
  recurring: RecurringTransaction[];
  /** Where the setup wizard left off, if it's mid-flow. 1-indexed, 1..6. */
  setupStep?: number;
  /** True once the user has completed setup at least once. Drives FirstRun gate. */
  setupComplete: boolean;
  /**
   * Opt-in flag for the two local reminders (daily 9am + 28th-of-month). Off
   * by default — respects the brief's "no preachy notifications" rule.
   */
  remindersEnabled?: boolean;
}

// ─── Legacy v1 shape (for migration only) ────────────────────────────────────
// Kept verbatim so the migration is mechanical and testable.

export interface BudgetBlobV1 {
  currentStep?: number;
  currency?: string;
  incomeSources?: IncomeSource[];
  expenses?: PriorityExpense[];
  savings?: SavingsData | { enabled?: boolean; type?: SavingsType; value?: number };
  buckets?: BucketsData;
  reflection?: ReflectionData;
  splitPlan?: SplitPlan | null;
}
