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
  Transaction,
  BudgetPlan,
  MonthState,
  BudgetBlob,
  BudgetBlobV1,
} from './types';

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
  emptyBudgetBlob,
  migrateV1ToV2,
  parseBudgetBlob,
  shouldShowMonthCloseBanner,
  rollForward,
} from './storage';
