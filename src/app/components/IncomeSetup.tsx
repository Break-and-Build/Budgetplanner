import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { CurrencyInput } from "./CurrencyInput";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { formatCurrency } from "@/app/utils/formatCurrency";

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
      <div className="mb-6 bg-white rounded-2xl border border-slate-200 p-6">
        <Label htmlFor="currency" className="text-slate-800 text-lg mb-3 block">
          Select your currency
        </Label>
        <Select value={currency} onValueChange={onUpdateCurrency}>
          <SelectTrigger id="currency" className="w-full h-12 text-base">
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

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <Label className="text-slate-800">Source name</Label>
          </div>
          <div>
            <Label className="text-slate-800">Amount ({currency})</Label>
          </div>
        </div>
        
        <div className="space-y-3">
          {sources.map((source) => (
            <div key={source.id} className="grid grid-cols-2 gap-3 items-center">
              <Input
                placeholder="e.g., Salary, Freelance"
                value={source.name}
                onChange={(e) => updateSource(source.id, "name", e.target.value)}
              />
              <div className="flex gap-2">
                <CurrencyInput
                  value={source.amount}
                  onChange={(value) => updateSource(source.id, "amount", value)}
                  placeholder="0"
                  className="flex-1"
                />
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
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={addSource}
          className="w-full border-dashed mt-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add another income source
        </Button>
      </div>

      {totalIncome > 0 && (
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-sm">Total monthly income</p>
          <p className="text-slate-800 text-3xl mt-1">
            {currency}{formatCurrency(totalIncome)}
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