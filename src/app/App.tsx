import { useState } from "react";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { IncomeSetup, IncomeSource } from "./components/IncomeSetup";
import { PriorityExpenses, PriorityExpense } from "./components/PriorityExpenses";
import { SavingsAllocation, SavingsData } from "./components/SavingsAllocation";
import { SafeToSpend } from "./components/SafeToSpend";
import { FlexibleBuckets, BucketsData } from "./components/FlexibleBuckets";
import { MonthlyReflection, ReflectionData } from "./components/MonthlyReflection";
import { CompletedPlan } from "./components/CompletedPlan";

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [currency, setCurrency] = useState("₦");

  // State for each step
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [expenses, setExpenses] = useState<PriorityExpense[]>([]);
  const [savings, setSavings] = useState<SavingsData>({
    enabled: false,
    entries: [],
  });
  const [buckets, setBuckets] = useState<BucketsData>({
    needs: 0,
    lifestyle: 0,
    niceToHave: 0,
  });
  const [reflection, setReflection] = useState<ReflectionData>({
    tight: "",
    flexible: "",
    intentional: "",
  });

  // Calculations
  const totalIncome = incomeSources.reduce((sum, s) => sum + s.amount, 0);
  const totalPriorities = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingAfterPriorities = totalIncome - totalPriorities;

  const savingsAmount = savings.enabled
    ? savings.entries.reduce((sum, entry) => {
        const amount =
          entry.type === "percentage"
            ? (remainingAfterPriorities * entry.value) / 100
            : entry.value;
        return sum + amount;
      }, 0)
    : 0;

  const safeToSpend = remainingAfterPriorities - savingsAmount;

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);
  const handleFinish = () => setIsComplete(true);
  const handleReset = () => {
    setCurrentStep(1);
    setIsComplete(false);
    setIncomeSources([]);
    setExpenses([]);
    setSavings({ enabled: false, entries: [] });
    setBuckets({ needs: 0, lifestyle: 0, niceToHave: 0 });
    setReflection({ tight: "", flexible: "", intentional: "" });
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-12 px-4">
        <CompletedPlan
          income={incomeSources}
          expenses={expenses}
          savings={savings}
          buckets={buckets}
          reflection={reflection}
          safeToSpend={safeToSpend}
          currency={currency}
          onReset={handleReset}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-slate-800 mb-2">Priority-Based Budget Planner</h1>
          <p className="text-slate-600">
            Plan your month with confidence and clarity
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} totalSteps={6} />

        {/* Step Content */}
        <div className="mt-12">
          {currentStep === 1 && (
            <IncomeSetup
              incomeSources={incomeSources}
              currency={currency}
              onUpdateIncome={setIncomeSources}
              onUpdateCurrency={setCurrency}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <PriorityExpenses
              expenses={expenses}
              onUpdateExpenses={setExpenses}
              onNext={handleNext}
              onBack={handleBack}
              totalIncome={totalIncome}
              currency={currency}
            />
          )}

          {currentStep === 3 && (
            <SavingsAllocation
              savings={savings}
              onUpdateSavings={setSavings}
              onNext={handleNext}
              onBack={handleBack}
              remainingAfterPriorities={remainingAfterPriorities}
              currency={currency}
            />
          )}

          {currentStep === 4 && (
            <SafeToSpend
              safeToSpend={safeToSpend}
              totalIncome={totalIncome}
              totalPriorities={totalPriorities}
              totalSavings={savingsAmount}
              onNext={handleNext}
              onBack={handleBack}
              currency={currency}
            />
          )}

          {currentStep === 5 && (
            <FlexibleBuckets
              buckets={buckets}
              onUpdateBuckets={setBuckets}
              onNext={handleNext}
              onBack={handleBack}
              safeToSpend={safeToSpend}
              currency={currency}
            />
          )}

          {currentStep === 6 && (
            <MonthlyReflection
              reflection={reflection}
              onUpdateReflection={setReflection}
              onFinish={handleFinish}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}