/**
 * HomeScreen — the center of gravity.
 *
 * Anchored on the question "Can I spend right now?" Hierarchy from top:
 *
 *   1. Today's safe-to-spend  (hero numeric, big)
 *   2. Four category bars     (plan-vs-actual, stacked)
 *   3. Recent activity        (last 3 transactions + "See all")
 *   4. Adjust plan            (low-emphasis link)
 *
 * The month-close banner is built in task S3 — it will appear above (2) when
 * triggered. The "+" FAB belongs to the TabShell, not this screen.
 */

import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Plus, Settings as SettingsIcon, X as XIcon } from 'lucide-react-native';
import { shouldShowMonthCloseBanner } from '@budgetplanner/core';

import { useTokens } from '../theme/ThemeProvider';
import { TabShell } from '../components/TabShell';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryBar } from '../components/CategoryBar';
import { TransactionRow } from '../components/TransactionRow';
import { Button } from '../components/ui/Button';
import { useBudget } from '../state/BudgetContext';
import { CATEGORY_IDS, CATEGORY_LABELS } from '../state/categories';
import {
  allocatedByCategory,
  daysRemainingIn,
  recentTransactions,
  spentByCategory,
  todaysSafeToSpend,
} from '../state/selectors';
import type { RootStackParamList, MainTabsParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList> &
  BottomTabNavigationProp<MainTabsParamList>;

export function HomeScreen() {
  const t = useTokens();
  const nav = useNavigation<Nav>();
  const {
    currentMonth,
    symbol,
    openFastLog,
    monthCloseBannerDismissed,
    dismissMonthCloseBanner,
  } = useBudget();

  const now = new Date();

  // ─── Month-close banner ────────────────────────────────────────────────────
  // Appears from the 28th onward, or whenever the system clock has moved past
  // the current monthKey (overdue close). Overdue close is undismissable.
  const showBanner = shouldShowMonthCloseBanner(now, currentMonth);
  const overdue = nowMonthKey(now) > currentMonth.monthKey;
  const bannerVisible = showBanner && (overdue || !monthCloseBannerDismissed);
  const bannerMonthLabel = useMemo(
    () => monthLabelFromKey(currentMonth.monthKey),
    [currentMonth.monthKey],
  );

  // ─── Selectors ─────────────────────────────────────────────────────────────
  const today = todaysSafeToSpend(currentMonth, now);
  const daysLeft = daysRemainingIn(currentMonth.monthKey, now);
  const allocated = useMemo(() => allocatedByCategory(currentMonth.plan), [currentMonth.plan]);
  const spent = useMemo(() => spentByCategory(currentMonth), [currentMonth]);
  const recent = useMemo(() => recentTransactions(currentMonth, 3), [currentMonth]);

  // ─── FAB ───────────────────────────────────────────────────────────────────
  // Opens the FastLogSheet via context. The sheet itself is rendered once at
  // the App root so the same instance shows on Home and Activity.
  const onFabPress = openFastLog;

  const fab = (
    <Pressable
      onPress={onFabPress}
      accessibilityRole="button"
      accessibilityLabel="Log a transaction"
      style={({ pressed }) => ({
        width: t.layout.fabSize,
        height: t.layout.fabSize,
        borderRadius: t.layout.fabSize / 2,
        backgroundColor: pressed ? t.color.fab.pressed : t.color.fab.bg,
        alignItems: 'center',
        justifyContent: 'center',
        ...t.shadow.lg,
      })}
    >
      <Plus color={t.color.fab.icon} size={26} strokeWidth={2.25} />
    </Pressable>
  );

  return (
    <TabShell fab={fab}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: t.space[11] }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero: today's safe-to-spend (gear inline with eyebrow) ───── */}
        <View
          accessible
          accessibilityLabel={
            today > 0
              ? `${symbol}${today.toLocaleString('en-US')} left to spend today, ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} to go.`
              : `Nothing left to spend today, ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} to go.`
          }
          style={{
            paddingHorizontal: t.space[4],
            // Breathing room between status bar (safe-area top) and the eyebrow.
            paddingTop: t.space[5],
            paddingBottom: t.space[7],
            alignItems: 'flex-start',
          }}
        >
          {/* Eyebrow row: caption text on the left, gear icon on the right.
              The gear uses hitSlop (not a fixed 44pt box) so the row tracks
              the caption's natural height — no dead space below it. */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              alignSelf: 'stretch',
              marginBottom: t.space[1],
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
                },
              ]}
            >
              Safe to spend today
            </Text>
            <Pressable
              onPress={() => nav.navigate('Settings')}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              // 14pt hitSlop on every side → tap target is (22 + 28) = 50pt,
              // comfortably above the 44pt minimum, while the visible icon
              // stays small enough not to dominate the caption row.
              hitSlop={14}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
                padding: t.space[1],
              })}
            >
              <SettingsIcon size={20} color={t.color.text.primary} strokeWidth={1.75} />
            </Pressable>
          </View>
          <AmountDisplay
            value={today}
            symbol={symbol}
            size="hero"
            align="left"
            accessibilityLabel=""
          />
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.callout,
              { color: t.color.text.secondary, marginTop: t.space[2] },
            ]}
          >
            {today > 0
              ? `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} to go this month`
              : `You're at today's limit · ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} to go`}
          </Text>
        </View>

        {/* ─── Month-close banner (28th onward, or overdue close) ───────── */}
        {bannerVisible ? (
          <View
            style={{
              marginHorizontal: t.space[4],
              marginBottom: t.space[5],
              padding: t.space[4],
              backgroundColor: t.color.bg.elevated,
              borderRadius: t.radii.lg,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: overdue
                ? t.color.status.overBudget
                : t.color.border.divider,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <View style={{ flex: 1, paddingRight: t.space[2] }}>
                <Text
                  allowFontScaling
                  maxFontSizeMultiplier={t.a11y.maxFontScale}
                  style={[
                    t.type.headline,
                    { color: t.color.text.primary },
                  ]}
                >
                  {overdue
                    ? `${bannerMonthLabel} wasn't closed`
                    : `Close out ${bannerMonthLabel}`}
                </Text>
                <Text
                  allowFontScaling
                  maxFontSizeMultiplier={t.a11y.maxFontScale}
                  style={[
                    t.type.footnote,
                    {
                      color: t.color.text.secondary,
                      marginTop: t.space[1],
                    },
                  ]}
                >
                  {overdue
                    ? 'Reflect and roll forward to start the new month.'
                    : 'A short reflection, then roll forward.'}
                </Text>
              </View>
              {!overdue ? (
                <Pressable
                  onPress={dismissMonthCloseBanner}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss for now"
                  hitSlop={8}
                  style={({ pressed }) => ({
                    padding: t.space[1],
                    opacity: pressed ? 0.5 : 1,
                  })}
                >
                  <XIcon
                    size={18}
                    color={t.color.text.tertiary}
                    strokeWidth={1.75}
                  />
                </Pressable>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', gap: t.space[3], marginTop: t.space[4] }}>
              {!overdue ? (
                <View style={{ flex: 1 }}>
                  <Button
                    variant="secondary"
                    onPress={dismissMonthCloseBanner}
                    fullWidth
                  >
                    Not yet
                  </Button>
                </View>
              ) : null}
              <View style={{ flex: overdue ? 1 : 2 }}>
                <Button
                  variant="primary"
                  onPress={() => nav.navigate('MonthClose')}
                  fullWidth
                  accessibilityLabel="Close out the month"
                >
                  Close out
                </Button>
              </View>
            </View>
          </View>
        ) : null}

        {/* ─── Category bars (no header — the bars are the content) ─────── */}
        <View
          style={{
            marginHorizontal: t.space[4],
            backgroundColor: t.color.bg.elevated,
            borderRadius: t.radii.lg,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: t.color.border.hairline,
            overflow: 'hidden',
          }}
        >
          {CATEGORY_IDS.map((id, idx) => (
            <View key={id}>
              <CategoryBar
                category={id}
                label={CATEGORY_LABELS[id]}
                allocated={allocated[id]}
                spent={spent[id]}
                symbol={symbol}
                size="compact"
                onPress={() => nav.navigate('CategoryDetail', { category: id })}
              />
              {idx < CATEGORY_IDS.length - 1 ? (
                <View
                  style={{
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: t.color.border.hairline,
                    marginLeft: t.space[4],
                  }}
                />
              ) : null}
            </View>
          ))}
        </View>

        {/* ─── Adjust plan (low emphasis) ───────────────────────────────── */}
        <View
          style={{
            paddingHorizontal: t.space[4],
            paddingTop: t.space[3],
            alignItems: 'flex-start',
          }}
        >
          <Pressable
            onPress={() => nav.navigate('AdjustPlan')}
            accessibilityRole="button"
            accessibilityLabel="Adjust this month's plan"
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
                  color: t.color.brand.base,
                  fontWeight: t.fontWeight.semibold,
                },
              ]}
            >
              Adjust plan →
            </Text>
          </Pressable>
        </View>

        {/* ─── Section: Recent activity ─────────────────────────────────── */}
        <View style={{ marginTop: t.space[7] }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              paddingHorizontal: t.space[4],
              marginBottom: t.space[2],
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
                },
              ]}
              accessibilityRole="header"
            >
              Recent activity
            </Text>
            {recent.length > 0 ? (
              <Pressable
                onPress={() => nav.jumpTo('Activity')}
                accessibilityRole="button"
                accessibilityLabel="See all transactions"
                hitSlop={8}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              >
                <Text
                  allowFontScaling
                  maxFontSizeMultiplier={t.a11y.maxFontScale}
                  style={[
                    t.type.footnote,
                    {
                      color: t.color.brand.base,
                      fontWeight: t.fontWeight.semibold,
                    },
                  ]}
                >
                  See all
                </Text>
              </Pressable>
            ) : null}
          </View>

          {recent.length === 0 ? (
            <View
              style={{
                marginHorizontal: t.space[4],
                paddingVertical: t.space[7],
                alignItems: 'center',
              }}
            >
              <Text
                allowFontScaling
                maxFontSizeMultiplier={t.a11y.maxFontScale}
                style={[t.type.subhead, { color: t.color.text.tertiary }]}
              >
                Tap + to log your first transaction.
              </Text>
            </View>
          ) : (
            <View
              style={{
                marginHorizontal: t.space[4],
                backgroundColor: t.color.bg.elevated,
                borderRadius: t.radii.lg,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: t.color.border.hairline,
                overflow: 'hidden',
              }}
            >
              {recent.map((tx, idx) => (
                <View key={tx.id}>
                  <TransactionRow
                    transaction={tx}
                    symbol={symbol}
                    categoryLabel={CATEGORY_LABELS[tx.categoryId]}
                    onPress={() => nav.navigate('TransactionDetail', { id: tx.id })}
                  />
                  {idx < recent.length - 1 ? (
                    <View
                      style={{
                        height: StyleSheet.hairlineWidth,
                        backgroundColor: t.color.border.hairline,
                        // Indent past row padding (16) + dot (8) + gap (12) = 36
                        marginLeft: t.space[4] + 8 + t.space[3],
                      }}
                    />
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </TabShell>
  );
}

// ─── Banner helpers ──────────────────────────────────────────────────────────

function nowMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

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

