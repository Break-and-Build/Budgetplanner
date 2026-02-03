import { useState } from "react";
import { Plus, Trash, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { CurrencyInput } from "./CurrencyInput";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { formatCurrency } from "@/app/utils/formatCurrency";

export interface PriorityExpense {
  id: string;
  name: string;
  amount: number;
  isFixed: boolean;
}

interface PriorityExpensesProps {
  expenses: PriorityExpense[];
  onUpdateExpenses: (expenses: PriorityExpense[]) => void;
  onNext: () => void;
  onBack: () => void;
  totalIncome: number;
  currency: string;
}

export function PriorityExpenses({
  expenses,
  onUpdateExpenses,
  onNext,
  onBack,
  totalIncome,
  currency,
}: PriorityExpensesProps) {
  const [items, setItems] = useState<PriorityExpense[]>(
    expenses.length > 0 ? expenses : []
  );

  const addExpense = () => {
    const newExpense: PriorityExpense = {
      id: Date.now().toString(),
      name: "",
      amount: 0,
      isFixed: true,
    };
    setItems([...items, newExpense]);
  };

  const removeExpense = (id: string) => {
    setItems(items.filter((e) => e.id !== id));
  };

  const updateExpense = (
    id: string,
    field: keyof PriorityExpense,
    value: string | number | boolean
  ) => {
    setItems(items.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const handleNext = () => {
    onUpdateExpenses(items);
    onNext();
  };

  const totalExpenses = items.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const remaining = totalIncome - totalExpenses;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-slate-800 mb-2">Priority expenses</h2>
        <p className="text-slate-600">
          Add the expenses that must be paid every month—the non-negotiables.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((expense) => (
          <div
            key={expense.id}
            className="bg-white rounded-xl border-2 border-slate-300 p-4"
          >
            <div className="flex gap-3 items-start">
              <div className="flex-1 space-y-3">
                <Input
                  placeholder="e.g., Rent, Gym, Internet"
                  value={expense.name}
                  onChange={(e) => updateExpense(expense.id, "name", e.target.value)}
                  className="border-slate-300"
                />
                <CurrencyInput
                  placeholder="0"
                  value={expense.amount}
                  onChange={(value) => updateExpense(expense.id, "amount", value)}
                  className="border-slate-300"
                />
                <div className="flex items-center gap-2">
                  <Switch
                    id={`fixed-${expense.id}`}
                    checked={expense.isFixed}
                    onCheckedChange={(checked) =>
                      updateExpense(expense.id, "isFixed", checked)
                    }
                  />
                  <Label htmlFor={`fixed-${expense.id}`} className="text-sm text-slate-600">
                    {expense.isFixed ? "Fixed amount" : "Estimated amount"}
                  </Label>
                  {expense.isFixed && <Lock className="w-3 h-3 text-slate-400 ml-1" />}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeExpense(expense.id)}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addExpense}
          className="w-full border-dashed border-slate-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add priority expense
        </Button>
      </div>

      {totalExpenses > 0 && (
        <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Total priority expenses</span>
            <span className="text-slate-800">{currency}{formatCurrency(totalExpenses)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Remaining</span>
            <span className={remaining >= 0 ? "text-slate-800" : "text-red-600"}>
              {currency}{formatCurrency(remaining)}
            </span>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack} size="lg">
          Back
        </Button>
        <Button
          onClick={handleNext}
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}