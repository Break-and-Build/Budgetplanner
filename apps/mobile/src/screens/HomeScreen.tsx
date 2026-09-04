/**
 * HomeScreen — the center of gravity.
 *
 * Anchored on the question "Can I spend right now?" Hierarchy from top:
 *
 *   1. Top row: date + circular icon buttons (eye, gear)
 *   2. Dark hero card: pace chip + big safe-to-spend + context line
 *   3. Four category rows: numbers-first scan
 *   4. Compressed plan row (single line, tap to adjust)
 *   5. Recent activity — avatar-badged rows
 *
 * Month-close banner still appears above (3) when triggered. The "+" FAB
 * belongs to the TabShell, not this screen.
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
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  Minus,
  Plus,
  Settings as SettingsIcon,
  X as XIcon,
} from 'lucide-react-native';
import { shouldShowMonthCloseBanner } from '@budgetplanner/core';

import { useIsDark, useTokens } from '../theme/ThemeProvider';
import { TabShell } from '../components/TabShell';
import { AmountDisplay } from '../components/AmountDisplay';
import { HomeCategoryRow } from '../components/HomeCategoryRow';
import { SpotlightTour, type SpotlightStep } from '../components/SpotlightTour';
import { TransactionRow } from '../components/TransactionRow';
import { Button } from '../components/ui/Button';
import { useBudget } from '../state/BudgetContext';
import { resolveCategory } from '../state/categories';
import {
  allocatedByCategory,
  daysRemainingIn,
  monthRemaining,
  monthSafeToSpend,
  paceStatus,
  recentTransactions,
  spentByCategory,
  todaysSafeToSpend,
} from '../state/selectors';
import type { RootStackParamList, MainTabsParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList> &
  BottomTabNavigationProp<MainTabsParamList>;

// Hero-card ground. Kept out of tokens because it's a one-off premium surface
// with mode-specific colour needs: charcoal-on-cream in light, brand-tinted
// dark on near-black in dark. Text is cream in both.
const HERO_BG_LIGHT = '#15151A';
const HERO_BG_DARK = '#26224A';
const HERO_TEXT = '#FAFAF7';
const HERO_TEXT_MUTED = 'rgba(250, 250, 247, 0.72)';
const HERO_TEXT_DIM = 'rgba(250, 250, 247, 0.55)';

// Pace-chip colours — sit on the dark hero bg, need enough saturation to read.
const PACE_STYLES: Record<
  'ahead' | 'onPace' | 'behind' | 'atLimit',
  { bg: string; fg: string; label: string; iconDir: 'up' | 'flat' | 'down' | 'stop' }
> = {
  ahead: { bg: 'rgba(140, 205, 155, 0.22)', fg: '#B9E4C3', label: 'Ahead of pace', iconDir: 'up' },
  onPace: { bg: 'rgba(250, 250, 247, 0.14)', fg: '#F2F2F4', label: 'On pace', iconDir: 'flat' },
  behind: { bg: 'rgba(228, 178, 106, 0.20)', fg: '#E4B26A', label: 'Behind pace', iconDir: 'down' },
  atLimit: { bg: 'rgba(224, 122, 122, 0.20)', fg: '#E07A7A', label: 'At today’s limit', iconDir: 'stop' },
};

export function HomeScreen() {
  const t = useTokens();
  const isDark = useIsDark();
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
  const remainingThisMonth = Math.max(0, monthRemaining(currentMonth));
  const pace = paceStatus(currentMonth, now);
  const allocated = useMemo(() => allocatedByCategory(currentMonth.plan), [currentMonth.plan]);
  const spent = useMemo(() => spentByCategory(currentMonth), [currentMonth]);
  const recent = useMemo(() => recentTransactions(currentMonth, 3), [currentMonth]);
  const categories = currentMonth.plan.categories;
  const monthBudget = useMemo(() => monthSafeToSpend(currentMonth.plan), [currentMonth.plan]);
  const hasIncome = monthBudget > 0 || currentMonth.plan.income.length > 0;
  const fullyAllocated = currentMonth.plan.income.length > 0 && monthBudget === 0;

  // Human-readable date for the top row.
  const dateLine = useMemo(
    () => ({
      weekday: now.toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase(),
      day: now.toLocaleDateString(undefined, { day: 'numeric', month: 'long' }),
    }),
    // now is recreated each render; date parts only change at midnight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentMonth.monthKey, new Date().getDate()],
  );

  // ─── First-run spotlight tour ──────────────────────────────────────────────
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
                body: 'Each row shows what’s left in a category this month. Tap one for detail.',
              },
              {
                rect: { x: fx, y: fy, width: fw, height: fh },
                title: 'Log a spend',
                body: 'Tap + to log a purchase in seconds — amount, category, done.',
              },
            ]);
          if (fabRef.current) {
            fabRef.current.measureInWindow(build);
          } else {
            build(screenW - 88, screenH - insets.bottom - 132, 64, 64);
          }
        });
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [walkthroughSeen, hasIncome, categories.length, splashHidden, screenW, screenH, insets.bottom]);

  const finishTour = () => {
    setTourSteps(null);
    markWalkthroughSeen();
  };

  // ─── FAB ───────────────────────────────────────────────────────────────────
  const fab = (
    <Pressable
      ref={fabRef}
      onPress={openFastLog}
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

  const paceStyle = PACE_STYLES[pace];

  return (
    <TabShell fab={fab}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: t.space[11] }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Top row: date + circular icon buttons ────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: t.space[4],
            paddingTop: t.space[3],
            paddingBottom: t.space[2],
          }}
        >
          <View>
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              style={[t.type.caption2, { color: t.color.text.tertiary }]}
            >
              {dateLine.weekday}
            </Text>
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              style={{
                fontFamily: t.fontFamily.semibold,
                fontSize: 15,
                lineHeight: 20,
                color: t.color.text.primary,
                marginTop: 1,
              }}
            >
              {dateLine.day}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[2] }}>
            <CircleIconButton
              accessibilityLabel={privacyMode ? 'Show amounts' : 'Hide amounts'}
              onPress={togglePrivacyMode}
            >
              {privacyMode ? (
                <EyeOff size={18} color={t.color.text.secondary} strokeWidth={1.75} />
              ) : (
                <Eye size={18} color={t.color.text.secondary} strokeWidth={1.75} />
              )}
            </CircleIconButton>
            <CircleIconButton
              accessibilityLabel="Open settings"
              onPress={() => nav.navigate('Settings')}
            >
              <SettingsIcon size={18} color={t.color.text.secondary} strokeWidth={1.75} />
            </CircleIconButton>
          </View>
        </View>

        {/* ─── Dark hero card ───────────────────────────────────────────── */}
        <View
          ref={heroRef}
          accessible
          accessibilityLabel={
            today > 0
              ? `${symbol}${today.toLocaleString('en-US')} left to spend today, ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} to go. ${paceStyle.label}.`
              : `Nothing left to spend today, ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} to go.`
          }
          style={{
            marginHorizontal: t.space[4],
            marginTop: t.space[3],
            marginBottom: t.space[4],
            paddingHorizontal: t.space[5],
            paddingTop: t.space[5] + 2,
            paddingBottom: t.space[5],
            backgroundColor: isDark ? HERO_BG_DARK : HERO_BG_LIGHT,
            borderRadius: 22,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: t.space[1],
            }}
          >
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              style={{
                fontFamily: t.fontFamily.medium,
                fontSize: 11,
                lineHeight: 16,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: HERO_TEXT_DIM,
              }}
            >
              Safe to spend today
            </Text>
            {hasIncome ? <PaceChip pace={pace} tokens={t} /> : null}
          </View>
          <AmountDisplay
            value={today}
            symbol={symbol}
            size="hero"
            color={HERO_TEXT}
            align="left"
            accessibilityLabel=""
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.space[3] + 2,
              marginTop: t.space[1] + 2,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CalendarIcon size={14} color={HERO_TEXT_MUTED} strokeWidth={1.75} />
              <Text
                allowFontScaling
                maxFontSizeMultiplier={t.a11y.maxFontScale}
                style={{
                  fontFamily: t.fontFamily.regular,
                  fontSize: 13,
                  lineHeight: 20,
                  color: HERO_TEXT_MUTED,
                }}
              >
                {!hasIncome
                  ? 'Set up your budget'
                  : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
              </Text>
            </View>
            {hasIncome ? (
              <>
                <View
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: 'rgba(250, 250, 247, 0.3)',
                  }}
                />
                <Text
                  allowFontScaling
                  maxFontSizeMultiplier={t.a11y.maxFontScale}
                  style={{
                    fontFamily: t.fontFamily.regular,
                    fontSize: 13,
                    lineHeight: 20,
                    color: HERO_TEXT_MUTED,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {symbol}{remainingThisMonth.toLocaleString('en-US')} remaining
                </Text>
              </>
            ) : null}
          </View>
        </View>

        {/* ─── Month-close banner (unchanged) ───────────────────────────── */}
        {bannerVisible ? (
          <View
            style={{
              marginHorizontal: t.space[4],
              marginBottom: t.space[4],
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
                  style={[t.type.headline, { color: t.color.text.primary }]}
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
                    { color: t.color.text.secondary, marginTop: t.space[1] },
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
                  <XIcon size={18} color={t.color.text.tertiary} strokeWidth={1.75} />
                </Pressable>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', gap: t.space[3], marginTop: t.space[4] }}>
              {!overdue ? (
                <View style={{ flex: 1 }}>
                  <Button variant="secondary" onPress={dismissMonthCloseBanner} fullWidth>
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
          /* ─── No-income prompt ─────────────────────────────────────────── */
          <View
            style={{
              marginHorizontal: t.space[4],
              backgroundColor: t.color.bg.elevated,
              borderRadius: t.radii.lg,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: t.color.border.card,
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
              to spend across your categories.
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
          /* ─── Scan-first category card ─────────────────────────────────── */
          <View
            ref={categoryCardRef}
            style={{
              marginHorizontal: t.space[4],
              backgroundColor: t.color.bg.elevated,
              borderRadius: 20,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: t.color.border.card,
              overflow: 'hidden',
            }}
          >
            {categories.map((c, idx) => (
              <View key={c.id}>
                <HomeCategoryRow
                  color={c.color}
                  label={c.name}
                  allocated={allocated[c.id] ?? 0}
                  spent={spent[c.id] ?? 0}
                  symbol={symbol}
                  onPress={() => nav.navigate('CategoryDetail', { category: c.id })}
                />
                {idx < categories.length - 1 ? (
                  <View
                    style={{
                      height: StyleSheet.hairlineWidth,
                      backgroundColor: t.color.border.hairline,
                      marginLeft: t.space[4] + 2,
                    }}
                  />
                ) : null}
              </View>
            ))}
          </View>
        )}

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

        {/* ─── Compressed plan row ─────────────────────────────────────── */}
        {hasIncome ? (
          <Pressable
            onPress={() => nav.navigate('AdjustPlan')}
            accessibilityRole="button"
            accessibilityLabel={`Adjust plan. This month, ${symbol}${monthBudget.toLocaleString('en-US')} to spend.`}
            style={({ pressed }) => ({
              marginHorizontal: t.space[4],
              marginTop: t.space[3],
              paddingHorizontal: t.space[4] + 2,
              paddingVertical: t.space[3],
              backgroundColor: pressed ? t.color.bg.sunken : t.color.bg.elevated,
              borderRadius: 16,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: t.color.border.card,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                allowFontScaling
                maxFontSizeMultiplier={t.a11y.maxFontScale}
                style={[
                  t.type.caption2,
                  { color: t.color.text.tertiary, textTransform: 'uppercase' },
                ]}
              >
                This month
              </Text>
              <Text
                allowFontScaling
                maxFontSizeMultiplier={t.a11y.maxFontScale}
                style={{
                  fontFamily: t.fontFamily.semibold,
                  fontSize: 15,
                  lineHeight: 20,
                  color: t.color.text.primary,
                  marginTop: 1,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {symbol}{monthBudget.toLocaleString('en-US')} to spend
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Text
                allowFontScaling
                maxFontSizeMultiplier={t.a11y.maxFontScale}
                style={[
                  t.type.footnote,
                  { color: t.color.brand.base, fontWeight: t.fontWeight.semibold },
                ]}
              >
                Adjust plan
              </Text>
              <ChevronRight size={15} color={t.color.brand.base} strokeWidth={2.25} />
            </View>
          </Pressable>
        ) : null}

        {/* ─── Recent activity: avatar-badged rows ───────────────────────── */}
        <View style={{ marginTop: t.space[6] }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              paddingHorizontal: t.space[4] + 4,
              marginBottom: t.space[2] + 2,
            }}
          >
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              style={[
                t.type.caption2,
                { color: t.color.text.tertiary, textTransform: 'uppercase' },
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
                    { color: t.color.brand.base, fontWeight: t.fontWeight.semibold },
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
                borderRadius: 20,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: t.color.border.card,
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
                    badgeStyle="avatar"
                  />
                  {idx < recent.length - 1 ? (
                    <View
                      style={{
                        height: StyleSheet.hairlineWidth,
                        backgroundColor: t.color.border.hairline,
                        // Indent past row padding (16) + avatar (40) + gap (12) = 68
                        marginLeft: t.space[4] + 40 + t.space[3],
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

// ─── Small building blocks ───────────────────────────────────────────────────

function CircleIconButton({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
}) {
  const t = useTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={({ pressed }) => ({
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: t.color.bg.elevated,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: t.color.border.card,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.55 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

function PaceChip({
  pace,
  tokens,
}: {
  pace: 'ahead' | 'onPace' | 'behind' | 'atLimit';
  tokens: ReturnType<typeof useTokens>;
}) {
  const s = PACE_STYLES[pace];
  const Icon =
    s.iconDir === 'up' ? ChevronUp :
    s.iconDir === 'down' ? ChevronRight : // rotated below
    s.iconDir === 'flat' ? Minus :
    XIcon;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingLeft: 8,
        paddingRight: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: s.bg,
      }}
    >
      <Icon
        size={12}
        color={s.fg}
        strokeWidth={2.5}
        // The behind-pace arrow is a ChevronRight rotated 90° down.
        style={s.iconDir === 'down' ? { transform: [{ rotate: '90deg' }] } : undefined}
      />
      <Text
        allowFontScaling
        maxFontSizeMultiplier={tokens.a11y.maxFontScale}
        style={{
          fontFamily: tokens.fontFamily.semibold,
          fontSize: 11,
          lineHeight: 14,
          color: s.fg,
          letterSpacing: 0.2,
        }}
      >
        {s.label}
      </Text>
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
