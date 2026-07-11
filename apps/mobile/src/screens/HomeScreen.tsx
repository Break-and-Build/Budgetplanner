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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Settings as SettingsIcon,
  X as XIcon,
} from 'lucide-react-native';
import {
  calcSavingsTotal,
  calcTotalIncome,
  calcTotalPriorities,
  shouldShowMonthCloseBanner,
} from '@budgetplanner/core';

import { useTokens } from '../theme/ThemeProvider';
import { TabShell } from '../components/TabShell';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryBar } from '../components/CategoryBar';
import { SpotlightTour, type SpotlightStep } from '../components/SpotlightTour';
import { TransactionRow } from '../components/TransactionRow';
import { Button } from '../components/ui/Button';
import { useBudget } from '../state/BudgetContext';
import { resolveCategory } from '../state/categories';
import {
  allocatedByCategory,
  daysRemainingIn,
  monthSafeToSpend,
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
    walkthroughSeen,
    markWalkthroughSeen,
    privacyMode,
    togglePrivacyMode,
    splashHidden,
  } = useBudget();

  const now = new Date();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

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
  const categories = currentMonth.plan.categories;

  // ─── Plan summary (income / priorities / savings → monthly budget) ─────────
  // Surfaced on Home so users can see the numbers they entered during setup —
  // and understand where "safe to spend" comes from (tester feedback).
  const plan = currentMonth.plan;
  const totalIncome = useMemo(() => calcTotalIncome(plan.income), [plan.income]);
  const totalPriorities = useMemo(() => calcTotalPriorities(plan.priorities), [plan.priorities]);
  const totalSavings = useMemo(
    () => calcSavingsTotal(plan.savings, totalIncome - totalPriorities),
    [plan.savings, totalIncome, totalPriorities],
  );
  const monthBudget = useMemo(() => monthSafeToSpend(plan), [plan]);

  // Two "empty" states that otherwise render as a confusing wall of ₦0 bars:
  //   • No income entered yet → prompt to add it
  //   • Income entered but fully used by priorities + savings → explain why
  const hasIncome = totalIncome > 0;
  const fullyAllocated = hasIncome && monthBudget === 0;

  // ─── First-run spotlight tour ──────────────────────────────────────────────
  // Fires once, after the user has a budget (so the hero + bars have real
  // numbers to point at). Measures the two on-screen anchors; the log button
  // is a fixed bottom-centre rect since it lives in the tab shell.
  const heroRef = useRef<View>(null);
  const categoryCardRef = useRef<View>(null);
  const fabRef = useRef<View>(null);
  const [tourSteps, setTourSteps] = useState<SpotlightStep[] | null>(null);

  useEffect(() => {
    if (walkthroughSeen || !hasIncome || categories.length === 0 || !splashHidden) return;
    const timer = setTimeout(() => {
      const hero = heroRef.current;
      const card = categoryCardRef.current;
      if (!hero || !card) return;
      hero.measureInWindow((hx, hy, hw, hh) => {
        card.measureInWindow((cx, cy, cw, ch) => {
          const build = (fx: number, fy: number, fw: number, fh: number) =>
            setTourSteps([
              {
                rect: { x: hx, y: hy, width: hw, height: hh },
                title: 'Your daily number',
                body: "This is what's safe to spend today. Check it whenever you're deciding.",
              },
              {
                rect: { x: cx, y: cy, width: cw, height: ch },
                title: 'Your categories',
                body: 'Each bar shows what’s left in a category this month. Tap one for detail.',
              },
              {
                rect: { x: fx, y: fy, width: fw, height: fh },
                title: 'Log a spend',
                body: 'Tap + to log a purchase in seconds — amount, category, done.',
              },
            ]);
          // Measure the real FAB so the highlight lands on it exactly; fall back
          // to a bottom-right estimate if the ref isn't ready.
          if (fabRef.current) {
            fabRef.current.measureInWindow(build);
          } else {
            build(screenW - 88, screenH - insets.bottom - 132, 64, 64);
          }
        });
      });
    }, 400);
    return () => clearTimeout(timer);
    // Only re-evaluate when the gating inputs change.
  }, [walkthroughSeen, hasIncome, categories.length, splashHidden, screenW, screenH, insets.bottom]);

  const finishTour = () => {
    setTourSteps(null);
    markWalkthroughSeen();
  };

  // ─── FAB ───────────────────────────────────────────────────────────────────
  // Opens the FastLogSheet via context. The sheet itself is rendered once at
  // the App root so the same instance shows on Home and Activity.
  const onFabPress = openFastLog;

  const fab = (
    <Pressable
      ref={fabRef}
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
          ref={heroRef}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[3] }}>
              <Pressable
                onPress={togglePrivacyMode}
                accessibilityRole="button"
                accessibilityLabel={privacyMode ? 'Show amounts' : 'Hide amounts'}
                hitSlop={14}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: t.space[1] })}
              >
                {privacyMode ? (
                  <EyeOff size={20} color={t.color.text.secondary} strokeWidth={1.75} />
                ) : (
                  <Eye size={20} color={t.color.text.secondary} strokeWidth={1.75} />
                )}
              </Pressable>
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
            {!hasIncome
              ? 'Set up your budget to get started'
              : today > 0
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

        {!hasIncome ? (
          /* ─── No-income prompt (replaces the wall of ₦0 bars) ────────── */
          <View
            style={{
              marginHorizontal: t.space[4],
              backgroundColor: t.color.bg.elevated,
              borderRadius: t.radii.lg,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: t.color.border.hairline,
              padding: t.space[5],
            }}
          >
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              style={[t.type.title3, { color: t.color.text.primary }]}
            >
              Set up your budget
            </Text>
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              style={[
                t.type.subhead,
                { color: t.color.text.secondary, marginTop: t.space[2], marginBottom: t.space[4] },
              ]}
            >
              Add your income, priorities and savings, and we'll show what's safe
              to spend across your four categories.
            </Text>
            <Button
              variant="primary"
              onPress={() => nav.navigate('AdjustPlan', { focus: 'income' })}
              fullWidth
            >
              Set up budget
            </Button>
          </View>
        ) : (
          /* ─── Category bars ─────────────────────────────────────────── */
          <View
            ref={categoryCardRef}
            style={{
              marginHorizontal: t.space[4],
              backgroundColor: t.color.bg.elevated,
              borderRadius: t.radii.lg,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: t.color.border.hairline,
              overflow: 'hidden',
            }}
          >
            {categories.map((c, idx) => (
              <View key={c.id}>
                <CategoryBar
                  color={c.color}
                  label={c.name}
                  allocated={allocated[c.id] ?? 0}
                  spent={spent[c.id] ?? 0}
                  symbol={symbol}
                  size="compact"
                  onPress={() => nav.navigate('CategoryDetail', { category: c.id })}
                />
                {idx < categories.length - 1 ? (
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
        )}

        {/* When income is fully committed to priorities + savings, the bars
            are all ₦0 — say so plainly rather than leaving it a mystery. */}
        {fullyAllocated ? (
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.footnote,
              {
                color: t.color.text.secondary,
                paddingHorizontal: t.space[4],
                paddingTop: t.space[3],
              },
            ]}
          >
            Your income is fully committed to priorities and savings this month,
            so there's nothing left to split. Adjust your plan to free some up.
          </Text>
        ) : null}

        {/* ─── Your plan summary (income → priorities → savings → budget) ── */}
        {hasIncome ? (
          <Pressable
            onPress={() => nav.navigate('AdjustPlan')}
            accessibilityRole="button"
            accessibilityLabel="View and adjust this month's plan"
            style={({ pressed }) => ({
              marginHorizontal: t.space[4],
              marginTop: t.space[4],
              padding: t.space[4],
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
              <Text
                allowFontScaling
                maxFontSizeMultiplier={t.a11y.maxFontScale}
                style={[
                  t.type.caption2,
                  { color: t.color.text.secondary, textTransform: 'uppercase' },
                ]}
              >
                Your plan
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  allowFontScaling
                  maxFontSizeMultiplier={t.a11y.maxFontScale}
                  style={[
                    t.type.footnote,
                    { color: t.color.brand.base, fontWeight: t.fontWeight.semibold },
                  ]}
                >
                  Adjust
                </Text>
                <ChevronRight size={16} color={t.color.brand.base} strokeWidth={2} />
              </View>
            </View>

            <PlanRow label="Income" value={totalIncome} symbol={symbol} sign="" t={t} />
            <PlanRow label="Priorities" value={totalPriorities} symbol={symbol} sign="−" t={t} />
            <PlanRow label="Savings" value={totalSavings} symbol={symbol} sign="−" t={t} />
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: t.color.border.divider,
                marginVertical: t.space[2],
              }}
            />
            <PlanRow label="To spend this month" value={monthBudget} symbol={symbol} sign="" emphasis t={t} />
          </Pressable>
        ) : null}

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
                    categoryLabel={resolveCategory(categories, tx.categoryId).name}
                    categoryColor={resolveCategory(categories, tx.categoryId).color}
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

      {tourSteps ? <SpotlightTour steps={tourSteps} onFinish={finishTour} /> : null}
    </TabShell>
  );
}

// ─── Plan summary row ────────────────────────────────────────────────────────
// One line of the "Your plan" card: sign + label on the left, amount right.

function PlanRow({
  label,
  value,
  symbol,
  sign,
  emphasis = false,
  t,
}: {
  label: string;
  value: number;
  symbol: string;
  sign: '' | '−';
  emphasis?: boolean;
  t: ReturnType<typeof useTokens>;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: t.space[1],
      }}
    >
      <Text
        allowFontScaling
        maxFontSizeMultiplier={t.a11y.maxFontScale}
        style={[
          emphasis ? t.type.headline : t.type.subhead,
          { color: emphasis ? t.color.text.primary : t.color.text.secondary },
        ]}
      >
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        {sign ? (
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[t.type.subhead, { color: t.color.text.tertiary, marginRight: 2 }]}
          >
            {sign}
          </Text>
        ) : null}
        <AmountDisplay
          value={value}
          symbol={symbol}
          size={emphasis ? 'lg' : 'md'}
          align="right"
          accessibilityLabel=""
        />
      </View>
    </View>
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

