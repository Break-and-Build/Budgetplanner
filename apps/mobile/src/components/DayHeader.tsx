import React from 'react';
import { Text, View } from 'react-native';
import { useTokens } from '../theme/ThemeProvider';

interface DayHeaderProps {
  /** ISO date string or Date. */
  date: string | Date;
  /** Reference date for the relative comparisons. Defaults to today. */
  now?: Date;
}

/**
 * Section header for a list grouped by day.
 *
 *  • Same day as `now`              → "Today"
 *  • Day before `now`               → "Yesterday"
 *  • Within the prior 7 days        → "Wed" / "Thu" / ...
 *  • Older                          → "May 3" or "May 3, 2024" if past year
 *
 * Uppercase tracked caption, hairline divider below — matches Apple-Wallet's
 * section headers on the transactions screen.
 */
export function DayHeader({ date, now = new Date() }: DayHeaderProps) {
  const t = useTokens();
  const d = typeof date === 'string' ? new Date(date) : date;

  const label = formatDayLabel(d, now);

  return (
    <View
      style={{
        paddingTop: t.space[5],
        paddingBottom: t.space[2],
        paddingHorizontal: t.space[4],
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
        {label}
      </Text>
    </View>
  );
}

function formatDayLabel(d: Date, now: Date): string {
  if (isSameDay(d, now)) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) return 'Yesterday';

  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays >= 0 && diffDays <= 7) {
    return d.toLocaleDateString(undefined, { weekday: 'short' });
  }

  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
