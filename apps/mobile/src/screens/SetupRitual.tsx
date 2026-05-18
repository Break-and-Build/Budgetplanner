/**
 * SetupRitual — the month-start setup orchestrator.
 *
 * Owns the form state for the 5 data-entry steps. Each step is a render-only
 * component that reads/writes via `setForm`. On Confirmation, commits the
 * plan to BudgetContext (`setPlan`) and replaces the navigation stack with
 * MainTabs so the user can't back-swipe into setup again.
 *
 * Per IA: this is a "deliberate 3-minute commitment" — gestureEnabled is
 * already disabled on the route in App.tsx, so the user can't dismiss the
 * modal flow mid-stride. Each step's "Back" button decrements `currentStep`.
 */

import React, { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { defaultSplit } from '@budgetplanner/core';

import { useBudget } from '../state/BudgetContext';
import { IncomeStep } from './setup/IncomeStep';
import { PrioritiesStep } from './setup/PrioritiesStep';
import { SavingsStep } from './setup/SavingsStep';
import { SafeToSpendStep } from './setup/SafeToSpendStep';
import { BucketsStep } from './setup/BucketsStep';
import { ConfirmationStep } from './setup/ConfirmationStep';
import type { SetupFormState } from './setup/types';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TOTAL_STEPS = 5;

export function SetupRitual() {
  const nav = useNavigation<Nav>();
  const { setPlan, currentMonth } = useBudget();

  // Initialise from the current plan so re-running setup (or AdjustPlan in
  // edit mode, C11) preserves what's already there. On a truly first run the
  // plan is empty and we start with blank rows.
  const [form, setForm] = useState<SetupFormState>(() => ({
    income: currentMonth.plan.income,
    priorities: currentMonth.plan.priorities,
    savings: currentMonth.plan.savings,
    split: currentMonth.plan.split.essentials > 0 ? currentMonth.plan.split : defaultSplit(),
  }));

  // 1..5 for data-entry steps; 6 is the Confirmation screen.
  const [currentStep, setCurrentStep] = useState(1);

  const next = useCallback(() => setCurrentStep((s) => s + 1), []);
  const back = useCallback(() => setCurrentStep((s) => Math.max(1, s - 1)), []);

  const commitAndFinish = useCallback(() => {
    setPlan({
      income: form.income,
      priorities: form.priorities,
      savings: form.savings,
      split: form.split,
    });
    // Replace the stack so the user can't back-swipe into setup.
    nav.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  }, [setPlan, form, nav]);

  // The Buckets step's onNext commits the plan and advances to confirmation.
  // Confirmation then handles the actual navigation back to MainTabs.
  const finishBuckets = useCallback(() => {
    setPlan({
      income: form.income,
      priorities: form.priorities,
      savings: form.savings,
      split: form.split,
    });
    setCurrentStep(6);
  }, [setPlan, form]);

  const sharedProps = {
    step: currentStep,
    totalSteps: TOTAL_STEPS,
    form,
    setForm,
    onNext: next,
    onBack: back,
  } as const;

  switch (currentStep) {
    case 1:
      return <IncomeStep {...sharedProps} />;
    case 2:
      return <PrioritiesStep {...sharedProps} />;
    case 3:
      return <SavingsStep {...sharedProps} />;
    case 4:
      return <SafeToSpendStep {...sharedProps} />;
    case 5:
      return <BucketsStep {...sharedProps} onNext={finishBuckets} />;
    case 6:
    default:
      return <ConfirmationStep onFinish={commitAndFinish} />;
  }
}
