/**
 * FastLogSheet — the daily-use interaction.
 *
 * Goal from the brief: log a transaction in ≤ 5 seconds without thinking.
 * Layout, top-to-bottom:
 *
 *   • Title row ("Log a spend") + close button
 *   • Hero CurrencyInput, auto-focused, number-pad open
 *   • Four category chips (segmented control — always-visible, no expansion)
 *   • Single-line note input (optional)
 *   • Primary "Log" button (disabled until amount > 0)
 *
 * On Log: optimistically prepend the transaction, dismiss the sheet. The
 * bar-fill animation on Home is the confirmation — no toast, no banner.
 *
 * The sheet's `visible` state lives in `BudgetContext` so any screen can
 * call `openFastLog()`; the component itself is rendered once at the root.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import type { CategoryId, Transaction } from '@budgetplanner/core';

import { useTokens } from '../theme/ThemeProvider';
import { BottomSheet } from '../components/BottomSheet';
import { CurrencyInput } from '../components/CurrencyInput';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CategoryDot } from '../components/CategoryDot';
import { useBudget } from '../state/BudgetContext';
import { CATEGORY_IDS, CATEGORY_LABELS } from '../state/categories';
import { lastUsedCategory, remainingByCategory } from '../state/selectors';

/**
 * Generate a transaction id. Local-only persistence — we don't need a true
 * UUID, just unique-within-device with no collisions. Timestamp + random
 * suffix is more than enough.
 */
function newTransactionId(): string {
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function FastLogSheet() {
  const t = useTokens();
  const {
    symbol,
    currentMonth,
    addTransaction,
    fastLogVisible,
    closeFastLog,
  } = useBudget();

  // ─── Local form state ─────────────────────────────────────────────────────
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState<CategoryId>('essentials');
  const [note, setNote] = useState('');

  // Reset the form every time the sheet opens — never stale.
  useEffect(() => {
    if (fastLogVisible) {
      setAmount(0);
      setNote('');
      setCategoryId(lastUsedCategory(currentMonth));
    }
  }, [fastLogVisible, currentMonth]);

  // ─── Over-budget hint (S1 prep) ───────────────────────────────────────────
  // If the user is already over budget on the selected category, show a small
  // inline caption so they know before logging. No interruption.
  const remaining = useMemo(() => remainingByCategory(currentMonth), [currentMonth]);
  const overOnSelected = remaining[categoryId] < 0;

  // ─── Submit ───────────────────────────────────────────────────────────────
  const canLog = amount > 0;
  const onLog = useCallback(() => {
    if (!canLog) return;
    const tx: Transaction = {
      id: newTransactionId(),
      amount,
      categoryId,
      note: note.trim() || undefined,
      loggedAt: new Date().toISOString(),
      monthKey: currentMonth.monthKey,
    };
    addTransaction(tx);
    closeFastLog();
  }, [amount, categoryId, note, currentMonth.monthKey, canLog, addTransaction, closeFastLog]);

  return (
    <BottomSheet visible={fastLogVisible} onDismiss={closeFastLog}>
      {/* Title row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: t.space[4],
        }}
      >
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          accessibilityRole="header"
          style={[t.type.title2, { color: t.color.text.primary }]}
        >
          Log a spend
        </Text>
        <Pressable
          onPress={closeFastLog}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          style={({ pressed }) => ({
            width: t.layout.minTapTarget,
            height: t.layout.minTapTarget,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: t.radii.pill,
            backgroundColor: pressed ? t.color.bg.sunken : 'transparent',
          })}
        >
          <X size={22} color={t.color.text.secondary} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Hero amount field */}
      <View
        style={{
          paddingVertical: t.space[5],
          alignItems: 'center',
        }}
      >
        <CurrencyInput
          value={amount}
          onChange={setAmount}
          symbol={symbol}
          size="hero"
          autoFocus
        />
      </View>

      {/* Category segmented control */}
      <View style={{ marginBottom: t.space[5] }}>
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
          Category
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: t.space[2] }}
        >
          {CATEGORY_IDS.map((id) => (
            <CategoryChip
              key={id}
              id={id}
              label={CATEGORY_LABELS[id]}
              selected={categoryId === id}
              onPress={() => setCategoryId(id)}
            />
          ))}
        </ScrollView>
        {overOnSelected ? (
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.footnote,
              {
                color: t.color.status.overBudget,
                marginTop: t.space[2],
              },
            ]}
          >
            Already over budget in {CATEGORY_LABELS[categoryId]} this month.
          </Text>
        ) : null}
      </View>

      {/* Optional note */}
      <View style={{ marginBottom: t.space[5] }}>
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
          Note (optional)
        </Text>
        <Input
          value={note}
          onChangeText={setNote}
          placeholder="What was it for?"
          accessibilityLabel="Optional note"
        />
      </View>

      {/* Log button */}
      <View style={{ marginBottom: t.space[2] }}>
        <Button
          variant="primary"
          size="lg"
          onPress={onLog}
          disabled={!canLog}
          fullWidth
        >
          Log
        </Button>
      </View>
    </BottomSheet>
  );
}

// ─── Category chip ───────────────────────────────────────────────────────────
// Pill with dot + name. Selected = filled ink background, white text.
// Unselected = transparent with hairline border.

interface CategoryChipProps {
  id: CategoryId;
  label: string;
  selected: boolean;
  onPress: () => void;
}

function CategoryChip({ id, label, selected, onPress }: CategoryChipProps) {
  const t = useTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${selected ? 'selected' : 'not selected'}`}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          paddingHorizontal: t.space[3],
          paddingVertical: t.space[2],
          borderRadius: t.radii.pill,
          minHeight: 36,
          // Selected → light-indigo tinted pill, matches Activity filter chips.
          backgroundColor: selected
            ? t.color.brand.tint
            : pressed
              ? t.color.bg.sunken
              : 'transparent',
          borderWidth: selected ? 0 : StyleSheet.hairlineWidth,
          borderColor: t.color.border.divider,
        },
      ]}
    >
      <CategoryDot
        category={id}
        size={8}
        style={{ marginRight: t.space[2] }}
      />
      <Text
        allowFontScaling
        maxFontSizeMultiplier={t.a11y.maxFontScale}
        style={[
          t.type.subhead,
          {
            color: selected ? t.color.brand.base : t.color.text.primary,
            fontWeight: selected ? t.fontWeight.semibold : t.fontWeight.regular,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
