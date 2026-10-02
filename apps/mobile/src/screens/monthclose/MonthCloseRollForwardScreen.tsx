/**
 * MonthClose step 2 — Review and roll forward.
 *
 * The user confirms the plan that carries into the next month, section by
 * section. Three cards (Priorities · Savings · Categories) show what will be
 * carried. "Start [NextMonth]" is a confirmation: by tapping it the user is
 * saying "this plan is still right for the coming month" — which is why
 * `closeMonth` clears the needsReview flag that `rollForward` sets. A user
 * who wants to edit before confirming leaves the ritual (any header dismiss
 * works), edits via Home → Adjust plan, and re-opens the ritual.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  calcSavingsEntryAmount,
  calcSavingsTotal,
  calcTotalIncome,
  calcTotalPriorities,
} from '@budgetplanner/core';
import type { BudgetPlan } from '@budgetplanner/core';

import { useTokens } from '../../theme/ThemeProvider';
import { ModalStackShell } from '../../components/ModalStackShell';
import { AmountDisplay } from '../../components/AmountDisplay';
import { CategoryDot } from '../../components/CategoryDot';

interface Props {
  plan: BudgetPlan;
  symbol: string;
  nextMonthLabel: string;
  onBack: () => void;
  onFinish: () => void;
}

export function MonthCloseRollForwardScreen({
  plan,
  symbol,
  nextMonthLabel,
  onBack,
  onFinish,
}: Props) {
  const t = useTokens();

  const totalIncome = calcTotalIncome(plan.income);
  const totalPriorities = calcTotalPriorities(plan.priorities);
  const totalSavings = calcSavingsTotal(plan.savings, totalIncome - totalPriorities);

  return (
    <ModalStackShell
      step={2}
      totalSteps={2}
      primaryAction={{ label: `Confirm & start ${nextMonthLabel}`, onPress: onFinish }}
      secondaryAction={{ label: 'Back', onPress: onBack }}
    >
      {/* Hero */}
      <View
        style={{
          paddingHorizontal: t.space[4],
          paddingTop: t.space[2],
          paddingBottom: t.space[6],
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
          Review your plan
        </Text>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          accessibilityRole="header"
          style={[t.type.title1, { color: t.color.text.primary }]}
        >
          Still right for {nextMonthLabel}?
        </Text>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.callout,
            { color: t.color.text.secondary, marginTop: t.space[1] },
          ]}
        >
          Last month's priorities, savings and categories carry over. Confirm
          they still match your plan, or exit to tweak via Adjust plan.
        </Text>
      </View>

      {/* Priorities card */}
      <Card title="Priorities" totalLabel="Total" totalValue={totalPriorities} symbol={symbol}>
        {plan.priorities.length === 0 ? (
          <Empty>No priorities.</Empty>
        ) : (
          plan.priorities.map((p, idx) => (
            <Row
              key={p.id}
              label={p.name}
              value={p.amount}
              symbol={symbol}
              divider={idx < plan.priorities.length - 1}
            />
          ))
        )}
      </Card>

      {/* Savings card */}
      <Card title="Savings" totalLabel="Total" totalValue={totalSavings} symbol={symbol}>
        {!plan.savings.enabled || plan.savings.entries.length === 0 ? (
          <Empty>No savings entries.</Empty>
        ) : (
          plan.savings.entries.map((s, idx) => {
            const computed = calcSavingsEntryAmount(s, totalIncome - totalPriorities);
            return (
              <Row
                key={s.id}
                label={s.name}
                sublabel={
                  s.type === 'percentage' ? `${s.value}% of remainder` : undefined
                }
                value={computed}
                symbol={symbol}
                divider={idx < plan.savings.entries.length - 1}
              />
            );
          })
        )}
      </Card>

      {/* Buckets card */}
      <Card title="Categories">
        {plan.categories.map((c, idx) => (
          <View
            key={c.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: t.space[4],
              paddingVertical: t.space[3],
              borderBottomWidth:
                idx < plan.categories.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: t.color.border.hairline,
            }}
          >
            <CategoryDot color={c.color} size={8} style={{ marginRight: t.space[3] }} />
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              numberOfLines={1}
              style={[t.type.body, { color: t.color.text.primary, flex: 1 }]}
            >
              {c.name || 'Untitled'}
            </Text>
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              style={[
                t.type.headline,
                {
                  color: t.color.text.primary,
                  fontVariant: ['tabular-nums'],
                },
              ]}
            >
              {c.percent}%
            </Text>
          </View>
        ))}
      </Card>

      <Text
        allowFontScaling
        maxFontSizeMultiplier={t.a11y.maxFontScale}
        style={[
          t.type.footnote,
          {
            color: t.color.text.tertiary,
            textAlign: 'center',
            paddingHorizontal: t.space[5],
            paddingTop: t.space[6],
          },
        ]}
      >
        Need to change something? Exit this screen and tap Adjust plan on Home,
        then come back to close out.
      </Text>
    </ModalStackShell>
  );
}

// ─── Card primitives ─────────────────────────────────────────────────────────

function Card({
  title,
  totalLabel,
  totalValue,
  symbol,
  children,
}: {
  title: string;
  totalLabel?: string;
  totalValue?: number;
  symbol?: string;
  children: React.ReactNode;
}) {
  const t = useTokens();
  return (
    <View
      style={{
        marginHorizontal: t.space[4],
        marginBottom: t.space[4],
        backgroundColor: t.color.bg.elevated,
        borderRadius: t.radii.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: t.color.border.card,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          paddingHorizontal: t.space[4],
          paddingTop: t.space[3],
          paddingBottom: t.space[2],
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
          {title}
        </Text>
        {totalLabel && totalValue !== undefined && symbol ? (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: t.space[2] }}>
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              style={[t.type.caption1, { color: t.color.text.tertiary }]}
            >
              {totalLabel}
            </Text>
            <AmountDisplay value={totalValue} symbol={symbol} size="md" />
          </View>
        ) : null}
      </View>
      <View
        style={{
          height: StyleSheet.hairlineWidth,
          backgroundColor: t.color.border.hairline,
        }}
      />
      {children}
    </View>
  );
}

function Row({
  label,
  sublabel,
  value,
  symbol,
  divider,
}: {
  label: string;
  sublabel?: string;
  value: number;
  symbol: string;
  divider: boolean;
}) {
  const t = useTokens();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: t.space[4],
        paddingVertical: t.space[3],
        borderBottomWidth: divider ? StyleSheet.hairlineWidth : 0,
        borderBottomColor: t.color.border.hairline,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[t.type.body, { color: t.color.text.primary }]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {sublabel ? (
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
        ) : null}
      </View>
      <AmountDisplay value={value} symbol={symbol} size="md" align="right" />
    </View>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  const t = useTokens();
  return (
    <View style={{ paddingHorizontal: t.space[4], paddingVertical: t.space[4] }}>
      <Text
        allowFontScaling
        maxFontSizeMultiplier={t.a11y.maxFontScale}
        style={[t.type.footnote, { color: t.color.text.tertiary }]}
      >
        {children}
      </Text>
    </View>
  );
}
