export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
}

export interface PriorityExpense {
  id: string;
  name: string;
  amount: number;
  isFixed: boolean;
}

export interface SavingsData {
  enabled: boolean;
  type: "amount" | "percentage";
  value: number;
}

export interface BucketsData {
  needs: number;
  lifestyle: number;
  niceToHave: number;
}

export interface ReflectionData {
  tight: string;
  flexible: string;
  intentional: string;
}
