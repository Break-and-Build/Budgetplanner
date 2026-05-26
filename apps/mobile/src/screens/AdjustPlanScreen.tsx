/**
 * AdjustPlanScreen — mid-month plan editor.
 *
 * Pattern: menu hub + per-section edit, not a linear walk. Tap the section
 * you want, edit it, Save → modal dismisses. Maps naturally to the optional
 * `focus` route param (skips the menu, opens a specific section directly).
 *
 * Sections that can be edited:
 *   • Income
 *   • Priorities
 *   • Savings
 *   • Categories (the split preset)
 *
 * SafeToSpend isn't in this list — it's read-only confirmation in SetupRitual,
 * derived from the other four. Adjusting any of those re-derives it.
 *
 * Per the brief: no "discard changes?" prompt. The plan is meant to be living.
 * Saving from any section commits everything in-flight and dismisses.
 * (Undo snackbar lands in S4.)
 */

import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ChevronRight, X } from 'lucide-react-native';
import {
  calcSavingsTotal,
  calcTotalIncome,
  calcTotalPriorities,
  defaultSplit,
} from '@budgetplanner/core';

import { useTokens } from '../theme/ThemeProvider';
import { HeaderIconButton } from '../components/ScreenHeader';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryDot } from '../components/CategoryDot';
import { useBudget } from '../state/BudgetContext';
import { CATEGORY_IDS, CATEGORY_LABELS } from '../state/categories';
import { IncomeStep } from './setup/IncomeStep';
import { PrioritiesStep } from './setup/PrioritiesStep';
import { SavingsStep } from './setup/SavingsStep';
import { BucketsStep } from './setup/BucketsStep';
import type { SetupFormState } from './setup/types';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AdjustPlan'>;
type Section = 'income' | 'priorities' | 'savings' | 'buckets';

export function AdjustPlanScreen() {
  const t = useTokens();
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { currentMonth, symbol, setPlan } = useBudget();

  // ─── Form state ───────────────────────────────────────────────────────────
  // Initialised from the current plan. Edits live here until Save commits.
  const [form, setForm] = useState<SetupFormState>(() => ({
    income: currentMonth.plan.income,
    priorities: currentMonth.plan.priorities,
    savings: currentMonth.plan.savings,
    split: currentMonth.plan.split.essentials > 0 ? currentMonth.plan.split : defaultSplit(),
  }));

  // Which view: the menu, or one of the four sections.
  // If `focus` was passed, start on that section directly.
  const [view, setView] = useState<'menu' | Section>(
    (route.params?.focus as Section | undefined) ?? 'menu',
  );

  const save = () => {
    setPlan({
      income: form.income,
      priorities: form.priorities,
      savings: form.savings,
      split: form.split,
    });
    nav.goBack();
  };

  const cancelToMenu = () => {
    // If the user entered via `focus`, Cancel dismisses the whole modal —
    // there's no menu to return to.
    if (route.params?.focus) {
      nav.goBack();
    } else {
      setView('menu');
    }
  };

  // ─── Render per view ──────────────────────────────────────────────────────
  if (view === 'income') {
    return (
      <IncomeStep
        mode="edit"
        form={form}
        setForm={setForm}
        onNext={save}
        onBack={cancelToMenu}
      />
    );
  }
  if (view === 'priorities') {
    return (
      <PrioritiesStep
        mode="edit"
        form={form}
        setForm={setForm}
        onNext={save}
        onBack={cancelToMenu}
      />
    );
  }
  if (view === 'savings') {
    return (
      <SavingsStep
        mode="edit"
        form={form}
        setForm={setForm}
        onNext={save}
        onBack={cancelToMenu}
      />
    );
  }
  if (view === 'buckets') {
    return (
      <BucketsStep
        mode="edit"
        form={form}
        setForm={setForm}
        onNext={save}
        onBack={cancelToMenu}
      />
    );
  }

  // ─── Menu hub ─────────────────────────────────────────────────────────────
  const totalIncome = calcTotalIncome(form.income);
  const totalPriorities = calcTotalPriorities(form.priorities);
  const totalSavings = calcSavingsTotal(form.savings, totalIncome - totalPriorities);

  return (
    <View style={{ flex: 1, backgroundColor: t.color.bg.base, paddingTop: insets.top }}>
      {/* Header — bigger title, snug to the top edge */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: t.space[4],
          paddingTop: 0,
          paddingBottom: t.space[3],
          minHeight: t.layout.minTapTarget,
        }}
      >
        <View style={{ width: t.layout.minTapTarget }} />
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          accessibilityRole="header"
          style={[
            t.type.title2,
            { color: t.color.text.primary, flex: 1, textAlign: 'center' },
          ]}
        >
          Adjust plan
        </Text>
        <HeaderIconButton onPress={nav.goBack} accessibilityLabel="Close">
          <X size={24} color={t.color.text.primary} strokeWidth={1.75} />
        </HeaderIconButton>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + t.space[8],
        }}
      >
        <View
          style={{
            paddingHorizontal: t.space[4],
            paddingTop: t.space[2],
            paddingBottom: t.space[5],
          }}
        >
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.callout,
              { color: t.color.text.secondary },
            ]}
          >
            Tap a section to edit. Changes apply immediately on Save.
          </Text>
        </View>

        {/* Section cards */}
        <View style={{ paddingHorizontal: t.space[4], gap: t.space[3] }}>
          <SectionCard
            label="Income"
            sublabel={`${form.income.length} source${form.income.length === 1 ? '' : 's'}`}
            value={totalIncome}
            symbol={symbol}
            onPress={() => setView('income')}
          />
          <SectionCard
            label="Priorities"
            sublabel={`${form.priorities.length} item${form.priorities.length === 1 ? '' : 's'}`}
            value={totalPriorities}
            symbol={symbol}
            onPress={() => setView('priorities')}
          />
          <SectionCard
            label="Savings"
            sublabel={
              !form.savings.enabled
                ? 'Off'
                : `${form.savings.entries.length} entr${form.savings.entries.length === 1 ? 'y' : 'ies'}`
            }
            value={form.savings.enabled ? totalSavings : 0}
            symbol={symbol}
            onPress={() => setView('savings')}
          />
          <BucketsCard split={form.split} onPress={() => setView('buckets')} />
        </View>

        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.caption1,
            {
              color: t.color.text.tertiary,
              textAlign: 'center',
              paddingHorizontal: t.space[6],
              paddingTop: t.space[7],
            },
          ]}
        >
          You can come back any time. Past months stay closed and untouched.
        </Text>
      </ScrollView>
    </View>
  );
}

