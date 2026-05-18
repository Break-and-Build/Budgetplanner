/**
 * MonthClose — orchestrator for the month-end ritual.
 *
 * Two steps:
 *   1. Reflection (three soft prompts; at least one required)
 *   2. Roll forward review (read-only summary of what carries over)
 *
 * On finish: stamps reflection on current month, archives it to history,
 * creates a fresh next-month, resets balances, and replaces the navigator
 * stack with MainTabs so the user can't back-swipe into the closed flow.
 */

import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReflectionData } from '@budgetplanner/core';
import { nextMonthKey } from '@budgetplanner/core';

import { useBudget } from '../state/BudgetContext';
import { MonthCloseReflectionScreen } from './monthclose/MonthCloseReflectionScreen';
import { MonthCloseRollForwardScreen } from './monthclose/MonthCloseRollForwardScreen';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function MonthClose() {
  const nav = useNavigation<Nav>();
  const { currentMonth, symbol, closeMonth } = useBudget();

  const [step, setStep] = useState<1 | 2>(1);
  const [reflection, setReflection] = useState<ReflectionData>(
    currentMonth.reflection ?? { tight: '', flexible: '', intentional: '' },
  );

  // If the user is closing AFTER the calendar month has rolled over, the
  // close is "overdue" — IA says the banner is undismissable, and we extend
  // that by hiding the cancel X here too.
  const overdue = nextMonthKeyIsPast(currentMonth.monthKey);

  const onFinish = () => {
    closeMonth(reflection);
    nav.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  if (step === 1) {
    return (
      <MonthCloseReflectionScreen
        monthLabel={monthLabelFromKey(currentMonth.monthKey)}
        required={overdue}
        reflection={reflection}
        setReflection={setReflection}
        onNext={() => setStep(2)}
        onCancel={() => nav.goBack()}
      />
    );
  }

  return (
    <MonthCloseRollForwardScreen
      plan={currentMonth.plan}
      symbol={symbol}
      nextMonthLabel={monthLabelFromKey(nextMonthKey(currentMonth.monthKey))}
      onBack={() => setStep(1)}
      onFinish={onFinish}
    />
  );
}

// ─── Utils ───────────────────────────────────────────────────────────────────

/**
 * Format a "YYYY-MM" key as a long month label like "May 2026".
 * Year omitted when it matches the current calendar year — keeps the UI
 * concise during normal in-year use.
 */
function monthLabelFromKey(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m) return monthKey;
  const d = new Date(y, m - 1, 1);
  const sameYear = y === new Date().getFullYear();
  return d.toLocaleDateString(undefined, {
    month: 'long',
    year: sameYear ? undefined : 'numeric',
  });
}

/** True if the system clock has moved past the given monthKey. */
function nextMonthKeyIsPast(currentKey: string): boolean {
  const now = new Date();
  const sysKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return sysKey > currentKey;
}
