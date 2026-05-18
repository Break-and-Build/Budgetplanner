/**
 * SetupRitual Step 5 — Buckets (split preset).
 *
 * Four editable percentages that must sum to 100. Defaults to 50/25/15/10
 * (Essentials/Growth/Stability/Rewards). User can edit any; the running sum
 * is shown live so they know when they're balanced.
 *
 * A "Reset to default" affordance restores 50/25/15/10. Live preview bars
 * underneath show how the safe-to-spend would split right now.
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RotateCcw } from 'lucide-react-native';
import type { CategoryId, SplitPlan } from '@budgetplanner/core';
import {
  calcSafeToSpend,
  calcSavingsTotal,
  calcTotalIncome,
  calcTotalPriorities,
  defaultSplit,
} from '@budgetplanner/core';

import { useTokens } from '../../theme/ThemeProvider';
import { ModalStackShell } from '../../components/ModalStackShell';
import { Input } from '../../components/ui/Input';
import { CategoryDot } from '../../components/CategoryDot';
import { AmountDisplay } from '../../components/AmountDisplay';
import { useBudget } from '../../state/BudgetContext';
import { CATEGORY_IDS, CATEGORY_LABELS } from '../../state/categories';
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

  const sum = form.split.essentials + form.split.growth + form.split.stability + form.split.rewards;
  const valid = sum === 100;

  const updatePercent = (cat: CategoryId, raw: string) => {
    const next = Math.max(0, Math.min(100, Math.floor(Number(raw) || 0)));
    setForm((f) => ({ ...f, split: { ...f.split, [cat]: next } }));
  };

  const reset = () => setForm((f) => ({ ...f, split: defaultSplit() }));

  return (
    <ModalStackShell
      step={step}
      totalSteps={totalSteps}
      primaryAction={{
        label: valid ? (mode === 'edit' ? 'Save' : 'Apply') : `Add up to 100`,
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

      {/* Reset row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingHorizontal: t.space[4],
          marginBottom: t.space[2],
        }}
      >
        <Pressable
          onPress={reset}
          accessibilityRole="button"
          accessibilityLabel="Reset to default 50, 25, 15, 10"
          hitSlop={8}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: t.space[1],
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <RotateCcw size={14} color={t.color.text.secondary} strokeWidth={1.75} />
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.footnote,
              {
                color: t.color.text.secondary,
                fontWeight: t.fontWeight.medium,
                marginLeft: t.space[1],
              },
            ]}
          >
            Reset to 50/25/15/10
          </Text>
        </Pressable>
      </View>

      {/* Editable rows */}
      <View
        style={{
          marginHorizontal: t.space[4],
          padding: t.space[4],
          backgroundColor: t.color.bg.elevated,
          borderRadius: t.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.color.border.hairline,
          gap: t.space[3],
        }}
      >
        {CATEGORY_IDS.map((id) => (
          <View
            key={id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.space[3],
            }}
          >
            <CategoryDot category={id} size={10} />
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              style={[
                t.type.body,
                { color: t.color.text.primary, flex: 1 },
              ]}
            >
              {CATEGORY_LABELS[id]}
            </Text>
            <View style={{ width: 96 }}>
              <Input
                value={String(form.split[id])}
                onChangeText={(v) => updatePercent(id, v)}
                placeholder="0"
                keyboardType="numeric"
                trailing={
                  <Text style={[t.type.body, { color: t.color.text.secondary }]}>%</Text>
                }
                accessibilityLabel={`${CATEGORY_LABELS[id]} percentage`}
              />
            </View>
          </View>
        ))}

        {/* Sum row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: t.space[3],
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: t.color.border.hairline,
          }}
        >
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.caption2,
              { color: t.color.text.secondary, textTransform: 'uppercase' },
            ]}
          >
            Total
          </Text>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.headline,
              {
                color: valid ? t.color.text.primary : t.color.status.overBudget,
                fontVariant: ['tabular-nums'],
              },
            ]}
          >
            {sum}%
          </Text>
        </View>
      </View>

      {/* Live preview */}
      {safe > 0 ? (
        <View style={{ paddingHorizontal: t.space[4], paddingTop: t.space[6] }}>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.caption2,
              {
                color: t.color.text.secondary,
                textTransform: 'uppercase',
                marginBottom: t.space[3],
              },
            ]}
          >
            Preview against your safe-to-spend
          </Text>
          {CATEGORY_IDS.map((id) => {
            const ratio = form.split[id] / 100;
            const amount = Math.round(safe * ratio);
            return (
              <View
                key={id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: t.space[1],
                }}
              >
                <Text
                  allowFontScaling
                  maxFontSizeMultiplier={t.a11y.maxFontScale}
                  style={[
                    t.type.footnote,
                    { color: t.color.text.secondary, width: 90 },
                  ]}
                >
                  {CATEGORY_LABELS[id]}
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: t.color.category[id].tint,
                    marginHorizontal: t.space[3],
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${Math.min(100, form.split[id])}%`,
                      backgroundColor: t.color.category[id].base,
                    }}
                  />
                </View>
                <View style={{ minWidth: 80, alignItems: 'flex-end' }}>
                  <AmountDisplay
                    value={amount}
                    symbol={symbol}
                    size="md"
                    align="right"
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </ModalStackShell>
  );
}

export type { SplitPlan };
