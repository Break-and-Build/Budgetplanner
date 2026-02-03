import type {
  IncomeSource,
  PriorityExpense,
  SavingsData,
  BucketsData,
  ReflectionData,
} from '@budgetplanner/core';

export type RootStackParamList = {
  BudgetWizard: { reset?: boolean } | undefined;
  CompletedPlan: {
    income: IncomeSource[];
    expenses: PriorityExpense[];
    savings: SavingsData;
    buckets: BucketsData;
    reflection: ReflectionData;
    safeToSpend: number;
    currency: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
