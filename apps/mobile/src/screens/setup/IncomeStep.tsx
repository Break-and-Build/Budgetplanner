/**
 * SetupRitual Step 1 — Income.
 *
 * "What's coming in this month?"  →  list of named amounts, Add another, total.
 * Continue is disabled until at least one income row has both a name and an
 * amount > 0.
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import type { IncomeSource } from '@budgetplanner/core';

import { useTokens } from '../../theme/ThemeProvider';
import { ModalStackShell } from '../../components/ModalStackShell';
import { CurrencyInput } from '../../components/CurrencyInput';
import { Input } from '../../components/ui/Input';
import { AmountDisplay } from '../../components/AmountDisplay';
import { useBudget } from '../../state/BudgetContext';
import { StepHeader } from './StepHeader';
import { newId, type StepProps } from './types';

export function IncomeStep({ step, totalSteps, mode = 'create', form, setForm, onNext, onBack }: StepProps) {
  const t = useTokens();
  const { symbol } = useBudget();

  const total = useMemo(
    () => form.income.reduce((s, i) => s + (i.amount || 0), 0),
    [form.income],
  );

  const valid =
    form.income.length > 0 &&
    form.income.every((i) => i.name.trim() && i.amount > 0);

  const addRow = () =>
    setForm((f) => ({
      ...f,
      income: [...f.income, { id: newId('i'), name: '', amount: 0 }],
    }));

  const updateRow = (id: string, patch: Partial<IncomeSource>) =>
    setForm((f) => ({
      ...f,
      income: f.income.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));

  const removeRow = (id: string) =>
    setForm((f) => ({ ...f, income: f.income.filter((i) => i.id !== id) }));

  return (
    <ModalStackShell
      step={step}
      totalSteps={totalSteps}
      primaryAction={{
        label: mode === 'edit' ? 'Save' : 'Continue',
        onPress: onNext,
        disabled: !valid,
      }}
      secondaryAction={
        mode === 'edit' || (step ?? 0) > 1 ? { label: mode === 'edit' ? 'Cancel' : 'Back', onPress: onBack } : undefined
      }
    >
      <StepHeader
        step={step}
        totalSteps={totalSteps}
        stepName="Income"
        question="What's coming in this month?"
        mode={mode}
      />

      {/* List */}
      <View style={{ paddingHorizontal: t.space[4] }}>
        {form.income.map((row) => (
          <View
            key={row.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.space[2],
              marginBottom: t.space[3],
            }}
          >
            <View style={{ flex: 1.4 }}>
              <Input
                value={row.name}
                onChangeText={(v) => updateRow(row.id, { name: v })}
                placeholder="Salary, freelance…"
                accessibilityLabel="Income source name"
              />
            </View>
            <View style={{ flex: 1 }}>
              <CurrencyInput
                value={row.amount}
                onChange={(v) => updateRow(row.id, { amount: v })}
                symbol={symbol}
                size="md"
              />
            </View>
            <Pressable
              onPress={() => removeRow(row.id)}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${row.name || 'income source'}`}
              hitSlop={8}
              style={({ pressed }) => ({
                width: t.layout.minTapTarget,
                height: t.layout.minTapTarget,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: t.radii.pill,
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <X size={20} color={t.color.text.tertiary} strokeWidth={1.75} />
            </Pressable>
          </View>
        ))}

        {/* Add another */}
        <Pressable
          onPress={addRow}
          accessibilityRole="button"
          accessibilityLabel="Add another income source"
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: t.space[3],
            paddingHorizontal: t.space[3],
            borderRadius: t.radii.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: t.color.border.divider,
            borderStyle: 'dashed',
            backgroundColor: pressed ? t.color.bg.sunken : 'transparent',
            marginTop: form.income.length > 0 ? 0 : t.space[2],
          })}
        >
          <Plus size={18} color={t.color.text.secondary} strokeWidth={1.75} />
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.subhead,
              {
                color: t.color.text.secondary,
                fontWeight: t.fontWeight.medium,
                marginLeft: t.space[2],
              },
            ]}
          >
            {form.income.length === 0 ? 'Add your first income' : 'Add another'}
          </Text>
        </Pressable>
      </View>

      {/* Running total */}
      {form.income.length > 0 ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: t.space[4],
            paddingTop: t.space[5],
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
            Total income
          </Text>
          <AmountDisplay value={total} symbol={symbol} size="lg" align="right" />
        </View>
      ) : null}
    </ModalStackShell>
  );
}
