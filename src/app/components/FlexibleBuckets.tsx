import { useState } from "react";
import { Home, Coffee, Star } from "lucide-react";
import { Button } from "./ui/button";
import { CurrencyInput } from "./CurrencyInput";
import { Label } from "./ui/label";

export interface BucketsData {
  needs: number;
  lifestyle: number;
  niceToHave: number;
}

interface FlexibleBucketsProps {
  buckets: BucketsData;
  onUpdateBuckets: (buckets: BucketsData) => void;
  onNext: () => void;
  onBack: () => void;
  safeToSpend: number;
  currency: string;
}

export function FlexibleBuckets({
  buckets,
  onUpdateBuckets,
  onNext,
  onBack,
  safeToSpend,
  currency,
}: FlexibleBucketsProps) {
  const [needs, setNeeds] = useState(buckets.needs);
  const [lifestyle, setLifestyle] = useState(buckets.lifestyle);
  const [niceToHave, setNiceToHave] = useState(buckets.niceToHave);

  const handleNext = () => {
    onUpdateBuckets({ needs, lifestyle, niceToHave });
    onNext();
  };

  const totalAllocated = needs + lifestyle + niceToHave;
  const remaining = safeToSpend - totalAllocated;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-slate-800 mb-2">Allocate your spending (optional)</h2>
        <p className="text-slate-600">
          Break down your {currency}{safeToSpend.toLocaleString()} into simple buckets.
          This is flexible—adjust as you go.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <Label htmlFor="needs" className="text-slate-800">
                Needs
              </Label>
              <p className="text-xs text-slate-500">
                Groceries, transport, essentials
              </p>
            </div>
          </div>
          <CurrencyInput
            id="needs"
            value={needs}
            onChange={setNeeds}
            placeholder="0"
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Coffee className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <Label htmlFor="lifestyle" className="text-slate-800">
                Lifestyle
              </Label>
              <p className="text-xs text-slate-500">
                Eating out, entertainment, hobbies
              </p>
            </div>
          </div>
          <CurrencyInput
            id="lifestyle"
            value={lifestyle}
            onChange={setLifestyle}
            placeholder="0"
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <Label htmlFor="nice-to-have" className="text-slate-800">
                Nice-to-have
              </Label>
              <p className="text-xs text-slate-500">
                Treats, spontaneous fun, extras
              </p>
            </div>
          </div>
          <CurrencyInput
            id="nice-to-have"
            value={niceToHave}
            onChange={setNiceToHave}
            placeholder="0"
          />
        </div>
      </div>

      {totalAllocated > 0 && (
        <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Allocated</span>
            <span className="text-slate-800">{currency}{totalAllocated.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Remaining</span>
            <span className={remaining >= 0 ? "text-slate-800" : "text-red-600"}>
              {currency}{remaining.toLocaleString()}
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