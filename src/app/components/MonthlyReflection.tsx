import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

export interface ReflectionData {
  tight: string;
  flexible: string;
  intentional: string;
}

interface MonthlyReflectionProps {
  reflection: ReflectionData;
  onUpdateReflection: (reflection: ReflectionData) => void;
  onFinish: () => void;
  onBack: () => void;
}

export function MonthlyReflection({
  reflection,
  onUpdateReflection,
  onFinish,
  onBack,
}: MonthlyReflectionProps) {
  const [tight, setTight] = useState(reflection.tight);
  const [flexible, setFlexible] = useState(reflection.flexible);
  const [intentional, setIntentional] = useState(reflection.intentional);

  const handleFinish = () => {
    onUpdateReflection({ tight, flexible, intentional });
    onFinish();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full mb-4">
          <Heart className="w-4 h-4 text-indigo-600" />
          <span className="text-indigo-800 text-sm">Almost done</span>
        </div>
        <h2 className="text-slate-800 mb-2">Quick reflection</h2>
        <p className="text-slate-600">
          These prompts are optional but can help you stay mindful.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <Label htmlFor="tight" className="text-slate-800 mb-2 block">
            What feels tight this month?
          </Label>
          <Textarea
            id="tight"
            placeholder="e.g., Rent is taking up more than I'd like..."
            value={tight}
            onChange={(e) => setTight(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <Label htmlFor="flexible" className="text-slate-800 mb-2 block">
            What feels flexible?
          </Label>
          <Textarea
            id="flexible"
            placeholder="e.g., I have some room for entertainment this month..."
            value={flexible}
            onChange={(e) => setFlexible(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <Label htmlFor="intentional" className="text-slate-800">
              One thing you'll be intentional about
            </Label>
          </div>
          <Textarea
            id="intentional"
            placeholder="e.g., I'll cook at home more often..."
            value={intentional}
            onChange={(e) => setIntentional(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 text-center border border-indigo-100">
        <h3 className="text-slate-800 mb-2">You're all set! 🎉</h3>
        <p className="text-slate-600 text-sm">
          Your budget plan is ready. Remember, this is a guide—not a rulebook.
          Adjust as you go and be kind to yourself.
        </p>
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack} size="lg">
          Back
        </Button>
        <Button
          onClick={handleFinish}
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          View My Plan
        </Button>
      </div>
    </div>
  );
}