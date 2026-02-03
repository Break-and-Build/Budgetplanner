import type { IncomeSource, PriorityExpense, SavingsData } from "./types";

export function calcTotalIncome(incomeSources: IncomeSource[]): number {
  return incomeSources.reduce((sum, s) => sum + s.amount, 0);
}

export function calcTotalPriorities(expenses: PriorityExpense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function calcSavingsAmount(
  savings: SavingsData,
  remainingAfterPriorities: number
): number {
  if (!savings.enabled) return 0;
  
  if (savings.type === "percentage") {
    return (remainingAfterPriorities * savings.value) / 100;
  }
  
  return savings.value;
}

export function calcSafeToSpend(
  totalIncome: number,
  totalPriorities: number,
  savingsAmount: number
): number {
  return totalIncome - totalPriorities - savingsAmount;
}
