/**
 * SetupRitual Step 4 — Safe-to-spend confirmation.
 *
 * No data entry. The user reviews the math: income − priorities − savings.
 * A single confirmation button advances to the buckets split.
 *
 * Visually a "moment" — big hero number, three-line breakdown below.
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  calcSafeToSpend,
  calcSavingsTotal,
  calcTotalIncome,
  calcTotalPriorities,
} from '@budgetplanner/core';

import { useTokens } from '../../theme/ThemeProvider';
import { ModalStackShell } from '../../components/ModalStackShell';
import { AmountDisplay } from '../../components/AmountDisplay';
import { useBudget } from '../../state/BudgetContext';
import { StepHeader } from './StepHeader';
import type { StepProps } from './types';

export function SafeToSpendStep({ step, totalSteps, form, onNext, onBack }: StepProps) {
  const t = useTokens();
  const { symbol } = useBudget();

  const totalIncome = useMemo(() => calcTotalIncome(form.income), [form.income]);
  const totalPriorities = useMemo(() => calcTotalPriorities(form.priorities), [form.priorities]);
  const remainingAfterPriorities = totalIncome - totalPriorities;
  const totalSavings = useMemo(
    () => calcSavingsTotal(form.savings, remainingAfterPriorities),
    [form.savings, remainingAfterPriorities],
  );
  const safe = calcSafeToSpend(totalIncome, totalPriorities, totalSavings);

  return (
    <ModalStackShell
      step={step}
      totalSteps={totalSteps}
      primaryAction={{ label: 'Looks good', onPress: onNext, disabled: false }}
      secondaryAction={{ label: 'Back', onPress: onBack }}
    >
      <StepHeader
        step={step}
        totalSteps={totalSteps}
        stepName="Safe to spend"
        question="Here's what's left."
      />

      {/* Hero */}
      <View
        style={{
          paddingHorizontal: t.space[4],
          paddingVertical: t.space[6],
          alignItems: 'flex-start',
        }}
      >
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.caption2,
            {
              color: t.color.text.secondary,
              textTransform: 'uppercase',
              marginBottom: t.space[2],
            },
          ]}
        >
          Safe to spend this month
        </Text>
        <AmountDisplay value={safe} symbol={symbol} size="hero" align="left" />
      </View>

      {/* Math breakdown */}
      <View
        style={{
          marginHorizontal: t.space[4],
          padding: t.space[4],
          backgroundColor: t.color.bg.elevated,
          borderRadius: t.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.color.border.hairline,
        }}
      >
        <MathRow label="Income" value={totalIncome} symbol={symbol} sign="+" />
        <Divider />
        <MathRow label="Priorities" value={totalPriorities} symbol={symbol} sign="−" />
        <Divider />
        <MathRow label="Savings" value={totalSavings} symbol={symbol} sign="−" />
        <Divider strong />
        <MathRow label="Safe to spend" value={safe} symbol={symbol} sign="=" emphasis />
      </View>

      <Text
        allowFontScaling
        maxFontSizeMultiplier={t.a11y.maxFontScale}
        style={[
          t.type.footnote,
          {
            color: t.color.text.tertiary,
            paddingHorizontal: t.space[4],
            paddingTop: t.space[4],
            textAlign: 'center',
          },
        ]}
      >
        Next you'll split this across four categories.
      </Text>
    </ModalStackShell>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function MathRow({
  label,
  value,
  symbol,
  sign,
  emphasis = false,
}: {
  label: string;
  value: number;
  symbol: string;
  sign: '+' | '−' | '=';
  emphasis?: boolean;
}) {
  const t = useTokens();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: t.space[2],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.body,
            {
              color: t.color.text.tertiary,
              width: t.space[5],
              fontVariant: ['tabular-nums'],
            },
          ]}
        >
          {sign}
        </Text>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            emphasis ? t.type.headline : t.type.body,
            { color: t.color.text.primary },
          ]}
        >
          {label}
        </Text>
      </View>
      <AmountDisplay
        value={value}
        symbol={symbol}
        size={emphasis ? 'lg' : 'md'}
        align="right"
      />
    </View>
  );
}

function Divider({ strong = false }: { strong?: boolean }) {
  const t = useTokens();
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: strong ? t.color.border.divider : t.color.border.hairline,
        marginVertical: strong ? t.space[2] : 0,
      }}
    />
  );
}
