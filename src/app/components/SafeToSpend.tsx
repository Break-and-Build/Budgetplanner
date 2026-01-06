import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface SafeToSpendProps {
  safeToSpend: number;
  totalIncome: number;
  totalPriorities: number;
  totalSavings: number;
  currency: string;
  onNext: () => void;
  onBack: () => void;
}

export function SafeToSpend({
  safeToSpend,
  totalIncome,
  totalPriorities,
  totalSavings,
  currency,
  onNext,
  onBack,
}: SafeToSpendProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="text-amber-800 text-sm">Here's your number</span>
        </div>
        <h2 className="text-slate-800 mb-3">Safe to spend this month</h2>
        <div className="text-6xl text-indigo-600 mb-4">
          {currency}{safeToSpend.toLocaleString()}
        </div>
        <p className="text-slate-600 max-w-md mx-auto">
          This is what you have left after covering priorities and savings.
          Spend this amount with confidence.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-slate-700 mb-4">Here's the breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Total income</span>
            <span className="text-slate-800">{currency}{totalIncome.toLocaleString()}</span>
          </div>
          <div className="h-px bg-slate-200" />
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Priority expenses</span>
            <span className="text-slate-700">-{currency}{totalPriorities.toLocaleString()}</span>
          </div>
          {totalSavings > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Savings</span>
              <span className="text-slate-700">-{currency}{totalSavings.toLocaleString()}</span>
            </div>
          )}
          <div className="h-px bg-slate-200" />
          <div className="flex justify-between items-center">
            <span className="text-slate-800">Safe to spend</span>
            <span className="text-indigo-600">
              {currency}{safeToSpend.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack} size="lg">
          Back
        </Button>
        <Button
          onClick={onNext}
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}