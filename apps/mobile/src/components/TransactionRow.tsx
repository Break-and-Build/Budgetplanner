import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Transaction } from '@budgetplanner/core';
import { useTokens } from '../theme/ThemeProvider';
import { AmountDisplay } from './AmountDisplay';
import { CategoryDot } from './CategoryDot';

interface TransactionRowProps {
  transaction: Transaction;
  symbol: string;
  /** Category name lookup. Keeps the row decoupled from the category list. */
  categoryLabel: string;
  /** Category accent colour (hex) for the dot. */
  categoryColor: string;
  onPress?: () => void;
  /** When true (used inside CategoryDetail), hide the category dot+label. */
  hideCategory?: boolean;
  /**
   * When true, only the time is shown in the meta line — used by screens that
   * already group rows under a day header (Activity, CategoryDetail). On Home
   * there's no grouping, so the date qualifier is what makes the list scannable.
   */
  hideDate?: boolean;
}

/**
 * A single transaction row. Layout: category dot · name + note · time | amount.
 * Same component used in:
 *   • Home recent activity (shows relative date: "Today", "Yesterday", "12 Aug")
 *   • Activity tab list (hideDate — DayHeader owns the grouping)
 *   • CategoryDetail per-category list (hideCategory + hideDate)
 *
 * Tap target spans the full row width × 56pt — well above the 44pt minimum.
 */
export function TransactionRow({
  transaction,
  symbol,
  categoryLabel,
  categoryColor,
  onPress,
  hideCategory = false,
  hideDate = false,
}: TransactionRowProps) {
  const t = useTokens();
  const logged = new Date(transaction.loggedAt);
  const time = logged.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  const dateLabel = hideDate ? '' : formatRelativeDate(logged);
  // Compose the meta line. When both category + date are shown, both get their
  // own delimiter so the row reads: "Category · 19:31 · Today"
  const meta = [
    hideCategory ? null : categoryLabel,
    time + (dateLabel ? ` ${dateLabel}` : ''),
  ]
    .filter(Boolean)
    .join(' · ');

  const a11y = `${symbol}${transaction.amount} in ${categoryLabel}${
    transaction.note ? `, ${transaction.note}` : ''
  } at ${time}${dateLabel ? ' ' + dateLabel : ''}`;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={a11y}
      style={({ pressed }) => [
        styles.row,
        {
          paddingHorizontal: t.space[4],
          paddingVertical: t.space[3],
          minHeight: 56,
          backgroundColor: pressed ? t.color.bg.sunken : 'transparent',
        },
      ]}
    >
      {!hideCategory ? (
        <CategoryDot
          color={categoryColor}
          style={{ marginRight: t.space[3] }}
        />
      ) : null}

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[t.type.body, { color: t.color.text.primary }]}
          numberOfLines={1}
        >
          {transaction.note?.trim() || categoryLabel}
        </Text>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.footnote,
            { color: t.color.text.secondary, marginTop: 2 },
          ]}
          numberOfLines={1}
        >
          {meta}
        </Text>
      </View>

      <AmountDisplay
        value={transaction.amount}
        symbol={symbol}
        size="md"
        align="right"
        accessibilityLabel="" // outer row provides full label
      />
    </Pressable>
  );
}

/**
 * "Today", "Yesterday", or "12 Aug" for anything older than yesterday.
 * Compares calendar days in the device's local time (not UTC) so a spend at
 * 23:59 last night doesn't look like it happened today.
 */
function formatRelativeDate(d: Date, now: Date = new Date()): string {
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.round((today - day) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
