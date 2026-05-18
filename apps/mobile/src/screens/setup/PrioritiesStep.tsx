/**
 * SetupRitual Step 2 — Priorities.
 *
 * "What are your fixed costs?"  →  rent, utilities, subscriptions, etc.
 *
 * Same shape as Income, with an "I have none" tertiary action that skips
 * straight to Savings. Priorities can be empty and the flow proceeds.
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import type { PriorityExpense } from '@budgetplanner/core';

import { useTokens } from '../../theme/ThemeProvider';
import { ModalStackShell } from '../../components/ModalStackShell';
import { CurrencyInput } from '../../components/CurrencyInput';
import { Input } from '../../components/ui/Input';
import { AmountDisplay } from '../../components/AmountDisplay';
import { useBudget } from '../../state/BudgetContext';
import { StepHeader } from './StepHeader';
import { newId, type StepProps } from './types';

export function PrioritiesStep({ step, totalSteps, mode = 'create', form, setForm, onNext, onBack }: StepProps) {
  const t = useTokens();
  const { symbol } = useBudget();

  const total = useMemo(
    () => form.priorities.reduce((s, p) => s + (p.amount || 0), 0),
    [form.priorities],
  );

  // Step is "valid" if every row is complete (or there are none — user
  // explicitly opted to skip via the tertiary action).
  const valid = form.priorities.every((p) => p.name.trim() && p.amount > 0);
  const hasNone = form.priorities.length === 0;

  const addRow = () =>
    setForm((f) => ({
      ...f,
      priorities: [
        ...f.priorities,
        { id: newId('p'), name: '', amount: 0, isFixed: true },
      ],
    }));

  const updateRow = (id: string, patch: Partial<PriorityExpense>) =>
    setForm((f) => ({
      ...f,
      priorities: f.priorities.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));

  const removeRow = (id: string) =>
    setForm((f) => ({ ...f, priorities: f.priorities.filter((p) => p.id !== id) }));

  return (
    <ModalStackShell
      step={step}
      totalSteps={totalSteps}
      primaryAction={{
        label: mode === 'edit' ? 'Save' : 'Continue',
        onPress: onNext,
        disabled: !valid,
      }}
      secondaryAction={{ label: mode === 'edit' ? 'Cancel' : 'Back', onPress: onBack }}
      tertiaryAction={
        mode !== 'edit' && hasNone ? { label: 'I have none', onPress: onNext } : undefined
      }
    >
      <StepHeader
        step={step}
        totalSteps={totalSteps}
        stepName="Priorities"
        question="What bills do you have to pay?"
        mode={mode}
      />

      <View style={{ paddingHorizontal: t.space[4] }}>
        {form.priorities.map((row) => (
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
                placeholder="Rent, internet…"
                accessibilityLabel="Priority name"
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
              accessibilityLabel={`Remove ${row.name || 'priority'}`}
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

        <Pressable
          onPress={addRow}
          accessibilityRole="button"
          accessibilityLabel="Add a priority"
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
            marginTop: form.priorities.length > 0 ? 0 : t.space[2],
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
            {form.priorities.length === 0 ? 'Add your first priority' : 'Add another'}
          </Text>
        </Pressable>
      </View>

      {form.priorities.length > 0 ? (
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
            Total priorities
          </Text>
          <AmountDisplay value={total} symbol={symbol} size="lg" align="right" />
        </View>
      ) : null}
    </ModalStackShell>
  );
}
