import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
              step < currentStep
                ? "bg-emerald-500 text-white"
                : step === currentStep
                ? "bg-indigo-600 text-white"
                : "bg-slate-200 text-slate-400"
            }`}
          >
            {step < currentStep ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="text-sm">{step}</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 ${
                step < currentStep ? "bg-emerald-500" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
