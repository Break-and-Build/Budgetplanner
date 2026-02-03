import { useState } from "react";
import { PiggyBank, Plus, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { CurrencyInput } from "./CurrencyInput";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { formatCurrency } from "@/app/utils/formatCurrency";

export interface SavingsEntry {
  id: string;
  name: string;
  type: "amount" | "percentage";
  value: number;
}

export interface SavingsData {
  enabled: boolean;
  entries: SavingsEntry[];
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
  const [entries, setEntries] = useState<SavingsEntry[]>(
    savings.entries.length > 0 ? savings.entries : []
  );

  const addEntry = () => {
    const newEntry: SavingsEntry = {
      id: Date.now().toString(),
      name: "",
      type: "amount",
      value: 0,
    };
    setEntries([...entries, newEntry]);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const updateEntry = (
    id: string,
    field: keyof SavingsEntry,
    value: string | number
  ) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const handleNext = () => {
    onUpdateSavings({
      enabled: savingsEnabled,
      entries: entries,
    });
    onNext();
  };

  const calculateSavingsAmount = (entry: SavingsEntry): number => {
    return entry.type === "percentage"
      ? (remainingAfterPriorities * entry.value) / 100
      : entry.value;
  };

  const totalSavings = entries.reduce(
    (sum, entry) => sum + calculateSavingsAmount(entry),
    0
  );
  const afterSavings = remainingAfterPriorities - totalSavings;

  const handleToggle = (checked: boolean) => {
    setSavingsEnabled(checked);
    if (checked && entries.length === 0) {
      addEntry();
    }
  };

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
              <Label htmlFor="savings-toggle" className="cursor-pointer text-lg">
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
            onCheckedChange={handleToggle}
          />
        </div>

        {savingsEnabled && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="border border-slate-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex gap-3 items-start">
                  <div className="flex-1">
                    <Label className="text-sm text-slate-600">Savings goal name</Label>
                    <Input
                      placeholder="e.g., Emergency fund, Vacation"
                      value={entry.name}
                      onChange={(e) => updateEntry(entry.id, "name", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  {entries.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEntry(entry.id)}
                      className="text-slate-400 hover:text-red-500 mt-6"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={entry.type === "amount" ? "default" : "outline"}
                    onClick={() => updateEntry(entry.id, "type", "amount")}
                    className={
                      entry.type === "amount"
                        ? "flex-1 bg-indigo-600 hover:bg-indigo-700"
                        : "flex-1"
                    }
                    size="sm"
                  >
                    Fixed Amount
                  </Button>
                  <Button
                    variant={entry.type === "percentage" ? "default" : "outline"}
                    onClick={() => updateEntry(entry.id, "type", "percentage")}
                    className={
                      entry.type === "percentage"
                        ? "flex-1 bg-indigo-600 hover:bg-indigo-700"
                        : "flex-1"
                    }
                    size="sm"
                  >
                    Percentage
                  </Button>
                </div>

                <div>
                  <Label className="text-sm text-slate-600">
                    {entry.type === "amount" ? `Amount (${currency})` : "Percentage (%)"}
                  </Label>
                  {entry.type === "amount" ? (
                    <CurrencyInput
                      value={entry.value}
                      onChange={(value) => updateEntry(entry.id, "value", value)}
                      placeholder="0"
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      type="number"
                      placeholder="10"
                      value={entry.value || ""}
                      onChange={(e) =>
                        updateEntry(entry.id, "value", parseFloat(e.target.value) || 0)
                      }
                      className="mt-1"
                    />
                  )}
                </div>

                {entry.value > 0 && (
                  <div className="bg-emerald-50 rounded-lg p-3 text-sm">
                    <span className="text-emerald-700">
                      Saving {currency}
                      {formatCurrency(calculateSavingsAmount(entry))}
                    </span>
                  </div>
                )}
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addEntry}
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add another savings goal
            </Button>

            {totalSavings > 0 && (
              <div className="bg-emerald-50 rounded-lg p-4 space-y-2 mt-4">
                <div className="flex justify-between">
                  <span className="text-emerald-700">Total savings</span>
                  <span className="text-emerald-800">
                    {currency}
                    {formatCurrency(totalSavings)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">This leaves you</span>
                  <span className={afterSavings >= 0 ? "text-slate-800" : "text-red-600"}>
                    {currency}
                    {formatCurrency(afterSavings)}
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