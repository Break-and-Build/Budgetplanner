/**
 * CategoryDetailScreen — the per-category breakdown.
 *
 * Reached by:
 *   • Tap on a category bar from Home
 *   • Future: nav from TransactionDetail to the row's category (C5)
 *
 * Vertical hierarchy:
 *
 *   1. Header (back · category name · dot)
 *   2. Three-column number row: allocated · spent · remaining
 *   3. MiniProgressArc — the one chart in the app
 *   4. Transactions list for this category, this month, grouped by day
 *   5. Footer link: "Adjust [Category] →" pushes AdjustPlan
 *
 * The screen sits on the root native-stack (not the tab bar), so we use a
 * lightweight inline shell instead of TabShell.
 */

import React, { useMemo } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import type { CategoryId, Transaction } from '@budgetplanner/core';

import { useTokens } from '../theme/ThemeProvider';
import { HeaderIconButton } from '../components/ScreenHeader';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryDot } from '../components/CategoryDot';
import { DayHeader } from '../components/DayHeader';
import { TransactionRow } from '../components/TransactionRow';
import { MiniProgressArc } from '../components/MiniProgressArc';
import { useBudget } from '../state/BudgetContext';
import { CATEGORY_LABELS } from '../state/categories';
import {
  allocatedByCategory,
  daysRemainingIn,
  spentByCategory,
} from '../state/selectors';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CategoryDetail'>;

