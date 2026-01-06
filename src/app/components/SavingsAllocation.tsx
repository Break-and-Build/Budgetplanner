import { useState } from "react";
import { PiggyBank } from "lucide-react";
import { Button } from "./ui/button";
import { CurrencyInput } from "./CurrencyInput";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export interface SavingsData {
  enabled: boolean;
  type: "amount" | "percentage";
  value: number;
}

interface SavingsAllocationProps {
  savings: SavingsData;
  onUpdateSavings: (savings: SavingsData) => void;
  onNext: () => void;
  onBack: () => void;
  remainingAfterPriorities: number;
  currency: string;
}

export function SavingsAllocation({
  savings,
  onUpdateSavings,
  onNext,
  onBack,
  remainingAfterPriorities,
  currency,
}: SavingsAllocationProps) {
  const [savingsEnabled, setSavingsEnabled] = useState(savings.enabled);
  const [savingsType, setSavingsType] = useState<"amount" | "percentage">(
    savings.type
  );
  const [savingsValue, setSavingsValue] = useState(savings.value);

  const handleNext = () => {
    onUpdateSavings({
      enabled: savingsEnabled,
      type: savingsType,
      value: savingsValue,
    });
    onNext();
  };

  const savingsAmount =
    savingsType === "percentage"
      ? (remainingAfterPriorities * savingsValue) / 100
      : savingsValue;

  const afterSavings = remainingAfterPriorities - savingsAmount;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-slate-800 mb-2">Save before you spend?</h2>
        <p className="text-slate-600">
          Setting aside savings now helps you stay intentional about what's left.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <Label htmlFor="savings-toggle" className="cursor-pointer">
                Enable monthly savings
              </Label>
              <p className="text-xs text-slate-500">
                Treat it like a priority expense
              </p>
            </div>
          </div>
          <Switch
            id="savings-toggle"
            checked={savingsEnabled}
            onCheckedChange={setSavingsEnabled}
          />
        </div>

        {savingsEnabled && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex gap-2">
              <Button
                variant={savingsType === "amount" ? "default" : "outline"}
                onClick={() => setSavingsType("amount")}
                className={
                  savingsType === "amount"
                    ? "flex-1 bg-indigo-600 hover:bg-indigo-700"
                    : "flex-1"
                }
              >
                Fixed Amount
              </Button>
              <Button
                variant={savingsType === "percentage" ? "default" : "outline"}
                onClick={() => setSavingsType("percentage")}
                className={
                  savingsType === "percentage"
                    ? "flex-1 bg-indigo-600 hover:bg-indigo-700"
                    : "flex-1"
                }
              >
                Percentage
              </Button>
            </div>

            <div>
              <Label htmlFor="savings-value">
                {savingsType === "amount"
                  ? `Amount (${currency})`
                  : "Percentage (%)"}
              </Label>
              {savingsType === "amount" ? (
                <CurrencyInput
                  id="savings-value"
                  value={savingsValue}
                  onChange={setSavingsValue}
                  placeholder="0"
                  className="text-lg"
                />
              ) : (
                <Input
                  id="savings-value"
                  type="number"
                  placeholder="10"
                  value={savingsValue || ""}
                  onChange={(e) =>
                    setSavingsValue(parseFloat(e.target.value) || 0)
                  }
                  className="text-lg"
                />
              )}
            </div>

            {savingsValue > 0 && (
              <div className="bg-emerald-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">You'll save</span>
                  <span className="text-emerald-800">
                    {currency}{savingsAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">This leaves you</span>
                  <span
                    className={
                      afterSavings >= 0 ? "text-slate-800" : "text-red-600"
                    }
                  >
                    {currency}{afterSavings.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {!savingsEnabled && (
          <div className="text-center text-slate-500 text-sm py-6">
            No savings set for this month. You can always add savings later.
          </div>
        )}
      </div>

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