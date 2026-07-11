/**
 * Pure storage helpers — no AsyncStorage import here.
 *
 * - `monthKeyFor(date)`         produces a stable YYYY-MM string.
 * - `defaultSplit()`            returns the canonical 50/25/15/10 preset.
 * - `emptyBudgetBlob()`         produces a fresh blob for first-run.
 * - `migrateV1ToV2(raw)`        upgrades the legacy wizard blob.
 * - `parseBudgetBlob(raw)`      defensive parse with migration when needed.
 * - `shouldShowMonthCloseBanner(now, current)`  banner trigger logic.
 *
 * Everything here is deterministic. The mobile app wraps these with
 * AsyncStorage in `apps/mobile/src/state/BudgetStore.ts`.
 */

import type {
  BudgetBlob,
  BudgetBlobV1,
  BudgetPlan,
  MonthState,
  SavingsData,
  SplitPlan,
} from './types';
import { categoriesFromSplit, defaultCategories } from './categories';
import { defaultReminderTimes, normalizeReminderTimes } from './reminders';

// React Native injects this at build time. In other environments it's
// undefined and the self-checks at the bottom are skipped.
declare const __DEV__: boolean | undefined;

/** ISO YYYY-MM for the calendar month of `date`. UTC-stable for clarity. */
export function monthKeyFor(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** The canonical default category split. Sums to 100. */
export function defaultSplit(): SplitPlan {
  return { essentials: 50, growth: 25, stability: 15, rewards: 10 };
}

/**
 * Drop blank rows (no name AND no amount/value) from a plan before saving.
 * Setup steps let a user leave a trailing empty row while editing; this keeps
 * those phantoms out of the persisted plan so totals and lists stay clean.
 */
export function cleanPlan(plan: BudgetPlan): BudgetPlan {
  return {
    income: plan.income.filter((i) => i.name.trim() || i.amount > 0),
    priorities: plan.priorities.filter((p) => p.name.trim() || p.amount > 0),
    savings: {
      ...plan.savings,
      entries: plan.savings.entries.filter((e) => e.name.trim() || e.value > 0),
    },
    categories: plan.categories,
  };
}

/** Construct a fresh blob for a brand-new install. */
export function emptyBudgetBlob(currency: string, now: Date = new Date()): BudgetBlob {
  return {
    schemaVersion: 2,
    currency,
    current: {
      monthKey: monthKeyFor(now),
      plan: {
        income: [],
        priorities: [],
        savings: { enabled: false, entries: [] },
        categories: defaultCategories(),
      },
      transactions: [],
    },
    history: [],
    recurring: [],
    setupStep: 1,
    setupComplete: false,
  };
}

/**
 * Migrate a v1 blob to a v2 blob. The v1 wizard state becomes the current
 * month's `plan` with zero transactions. Currency defaults to '₦' if absent
 * (matching v1's hardcoded default).
 *
 * If the input is malformed, returns a fresh empty blob — never throws.
 */
export function migrateV1ToV2(v1: BudgetBlobV1 | null | undefined, now: Date = new Date()): BudgetBlob {
  if (!v1 || typeof v1 !== 'object') return emptyBudgetBlob('₦', now);

  // Normalise legacy savings shape. v1 had two flavors: the modern entries[] form,
  // and a single-amount form pre-dating it.
  let savings: SavingsData;
  const rawSavings = v1.savings;
  if (!rawSavings) {
    savings = { enabled: false, entries: [] };
  } else if ('entries' in rawSavings && Array.isArray((rawSavings as SavingsData).entries)) {
    savings = rawSavings as SavingsData;
  } else {
    const legacy = rawSavings as { enabled?: boolean; type?: 'amount' | 'percentage'; value?: number };
    savings = {
      enabled: !!legacy.enabled,
      entries: legacy.value
        ? [{ id: 'legacy', name: 'Savings', type: legacy.type ?? 'amount', value: legacy.value }]
        : [],
    };
  }

  const plan: BudgetPlan = {
    income: Array.isArray(v1.incomeSources) ? v1.incomeSources : [],
    priorities: Array.isArray(v1.expenses) ? v1.expenses : [],
    savings,
    categories: categoriesFromSplit(v1.splitPlan),
  };

  const current: MonthState = {
    monthKey: monthKeyFor(now),
    plan,
    transactions: [],
    reflection: v1.reflection,
  };

  // If they completed step 6 of the wizard, treat setup as complete.
  const setupComplete = (v1.currentStep ?? 0) >= 6 && plan.income.length > 0;

  return {
    schemaVersion: 2,
    currency: v1.currency || '₦',
    current,
    history: [],
    recurring: [],
    setupStep: setupComplete ? undefined : Math.min(6, Math.max(1, v1.currentStep ?? 1)),
    setupComplete,
  };
}

/**
 * Defensive parse of a raw JSON blob from storage. Routes to migration when
 * a v1 shape is detected. Never throws.
 */
export function parseBudgetBlob(raw: unknown, now: Date = new Date()): BudgetBlob {
  if (!raw || typeof raw !== 'object') return emptyBudgetBlob('₦', now);
  const obj = raw as Record<string, unknown>;

  // v2: has schemaVersion === 2 and a current.monthKey
  if (obj.schemaVersion === 2 && obj.current && typeof obj.current === 'object') {
    // Trust v2 shape but defensively patch missing fields.
    const v2 = obj as unknown as BudgetBlob;
    return {
      schemaVersion: 2,
      currency: v2.currency || '₦',
      current: hydrateMonth(v2.current, now),
      history: Array.isArray(v2.history) ? v2.history.map((m) => hydrateMonth(m, now)) : [],
      // Recurring was added after schemaVersion 2 shipped — older v2 blobs
      // won't have it; default to empty array for forward-compat.
      recurring: Array.isArray(v2.recurring) ? v2.recurring : [],
      setupStep: typeof v2.setupStep === 'number' ? v2.setupStep : undefined,
      setupComplete: !!v2.setupComplete,
      // Daily reminder times. Prefer the new array; fall back to the old
      // single-time fields; else default to one 20:00 (8pm) nudge.
      reminderTimes: Array.isArray(v2.reminderTimes)
        ? normalizeReminderTimes(v2.reminderTimes)
        : typeof v2.reminderHour === 'number'
          ? normalizeReminderTimes([{ hour: v2.reminderHour, minute: v2.reminderMinute ?? 0 }])
          : defaultReminderTimes(),
      walkthroughSeen: typeof v2.walkthroughSeen === 'boolean' ? v2.walkthroughSeen : false,
    };
  }

  // Otherwise assume v1 and migrate.
  return migrateV1ToV2(obj as BudgetBlobV1, now);
}

function hydrateMonth(m: Partial<MonthState>, now: Date): MonthState {
  return {
    monthKey: m.monthKey || monthKeyFor(now),
    plan: hydratePlan(m.plan),
    transactions: Array.isArray(m.transactions) ? m.transactions : [],
    reflection: m.reflection,
    closedAt: m.closedAt,
  };
}

/**
 * Normalise a stored plan to the current shape. Older blobs carry a fixed
 * `split`; convert it to `categories` (keeping the four legacy ids so their
 * transactions still map). Missing/blank plans fall back to fresh defaults.
 */
function hydratePlan(plan: Partial<BudgetPlan> | undefined): BudgetPlan {
  const p = (plan ?? {}) as Partial<BudgetPlan> & { split?: SplitPlan };
  const categories =
    Array.isArray(p.categories) && p.categories.length > 0
      ? p.categories
      : categoriesFromSplit(p.split);
  return {
    income: Array.isArray(p.income) ? p.income : [],
    priorities: Array.isArray(p.priorities) ? p.priorities : [],
    savings: p.savings ?? { enabled: false, entries: [] },
    categories,
  };
}

/**
 * Banner trigger logic. Returns true when the Home screen should surface the
 * "Close out [month]" banner. Two cases:
 *
 *   (a) System date is on or past the 28th of `current.monthKey`, OR
 *   (b) System month differs from `current.monthKey` (overdue close).
 *
 * `current.closedAt` short-circuits to false — closed months don't pester.
 */
export function shouldShowMonthCloseBanner(now: Date, current: MonthState): boolean {
  if (current.closedAt) return false;
  const sysKey = monthKeyFor(now);
  if (sysKey !== current.monthKey) return true;
  return now.getUTCDate() >= 28;
}

/**
 * Compute the month immediately after `currentKey` (calendar arithmetic).
 * "2026-05" → "2026-06"; "2026-12" → "2027-01".
 */
export function nextMonthKey(currentKey: string): string {
  const [y, m] = currentKey.split('-').map(Number);
  if (!y || !m) return monthKeyFor(new Date());
  if (m === 12) return `${y + 1}-01`;
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}

/**
 * Roll the current month forward. Archives `current` (with `closedAt`) into
 * `history` and creates a fresh `MonthState` with the plan carried forward
 * (transactions zeroed, reflection cleared).
 *
 * The next monthKey is `max(systemMonth, current+1)`:
 *   • Closing mid-current-month → advance to next calendar month
 *   • Closing in a future month (overdue close) → land on the system month,
 *     so we don't backdate the new active month
 */
export function rollForward(blob: BudgetBlob, now: Date = new Date()): BudgetBlob {
  const archived: MonthState = {
    ...blob.current,
    closedAt: new Date().toISOString(),
  };
  const sysKey = monthKeyFor(now);
  const nextKey = sysKey > blob.current.monthKey ? sysKey : nextMonthKey(blob.current.monthKey);
  const next: MonthState = {
    monthKey: nextKey,
    plan: {
      // Carry the plan as-is; the RollForward screen will have already
      // captured any edits before this call.
      income: blob.current.plan.income,
      priorities: blob.current.plan.priorities,
      savings: blob.current.plan.savings,
      categories: blob.current.plan.categories,
    },
    transactions: [],
  };
  return {
    ...blob,
    current: next,
    history: [archived, ...blob.history],
  };
}

// ─── Self-checks (executed at module import in dev; harmless otherwise) ──────
// These are the "inline assertion tests" promised in TASKS.md F1.

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  // Migration round-trip
  const v1Sample: BudgetBlobV1 = {
    currentStep: 3,
    currency: '$',
    incomeSources: [{ id: 'a', name: 'Salary', amount: 5000 }],
    expenses: [{ id: 'b', name: 'Rent', amount: 1500, isFixed: true }],
    savings: { enabled: true, type: 'percentage', value: 10 },
    buckets: { needs: 0, lifestyle: 0, niceToHave: 0 },
    reflection: { tight: '', flexible: '', intentional: '' },
    splitPlan: null,
  };
  const v2 = migrateV1ToV2(v1Sample, new Date('2026-05-17T00:00:00Z'));
  console.assert(v2.schemaVersion === 2, 'schemaVersion === 2');
  console.assert(v2.currency === '$', 'currency carried');
  console.assert(v2.current.monthKey === '2026-05', 'monthKey computed');
  console.assert(v2.current.plan.income.length === 1, 'income carried');
  console.assert(v2.current.plan.savings.entries.length === 1, 'legacy savings migrated to entries');
  console.assert(v2.current.plan.categories.length === 4, 'migrated to default categories');
  console.assert(v2.setupComplete === false, 'incomplete wizard remains incomplete');

  // Legacy split → categories conversion keeps ids stable
  const converted = parseBudgetBlob(
    {
      schemaVersion: 2,
      currency: '₦',
      current: {
        monthKey: '2026-05',
        plan: {
          income: [],
          priorities: [],
          savings: { enabled: false, entries: [] },
          split: { essentials: 50, growth: 25, stability: 15, rewards: 10 },
        },
        transactions: [],
      },
      history: [],
    },
    new Date('2026-05-17T00:00:00Z'),
  );
  console.assert(converted.current.plan.categories.length === 4, 'split converted to 4 categories');
  console.assert(
    converted.current.plan.categories[0].id === 'essentials',
    'legacy category ids preserved',
  );
  console.assert(
    converted.current.plan.categories.reduce((s, c) => s + c.percent, 0) === 100,
    'converted percents sum to 100',
  );

  // Banner logic
  console.assert(
    shouldShowMonthCloseBanner(new Date('2026-05-30T00:00:00Z'), v2.current) === true,
    'banner shows on 30th',
  );
  console.assert(
    shouldShowMonthCloseBanner(new Date('2026-05-10T00:00:00Z'), v2.current) === false,
    'banner hides mid-month',
  );
  console.assert(
    shouldShowMonthCloseBanner(new Date('2026-06-02T00:00:00Z'), v2.current) === true,
    'banner shows when month is overdue',
  );

  // Empty blob
  const fresh = emptyBudgetBlob('€', new Date('2026-05-17T00:00:00Z'));
  console.assert(fresh.setupComplete === false, 'fresh blob is unset');
  console.assert(fresh.current.plan.categories.length === 4, 'fresh blob has default categories');
  console.assert(
    fresh.current.plan.categories.reduce((s, c) => s + c.percent, 0) === 100,
    'default categories sum to 100',
  );

  // Roll forward
  const rolled = rollForward(v2, new Date('2026-06-01T00:00:00Z'));
  console.assert(rolled.current.monthKey === '2026-06', 'next month rolled');
  console.assert(rolled.history.length === 1, 'previous archived');
  console.assert(!!rolled.history[0].closedAt, 'closedAt stamped');
  console.assert(rolled.current.transactions.length === 0, 'transactions zeroed');
  console.assert(rolled.current.plan.income.length === 1, 'plan carried forward');
}
