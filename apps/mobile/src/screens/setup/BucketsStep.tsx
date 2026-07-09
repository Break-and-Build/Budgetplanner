/**
 * SetupRitual "Categories" step.
 *
 * Edit the plan's spending categories — name, colour, and the percentage of
 * safe-to-spend each one gets. Percentages must sum to 100. Uses the shared
 * CategoryEditor so setup and the standalone Manage Categories screen behave
 * identically.
 */

import React, { useMemo } from 'react';
import { View } from 'react-native';
import {
  calcSafeToSpend,
  calcSavingsTotal,
  calcTotalIncome,
  calcTotalPriorities,
  totalPercent,
} from '@budgetplanner/core';

import { useTokens } from '../../theme/ThemeProvider';
import { ModalStackShell } from '../../components/ModalStackShell';
import { CategoryEditor } from '../../components/CategoryEditor';
import { useBudget } from '../../state/BudgetContext';
import { StepHeader } from './StepHeader';
import type { StepProps } from './types';

export function BucketsStep({ step, totalSteps, mode = 'create', form, setForm, onNext, onBack }: StepProps) {
  const t = useTokens();
  const { symbol } = useBudget();

  // Safe-to-spend for the live preview bars.
  const safe = useMemo(() => {
    const income = calcTotalIncome(form.income);
    const priorities = calcTotalPriorities(form.priorities);
    const savings = calcSavingsTotal(form.savings, income - priorities);
    return calcSafeToSpend(income, priorities, savings);
  }, [form.income, form.priorities, form.savings]);

  const valid = totalPercent(form.categories) === 100 && form.categories.length > 0;

  return (
    <ModalStackShell
      step={step}
      totalSteps={totalSteps}
      primaryAction={{
        label: valid ? (mode === 'edit' ? 'Save' : 'Apply') : 'Add up to 100',
        onPress: onNext,
        disabled: !valid,
      }}
      secondaryAction={{ label: mode === 'edit' ? 'Cancel' : 'Back', onPress: onBack }}
    >
      <StepHeader
        step={step}
        totalSteps={totalSteps}
        stepName="Categories"
        question="How will you split it?"
        mode={mode}
      />

      <View style={{ paddingHorizontal: t.space[4] }}>
        <CategoryEditor
          categories={form.categories}
          onChange={(categories) => setForm((f) => ({ ...f, categories }))}
          symbol={symbol}
          safeToSpend={safe}
        />
      </View>
    </ModalStackShell>
  );
}
