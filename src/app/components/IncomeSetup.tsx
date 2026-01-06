import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { CurrencyInput } from "./CurrencyInput";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
}

interface IncomeSetupProps {
  incomeSources: IncomeSource[];
  currency: string;
  onUpdateIncome: (sources: IncomeSource[]) => void;
  onUpdateCurrency: (currency: string) => void;
  onNext: () => void;
}

export function IncomeSetup({ incomeSources, currency, onUpdateIncome, onUpdateCurrency, onNext }: IncomeSetupProps) {
  const [sources, setSources] = useState<IncomeSource[]>(
    incomeSources.length > 0 ? incomeSources : [{ id: "1", name: "Salary", amount: 0 }]
  );

  const addSource = () => {
    const newSource = {
      id: Date.now().toString(),
      name: "",
      amount: 0,
    };
    setSources([...sources, newSource]);
  };

  const removeSource = (id: string) => {
    if (sources.length > 1) {
      setSources(sources.filter((s) => s.id !== id));
    }
  };

  const updateSource = (id: string, field: "name" | "amount", value: string | number) => {
    setSources(
      sources.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleNext = () => {
    onUpdateIncome(sources);
    onNext();
  };

  const totalIncome = sources.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const isValid = sources.every((s) => s.name.trim() && s.amount > 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-slate-800 mb-2">Let's start with your income</h2>
        <p className="text-slate-600">
          How much money do you have coming in this month?
        </p>
      </div>

      {/* Currency Selector */}
      <div className="mb-6">
        <Label htmlFor="currency">Select your currency</Label>
        <Select value={currency} onValueChange={onUpdateCurrency}>
          <SelectTrigger id="currency" className="w-full md:w-64">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="₦">₦ Nigerian Naira (NGN)</SelectItem>
            <SelectItem value="$">$ US Dollar (USD)</SelectItem>
            <SelectItem value="€">€ Euro (EUR)</SelectItem>
            <SelectItem value="£">£ British Pound (GBP)</SelectItem>
            <SelectItem value="¥">¥ Japanese Yen (JPY)</SelectItem>
            <SelectItem value="₹">₹ Indian Rupee (INR)</SelectItem>
            <SelectItem value="R">R South African Rand (ZAR)</SelectItem>
            <SelectItem value="A$">A$ Australian Dollar (AUD)</SelectItem>
            <SelectItem value="C$">C$ Canadian Dollar (CAD)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        {sources.map((source, index) => (
          <div key={source.id} className="flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor={`source-name-${source.id}`}>
                {index === 0 ? "Source name" : ""}
              </Label>
              <Input
                id={`source-name-${source.id}`}
                placeholder="e.g., Salary, Freelance"
                value={source.name}
                onChange={(e) => updateSource(source.id, "name", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor={`source-amount-${source.id}`}>
                {index === 0 ? `Amount (${currency})` : ""}
              </Label>
              <CurrencyInput
                id={`source-amount-${source.id}`}
                value={source.amount}
                onChange={(value) => updateSource(source.id, "amount", value)}
                placeholder="0"
              />
            </div>
            {sources.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSource(source.id)}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addSource}
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add another income source
        </Button>
      </div>

      {totalIncome > 0 && (
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-sm">Total monthly income</p>
          <p className="text-slate-800 text-3xl mt-1">
            {currency}{totalIncome.toLocaleString()}
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!isValid}
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}