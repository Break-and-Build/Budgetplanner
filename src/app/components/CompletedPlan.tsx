import { Wallet, Lock, PiggyBank, Home, Coffee, Star, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { IncomeSource } from "./IncomeSetup";
import { PriorityExpense } from "./PriorityExpenses";
import { SavingsData } from "./SavingsAllocation";
import { BucketsData } from "./FlexibleBuckets";
import { ReflectionData } from "./MonthlyReflection";
import { formatCurrency } from "@/app/utils/formatCurrency";

interface CompletedPlanProps {
  income: IncomeSource[];
  expenses: PriorityExpense[];
  savings: SavingsData;
  buckets: BucketsData;
  reflection: ReflectionData;
  safeToSpend: number;
  currency: string;
  onReset: () => void;
}

export function CompletedPlan({
  income,
  expenses,
  savings,
  buckets,
  reflection,
  safeToSpend,
  currency,
  onReset,
}: CompletedPlanProps) {
  const totalIncome = income.reduce((sum, s) => sum + s.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingAfterPriorities = totalIncome - totalExpenses;
  
  const savingsAmount = savings.enabled
    ? savings.entries.reduce((sum, entry) => {
        const amount =
          entry.type === "percentage"
            ? (remainingAfterPriorities * entry.value) / 100
            : entry.value;
        return sum + amount;
      }, 0)
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-slate-800 mb-2">Your Monthly Budget Plan</h1>
        <p className="text-slate-600">
          Here's your complete financial picture for this month
        </p>
      </div>

      {/* Hero: Safe to Spend */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 mb-8 text-white text-center">
        <p className="text-indigo-100 text-sm mb-2">Safe to spend</p>
        <div className="text-6xl mb-3">{currency}{formatCurrency(safeToSpend)}</div>
        <p className="text-indigo-100 text-sm max-w-md mx-auto">
          After priorities and savings, this is what you can confidently spend
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Income */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <h3 className="text-slate-800">Income</h3>
          </div>
          <div className="space-y-2">
            {income.map((source) => (
              <div key={source.id} className="flex justify-between text-sm">
                <span className="text-slate-600">{source.name}</span>
                <span className="text-slate-800">{currency}{formatCurrency(source.amount)}</span>
              </div>
            ))}
            <div className="h-px bg-slate-200 my-2" />
            <div className="flex justify-between">
              <span className="text-slate-800">Total</span>
              <span className="text-slate-800">{currency}{formatCurrency(totalIncome)}</span>
            </div>
          </div>
        </div>

        {/* Priority Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-slate-600" />
            <h3 className="text-slate-800">Priority Expenses</h3>
          </div>
          <div className="space-y-2">
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <div key={expense.id} className="flex justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-1">
                    {expense.name}
                    {expense.isFixed && <Lock className="w-3 h-3 text-slate-400" />}
                  </span>
                  <span className="text-slate-800">{currency}{formatCurrency(expense.amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No priority expenses added</p>
            )}
            {expenses.length > 0 && (
              <>
                <div className="h-px bg-slate-200 my-2" />
                <div className="flex justify-between">
                  <span className="text-slate-800">Total</span>
                  <span className="text-slate-800">{currency}{formatCurrency(totalExpenses)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Savings */}
        {savings.enabled && savings.entries.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <PiggyBank className="w-5 h-5 text-emerald-600" />
              <h3 className="text-slate-800">Savings</h3>
            </div>
            <div className="space-y-2">
              {savings.entries.map((entry) => {
                const amount =
                  entry.type === "percentage"
                    ? (remainingAfterPriorities * entry.value) / 100
                    : entry.value;
                return (
                  <div key={entry.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {entry.name}
                      {entry.type === "percentage" && (
                        <span className="text-slate-400 ml-1">({entry.value}%)</span>
                      )}
                    </span>
                    <span className="text-slate-800">{currency}{formatCurrency(amount)}</span>
                  </div>
                );
              })}
              <div className="h-px bg-slate-200 my-2" />
              <div className="flex justify-between">
                <span className="text-slate-800">Total</span>
                <span className="text-emerald-600">{currency}{formatCurrency(savingsAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Flexible Buckets */}
        {(buckets.needs > 0 || buckets.lifestyle > 0 || buckets.niceToHave > 0) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-slate-800 mb-4">Spending Buckets</h3>
            <div className="space-y-3">
              {buckets.needs > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Home className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-600">Needs</div>
                  </div>
                  <span className="text-slate-800">{currency}{formatCurrency(buckets.needs)}</span>
                </div>
              )}
              {buckets.lifestyle > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Coffee className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-600">Lifestyle</div>
                  </div>
                  <span className="text-slate-800">{currency}{formatCurrency(buckets.lifestyle)}</span>
                </div>
              )}
              {buckets.niceToHave > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-600">Nice-to-have</div>
                  </div>
                  <span className="text-slate-800">{currency}{formatCurrency(buckets.niceToHave)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reflection */}
      {(reflection.tight || reflection.flexible || reflection.intentional) && (
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-slate-200">
          <h3 className="text-slate-800 mb-4">Your Reflections</h3>
          <div className="space-y-3">
            {reflection.tight && (
              <div>
                <p className="text-sm text-slate-600 mb-1">What feels tight</p>
                <p className="text-slate-800">{reflection.tight}</p>
              </div>
            )}
            {reflection.flexible && (
              <div>
                <p className="text-sm text-slate-600 mb-1">What feels flexible</p>
                <p className="text-slate-800">{reflection.flexible}</p>
              </div>
            )}
            {reflection.intentional && (
              <div>
                <p className="text-sm text-slate-600 mb-1">Being intentional about</p>
                <p className="text-slate-800">{reflection.intentional}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Button
          onClick={onReset}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <Edit className="w-4 h-4" />
          Start a New Plan
        </Button>
      </div>
    </div>
  );
}