// ─── Menu cards ──────────────────────────────────────────────────────────────

function SectionCard({
  label,
  sublabel,
  value,
  symbol,
  onPress,
}: {
  label: string;
  sublabel: string;
  value: number;
  symbol: string;
  onPress: () => void;
}) {
  const t = useTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${label}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: t.space[4],
        paddingHorizontal: t.space[4],
        minHeight: 72,
        backgroundColor: pressed ? t.color.bg.sunken : t.color.bg.elevated,
        borderRadius: t.radii.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: t.color.border.hairline,
      })}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.headline,
            { color: t.color.text.primary },
          ]}
        >
          {label}
        </Text>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.footnote,
            { color: t.color.text.secondary, marginTop: 2 },
          ]}
        >
          {sublabel}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', marginRight: t.space[2] }}>
        <AmountDisplay value={value} symbol={symbol} size="md" align="right" />
      </View>
      <ChevronRight size={18} color={t.color.text.tertiary} strokeWidth={1.75} />
    </Pressable>
  );
}

function BucketsCard({
  split,
  onPress,
}: {
  split: { essentials: number; growth: number; stability: number; rewards: number };
  onPress: () => void;
}) {
  const t = useTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Edit Categories"
      style={({ pressed }) => ({
        paddingVertical: t.space[4],
        paddingHorizontal: t.space[4],
        backgroundColor: pressed ? t.color.bg.sunken : t.color.bg.elevated,
        borderRadius: t.radii.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: t.color.border.hairline,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: t.space[3],
        }}
      >
        <View>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[t.type.headline, { color: t.color.text.primary }]}
          >
            Categories
          </Text>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.footnote,
              { color: t.color.text.secondary, marginTop: 2 },
            ]}
          >
            Split preset
          </Text>
        </View>
        <ChevronRight size={18} color={t.color.text.tertiary} strokeWidth={1.75} />
      </View>
      <View style={{ gap: t.space[1] }}>
        {CATEGORY_IDS.map((id) => (
          <View
            key={id}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <CategoryDot category={id} size={8} style={{ marginRight: t.space[2] }} />
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              style={[
                t.type.footnote,
                { color: t.color.text.secondary, flex: 1 },
              ]}
            >
              {CATEGORY_LABELS[id]}
            </Text>
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              style={[
                t.type.footnote,
                {
                  color: t.color.text.primary,
                  fontWeight: t.fontWeight.medium,
                  fontVariant: ['tabular-nums'],
                },
              ]}
            >
              {split[id]}%
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}
