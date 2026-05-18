import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Transaction } from '@budgetplanner/core';
import { useTokens } from '../theme/ThemeProvider';
import { AmountDisplay } from './AmountDisplay';
import { CategoryDot } from './CategoryDot';

interface TransactionRowProps {
  transaction: Transaction;
  symbol: string;
  /** Category name lookup. Keeps the row decoupled from the category enum. */
  categoryLabel: string;
  onPress?: () => void;
  /** When true (used inside CategoryDetail), hide the category dot+label. */
  hideCategory?: boolean;
}

/**
 * A single transaction row. Layout: category dot · name + note · time | amount.
 * Same component used in:
 *   • Home recent activity (last 3)
 *   • Activity tab list
 *   • CategoryDetail per-category list (with hideCategory)
 *
 * Tap target spans the full row width × 56pt — well above the 44pt minimum.
 */
export function TransactionRow({
  transaction,
  symbol,
  categoryLabel,
  onPress,
  hideCategory = false,
}: TransactionRowProps) {
  const t = useTokens();
  const time = new Date(transaction.loggedAt).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const a11y = `${symbol}${transaction.amount} in ${categoryLabel}${
    transaction.note ? `, ${transaction.note}` : ''
  } at ${time}`;

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
          category={transaction.categoryId}
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
          {hideCategory ? time : `${categoryLabel} · ${time}`}
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
