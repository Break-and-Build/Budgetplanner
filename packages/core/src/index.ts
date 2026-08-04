// Types
export type {
  // Wizard / plan types
  IncomeSource,
  PriorityExpense,
  SavingsType,
  SavingsEntry,
  SavingsData,
  BucketsData,
  ReflectionData,
  SplitPlan,
  // v2 tracking types
  CategoryId,
  CategoryDef,
  ReminderTime,
  Transaction,
  BudgetPlan,
  MonthState,
  BudgetBlob,
  BudgetBlobV1,
  RecurringTransaction,
} from './types';

// Category helpers (percentage-based custom categories)
export {
  MIN_CATEGORIES,
  MAX_CATEGORIES,
  CATEGORY_PALETTE,
  defaultCategories,
  categoriesFromSplit,
  totalPercent,
  normalizeCategoryPercents,
  categoriesAreValid,
  newCategoryId,
  nextPaletteColor,
} from './categories';

// Calculations
export {
  calcTotalIncome,
  calcTotalPriorities,
  calcSavingsEntryAmount,
  calcSavingsTotal,
  calcSafeToSpend,
  calcSplitPlan,
} from './calculations';

// Currency formatting
export { formatNumber, parseNumber } from './currency';

// Currency catalogue
export { CURRENCIES, getCurrency, symbolFor } from './currencies';
export type { Currency } from './currencies';

// Storage (pure helpers — no AsyncStorage here)
export {
  monthKeyFor,
  nextMonthKey,
  defaultSplit,
  cleanPlan,
  emptyBudgetBlob,
  migrateV1ToV2,
  parseBudgetBlob,
  shouldShowMonthCloseBanner,
  rollForward,
} from './storage';

// Recurring transaction rules
export { shouldFireRule, materializeRule, runRecurringRules } from './recurring';

// Reminder-time helpers
export {
  MAX_REMINDER_TIMES,
  defaultReminderTimes,
  normalizeReminderTimes,
} from './reminders';
