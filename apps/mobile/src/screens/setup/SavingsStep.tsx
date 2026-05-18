/**
 * SetupRitual Step 3 — Savings.
 *
 * "Setting anything aside?"  →  master toggle, then a list of entries.
 * Each entry can be a fixed amount OR a percentage of what's left after
 * priorities. Always optional (toggle off and skip).
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import type { SavingsEntry } from '@budgetplanner/core';
import { calcSavingsEntryAmount, calcTotalIncome, calcTotalPriorities } from '@budgetplanner/core';

import { useTokens } from '../../theme/ThemeProvider';
import { ModalStackShell } from '../../components/ModalStackShell';
import { CurrencyInput } from '../../components/CurrencyInput';
import { Input } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { AmountDisplay } from '../../components/AmountDisplay';
import { useBudget } from '../../state/BudgetContext';
import { StepHeader } from './StepHeader';
import { newId, type StepProps } from './types';

export function SavingsStep({ step, totalSteps, mode = 'create', form, setForm, onNext, onBack }: StepProps) {
  const t = useTokens();
  const { symbol } = useBudget();

  // Base for percentage-typed savings entries.
  const remainingAfterPriorities =
    calcTotalIncome(form.income) - calcTotalPriorities(form.priorities);

  const total = useMemo(() => {
    if (!form.savings.enabled) return 0;
    return form.savings.entries.reduce(
      (s, e) => s + calcSavingsEntryAmount(e, remainingAfterPriorities),
      0,
    );
  }, [form.savings, remainingAfterPriorities]);

  // Valid if either disabled (skip) OR every entry is complete.
  const valid =
    !form.savings.enabled ||
    (form.savings.entries.length > 0 &&
      form.savings.entries.every((e) => e.name.trim() && e.value > 0));

  const toggleEnabled = (next: boolean) =>
    setForm((f) => ({
      ...f,
      savings: {
        enabled: next,
        entries:
          next && f.savings.entries.length === 0
            ? [{ id: newId('s'), name: 'Emergency fund', type: 'percentage', value: 10 }]
            : f.savings.entries,
      },
    }));

  const addRow = () =>
    setForm((f) => ({
      ...f,
      savings: {
        ...f.savings,
        entries: [
          ...f.savings.entries,
          { id: newId('s'), name: '', type: 'amount', value: 0 },
        ],
      },
    }));

  const updateRow = (id: string, patch: Partial<SavingsEntry>) =>
    setForm((f) => ({
      ...f,
      savings: {
        ...f.savings,
        entries: f.savings.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      },
    }));

  const removeRow = (id: string) =>
    setForm((f) => ({
      ...f,
      savings: {
        ...f.savings,
        entries: f.savings.entries.filter((e) => e.id !== id),
      },
    }));

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
    >
      <StepHeader
        step={step}
        totalSteps={totalSteps}
        stepName="Savings"
        question="Setting anything aside?"
        mode={mode}
      />

      {/* Master toggle */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: t.space[4],
          paddingVertical: t.space[3],
          marginHorizontal: t.space[4],
          backgroundColor: t.color.bg.elevated,
          borderRadius: t.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.color.border.hairline,
          marginBottom: t.space[4],
        }}
      >
        <View style={{ flex: 1, paddingRight: t.space[3] }}>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[t.type.body, { color: t.color.text.primary }]}
          >
            Set aside for savings
          </Text>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.footnote,
              { color: t.color.text.secondary, marginTop: 2 },
            ]}
          >
            Reduces this month's safe-to-spend.
          </Text>
        </View>
        <Switch
          value={form.savings.enabled}
          onValueChange={toggleEnabled}
          accessibilityLabel="Enable savings this month"
        />
      </View>

      {/* List */}
      {form.savings.enabled ? (
        <View style={{ paddingHorizontal: t.space[4] }}>
          {form.savings.entries.map((row) => (
            <View
              key={row.id}
              style={{
                marginBottom: t.space[3],
                padding: t.space[3],
                backgroundColor: t.color.bg.elevated,
                borderRadius: t.radii.md,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: t.color.border.hairline,
              }}
            >
              {/* Top row: name + remove */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: t.space[2],
                  marginBottom: t.space[2],
                }}
              >
                <View style={{ flex: 1 }}>
                  <Input
                    value={row.name}
                    onChangeText={(v) => updateRow(row.id, { name: v })}
                    placeholder="Emergency fund, vacation…"
                    accessibilityLabel="Savings entry name"
                  />
                </View>
                <Pressable
                  onPress={() => removeRow(row.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${row.name || 'savings entry'}`}
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

              {/* Bottom row: type toggle + value */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: t.space[2],
                }}
              >
                {/* $/% segmented toggle */}
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: t.color.bg.sunken,
                    borderRadius: t.radii.md,
                    padding: 2,
                  }}
                >
                  {(['amount', 'percentage'] as const).map((typ) => {
                    const selected = row.type === typ;
                    const label = typ === 'amount' ? symbol : '%';
                    return (
                      <Pressable
                        key={typ}
                        onPress={() => updateRow(row.id, { type: typ, value: 0 })}
                        accessibilityRole="button"
                        accessibilityLabel={typ === 'amount' ? 'Fixed amount' : 'Percentage'}
                        accessibilityState={{ selected }}
                        style={{
                          paddingHorizontal: t.space[3],
                          paddingVertical: t.space[2],
                          minWidth: 40,
                          borderRadius: t.radii.md - 2,
                          backgroundColor: selected ? t.color.bg.elevated : 'transparent',
                          alignItems: 'center',
                          ...(selected ? t.shadow.xs : {}),
                        }}
                      >
                        <Text
                          allowFontScaling
                          maxFontSizeMultiplier={t.a11y.maxFontScale}
                          style={[
                            t.type.subhead,
                            {
                              color: selected
                                ? t.color.text.primary
                                : t.color.text.secondary,
                              fontWeight: selected
                                ? t.fontWeight.semibold
                                : t.fontWeight.regular,
                            },
                          ]}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Value input */}
                <View style={{ flex: 1 }}>
                  {row.type === 'amount' ? (
                    <CurrencyInput
                      value={row.value}
                      onChange={(v) => updateRow(row.id, { value: v })}
                      symbol={symbol}
                      size="md"
                    />
                  ) : (
                    <Input
                      value={row.value ? String(row.value) : ''}
                      onChangeText={(v) =>
                        updateRow(row.id, {
                          value: Math.max(0, Math.min(100, Number(v) || 0)),
                        })
                      }
                      placeholder="10"
                      keyboardType="numeric"
                      trailing={
                        <Text style={[t.type.body, { color: t.color.text.secondary }]}>%</Text>
                      }
                      accessibilityLabel="Percentage"
                    />
                  )}
                </View>
              </View>
            </View>
          ))}

          <Pressable
            onPress={addRow}
            accessibilityRole="button"
            accessibilityLabel="Add another savings entry"
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
              Add another
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* Total */}
      {form.savings.enabled && total > 0 ? (
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
            Total savings
          </Text>
          <AmountDisplay value={total} symbol={symbol} size="lg" align="right" />
        </View>
      ) : null}
    </ModalStackShell>
  );
}
