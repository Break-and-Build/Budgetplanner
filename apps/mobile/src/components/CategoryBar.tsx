import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CategoryId } from '@budgetplanner/core';
import { useTokens } from '../theme/ThemeProvider';
import { useReducedMotion } from '../theme/useReducedMotion';
import { AmountDisplay } from './AmountDisplay';
import { CategoryDot } from './CategoryDot';

interface CategoryBarProps {
  category: CategoryId;
  /** Category display name. Kept external so copy is consistent with IA. */
  label: string;
  allocated: number;
  spent: number;
  symbol: string;
  /** "compact" used on Home (4 stacked). "expanded" used as CategoryDetail header. */
  size?: 'compact' | 'expanded';
  onPress?: () => void;
}

/**
 * The plan-vs-actual bar. Fill animates with the spring easing on change.
 * Over-budget treatment: fill is clamped to 100% width and a red caption
 * appears below the bar — no modal interruption, no "are you sure".
 *
 * The bar's *fill color* is the category accent; the bar's *track color*
 * is the category tint (same hue at ~92% L). Both come from tokens.
 */
export function CategoryBar({
  category,
  label,
  allocated,
  spent,
  symbol,
  size = 'compact',
  onPress,
}: CategoryBarProps) {
  const t = useTokens();
  const { multiplier } = useReducedMotion();

  const remaining = allocated - spent;
  const over = remaining < 0;
  const safeRatio = allocated > 0 ? Math.min(1, spent / allocated) : 0;

  // Animated width fraction 0..1
  const widthAnim = useRef(new Animated.Value(safeRatio)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: safeRatio,
      duration: t.motion.duration.slow * multiplier,
      easing: Easing.bezier(...t.motion.easing.spring),
      useNativeDriver: false, // width animation requires layout
    }).start();
  }, [safeRatio, multiplier, t.motion.duration.slow, t.motion.easing.spring, widthAnim]);

  const barHeight = size === 'compact' ? 8 : 12;

  const accessibilityLabel = useMemo(
    () =>
      `${label}, allocated ${symbol}${allocated.toLocaleString('en-US')}, ` +
      `spent ${symbol}${spent.toLocaleString('en-US')}, ` +
      (over
        ? `over budget by ${symbol}${Math.abs(remaining).toLocaleString('en-US')}`
        : `${symbol}${remaining.toLocaleString('en-US')} remaining`),
    [label, symbol, allocated, spent, remaining, over],
  );

  const Container = onPress ? Pressable : View;

  return (
    <Container
      {...(onPress
        ? {
            onPress,
            accessibilityRole: 'button' as const,
            accessibilityLabel,
            style: ({ pressed }: { pressed: boolean }) => [
              styles.container,
              {
                paddingVertical: size === 'compact' ? t.space[3] : t.space[4],
                paddingHorizontal: t.space[4],
                backgroundColor: pressed ? t.color.bg.sunken : 'transparent',
              },
            ],
          }
        : {
            accessible: true,
            accessibilityLabel,
            style: [
              styles.container,
              {
                paddingVertical: size === 'compact' ? t.space[3] : t.space[4],
                paddingHorizontal: t.space[4],
              },
            ],
          })}
    >
      {/* Top row: dot + label · remaining amount */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <CategoryDot category={category} style={{ marginRight: t.space[2] }} />
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              size === 'compact' ? t.type.headline : t.type.title3,
              { color: t.color.text.primary },
            ]}
          >
            {label}
          </Text>
        </View>
        <AmountDisplay
          value={Math.abs(remaining)}
          symbol={symbol}
          size={size === 'compact' ? 'md' : 'lg'}
          color={over ? t.color.status.overBudget : t.color.text.primary}
          align="right"
          accessibilityLabel=""
        />
      </View>

      {/* Bar track + fill */}
      <View
        style={[
          styles.track,
          {
            height: barHeight,
            backgroundColor: t.color.category[category].tint,
            borderRadius: barHeight / 2,
            marginTop: t.space[2],
          },
        ]}
      >
        <Animated.View
          style={{
            height: '100%',
            borderRadius: barHeight / 2,
            backgroundColor: t.color.category[category].base,
            width: widthAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>

      {/* Caption: spent / allocated, or "₦X over" */}
      <View style={[styles.captionRow, { marginTop: t.space[1] }]}>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[t.type.footnote, { color: t.color.text.secondary }]}
        >
          {symbol}
          {spent.toLocaleString('en-US')} of {symbol}
          {allocated.toLocaleString('en-US')}
        </Text>
        {over ? (
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.footnote,
              {
                color: t.color.status.overBudget,
                fontWeight: t.fontWeight.medium,
              },
            ]}
          >
            {symbol}
            {Math.abs(remaining).toLocaleString('en-US')} over
          </Text>
        ) : null}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