export function CategoryDetailScreen() {
  const t = useTokens();
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentMonth, symbol } = useBudget();

  const categoryId: CategoryId = route.params.category;
  const label = CATEGORY_LABELS[categoryId];

  // ─── Numbers ───────────────────────────────────────────────────────────────
  const allocated = useMemo(
    () => allocatedByCategory(currentMonth.plan)[categoryId],
    [currentMonth.plan, categoryId],
  );
  const spent = useMemo(
    () => spentByCategory(currentMonth)[categoryId],
    [currentMonth, categoryId],
  );
  const remaining = allocated - spent;
  const over = remaining < 0;

  // ─── Arc inputs ────────────────────────────────────────────────────────────
  const now = new Date();
  const spentRatio = allocated > 0 ? spent / allocated : 0;
  const monthRatio = useMemo(() => {
    const days = daysInMonthForKey(currentMonth.monthKey);
    const daysLeft = daysRemainingIn(currentMonth.monthKey, now);
    const dayOfMonth = days - daysLeft + 1;
    return Math.max(0, Math.min(1, dayOfMonth / days));
  }, [currentMonth.monthKey, now]);

  // ─── Transactions for this category, grouped by day ───────────────────────
  const sections = useMemo(() => {
    const txs = currentMonth.transactions
      .filter((t) => t.categoryId === categoryId)
      .sort((a, b) => (a.loggedAt < b.loggedAt ? 1 : -1));
    const groups = new Map<string, Transaction[]>();
    for (const tx of txs) {
      const k = isoDateKey(new Date(tx.loggedAt));
      const bucket = groups.get(k);
      if (bucket) bucket.push(tx);
      else groups.set(k, [tx]);
    }
    return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
  }, [currentMonth.transactions, categoryId]);

  const wide = width >= t.layout.breakpoint.wide;
  const maxWidth = wide ? t.layout.maxContentWidth : '100%';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.color.bg.base,
        paddingTop: insets.top,
      }}
    >
      <View style={{ flex: 1, alignSelf: 'center', width: '100%', maxWidth }}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingBottom: insets.bottom + t.space[8],
          }}
          ListHeaderComponent={
            <>
              {/* Top row: back + category dot */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: t.space[4],
                  paddingTop: t.space[2],
                  paddingBottom: t.space[2],
                  minHeight: t.layout.minTapTarget,
                }}
              >
                <HeaderIconButton onPress={nav.goBack} accessibilityLabel="Back">
                  <ChevronLeft size={26} color={t.color.text.primary} strokeWidth={1.75} />
                </HeaderIconButton>
                <CategoryDot category={categoryId} size={10} />
              </View>

              {/* Category title */}
              <View style={{ paddingHorizontal: t.space[4], paddingTop: t.space[2] }}>
                <Text
                  allowFontScaling
                  maxFontSizeMultiplier={t.a11y.maxFontScale}
                  accessibilityRole="header"
                  style={[t.type.title1, { color: t.color.text.primary }]}
                >
                  {label}
                </Text>
              </View>

              {/* Three numbers row */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: t.space[4],
                  paddingTop: t.space[5],
                  paddingBottom: t.space[6],
                }}
              >
                <NumberCell label="Allocated" value={allocated} symbol={symbol} />
                <NumberCell label="Spent" value={spent} symbol={symbol} />
                <NumberCell
                  label={over ? 'Over by' : 'Remaining'}
                  value={Math.abs(remaining)}
                  symbol={symbol}
                  color={over ? t.color.status.overBudget : undefined}
                />
              </View>

              {/* Arc */}
              <View style={{ alignItems: 'center', paddingVertical: t.space[5] }}>
                <MiniProgressArc
                  spentRatio={spentRatio}
                  monthRatio={monthRatio}
                  color={t.color.category[categoryId].base}
                  trackColor={t.color.category[categoryId].tint}
                  overBudget={over}
                  size={180}
                  strokeWidth={10}
                />
                <Text
                  allowFontScaling
                  maxFontSizeMultiplier={t.a11y.maxFontScale}
                  style={[
                    t.type.footnote,
                    { color: t.color.text.tertiary, marginTop: t.space[3] },
                  ]}
                >
                  Filled = spent · Tick = today
                </Text>
              </View>

              {/* Section header for transactions */}
              <View
                style={{
                  paddingHorizontal: t.space[4],
                  paddingTop: t.space[4],
                  paddingBottom: t.space[2],
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: t.color.border.hairline,
                }}
              >
                <Text
                  allowFontScaling
                  maxFontSizeMultiplier={t.a11y.maxFontScale}
                  accessibilityRole="header"
                  style={[
                    t.type.caption2,
                    {
                      color: t.color.text.secondary,
                      textTransform: 'uppercase',
                    },
                  ]}
                >
                  Transactions this month
                </Text>
              </View>
            </>
          }
          renderSectionHeader={({ section }) => <DayHeader date={section.title} />}
          renderItem={({ item, index, section }) => (
            <View>
              <TransactionRow
                transaction={item}
                symbol={symbol}
                categoryLabel={label}
                onPress={() => nav.navigate('TransactionDetail', { id: item.id })}
                hideCategory
              />
              {index < section.data.length - 1 ? (
                <View
                  style={{
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: t.color.border.hairline,
                    marginLeft: t.space[4],
                  }}
                />
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            <View
              style={{
                paddingTop: t.space[7],
                paddingHorizontal: t.space[6],
                alignItems: 'center',
              }}
            >
              <Text
                allowFontScaling
                maxFontSizeMultiplier={t.a11y.maxFontScale}
                style={[
                  t.type.subhead,
                  { color: t.color.text.tertiary, textAlign: 'center' },
                ]}
              >
                Nothing logged in {label} yet this month.
              </Text>
            </View>
          }
          ListFooterComponent={
            <View
              style={{
                paddingHorizontal: t.space[4],
                paddingTop: t.space[7],
                alignItems: 'flex-start',
              }}
            >
              <Pressable
                onPress={() =>
                  nav.navigate('AdjustPlan', {
                    focus: categoryId === 'essentials' ? 'priorities' : 'buckets',
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`Adjust ${label}`}
                hitSlop={8}
                style={({ pressed }) => ({
                  paddingVertical: t.space[2],
                  opacity: pressed ? 0.5 : 1,
                })}
              >
                <Text
                  allowFontScaling
                  maxFontSizeMultiplier={t.a11y.maxFontScale}
                  style={[
                    t.type.footnote,
                    {
                      color: t.color.text.secondary,
                      fontWeight: t.fontWeight.medium,
                    },
                  ]}
                >
                  Adjust {label} →
                </Text>
              </Pressable>
            </View>
          }
        />
      </View>
    </View>
  );
}

// ─── NumberCell ──────────────────────────────────────────────────────────────
// One of the three big numbers in the header row.

function NumberCell({
  label,
  value,
  symbol,
  color,
}: {
  label: string;
  value: number;
  symbol: string;
  color?: string;
}) {
  const t = useTokens();
  return (
    <View style={{ flex: 1, alignItems: 'flex-start' }}>
      <Text
        allowFontScaling
        maxFontSizeMultiplier={t.a11y.maxFontScale}
        style={[
          t.type.caption2,
          {
            color: t.color.text.secondary,
            textTransform: 'uppercase',
            marginBottom: t.space[1],
          },
        ]}
      >
        {label}
      </Text>
      <AmountDisplay
        value={value}
        symbol={symbol}
        size="lg"
        color={color}
        align="left"
      />
    </View>
  );
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function isoDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysInMonthForKey(monthKey: string): number {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m) return 30;
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
