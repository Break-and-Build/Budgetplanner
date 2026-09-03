import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useIsDark, useTokens } from '../theme/ThemeProvider';
import { categoryTint } from '../theme/categoryColor';
import { useReducedMotion } from '../theme/useReducedMotion';
import { AmountDisplay } from './AmountDisplay';

interface HomeCategoryRowProps {
  color: string;
  label: string;
  allocated: number;
  spent: number;
  symbol: string;
  onPress?: () => void;
}

/**
 * Home's scan-first category row. Icon-circle · label · big remaining amount
 * on the right, thin fill bar underneath. The right column is the primary
 * read; the label recedes. Over-budget uses the same red treatment as
 * CategoryBar so both surfaces stay consistent.
 */
export function HomeCategoryRow({
  color,
  label,
  allocated,
  spent,
  symbol,
  onPress,
}: HomeCategoryRowProps) {
  const t = useTokens();
  const isDark = useIsDark();
  const tint = categoryTint(color, isDark);
  const { multiplier } = useReducedMotion();

  const remaining = allocated - spent;
  const over = remaining < 0;
  const ratio = allocated > 0 ? Math.min(1, spent / allocated) : 0;
  const initial = (label.trim()[0] ?? '?').toUpperCase();

  const widthAnim = useRef(new Animated.Value(ratio)).current;
  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: ratio,
      duration: t.motion.duration.slow * multiplier,
      easing: Easing.bezier(...t.motion.easing.spring),
      useNativeDriver: false,
    }).start();
  }, [ratio, multiplier, t.motion.duration.slow, t.motion.easing.spring, widthAnim]);

  const a11y = useMemo(
    () =>
      `${label}, ${symbol}${allocated.toLocaleString('en-US')} allocated, ` +
      (over
        ? `over budget by ${symbol}${Math.abs(remaining).toLocaleString('en-US')}`
        : `${symbol}${remaining.toLocaleString('en-US')} left`),
    [label, allocated, remaining, over, symbol],
  );

  const Container = onPress ? Pressable : View;

  return (
    <Container
      {...(onPress
        ? {
            onPress,
            accessibilityRole: 'button' as const,
            accessibilityLabel: a11y,
            style: ({ pressed }: { pressed: boolean }) => [
              styles.row,
              {
                paddingHorizontal: t.space[4] + 2,
                paddingVertical: t.space[3] + 2,
                backgroundColor: pressed ? t.color.bg.sunken : 'transparent',
              },
            ],
          }
        : {
            accessible: true,
            accessibilityLabel: a11y,
            style: [
              styles.row,
              {
                paddingHorizontal: t.space[4] + 2,
                paddingVertical: t.space[3] + 2,
              },
            ],
          })}
    >
      <View style={styles.topLine}>
        {/* Icon circle: category-tinted background, single letter in accent */}
        <View style={styles.leftGroup}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: tint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: t.fontFamily.semibold,
                fontSize: 13,
                lineHeight: 16,
                color,
              }}
            >
              {initial}
            </Text>
          </View>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={{
              fontFamily: t.fontFamily.medium,
              fontSize: 14,
              lineHeight: 20,
              color: t.color.text.secondary,
              marginLeft: t.space[3],
            }}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>

        {/* Big remaining amount, right-aligned. Same X across all rows — that's
            the scan column. */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <AmountDisplay
            value={Math.abs(remaining)}
            symbol={symbol}
            size="lg"
            color={over ? t.color.status.overBudget : t.color.text.primary}
            align="right"
            accessibilityLabel=""
          />
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={{
              fontFamily: t.fontFamily.regular,
              fontSize: 12,
              lineHeight: 16,
              color: over ? t.color.status.overBudget : t.color.text.tertiary,
              marginLeft: 4,
            }}
          >
            {over ? 'over' : 'left'}
          </Text>
        </View>
      </View>

      {/* Thin bar. Same fill semantics as CategoryBar. */}
      <View
        style={{
          height: 5,
          borderRadius: 3,
          backgroundColor: tint,
          marginTop: t.space[2] + 2,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            borderRadius: 3,
            backgroundColor: color,
            width: widthAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {},
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
});
