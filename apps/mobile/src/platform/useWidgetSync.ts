/**
 * Keeps the iOS Budget Widget in sync with the current budget state.
 *
 * Writes the same safe-to-spend, days-left, and pace values Home shows into
 * the shared App Group so the widget (which runs in a separate process)
 * paints the same numbers the app does. Each write also triggers a
 * WidgetKit timeline reload so the OS repaints promptly.
 *
 * Android is a no-op (the widget bridge is iOS-only); so are Expo Go
 * sessions where the native module isn't autolinked.
 *
 * Mount once at the app root — the hook subscribes to budget state via
 * useBudget() and writes whenever the inputs change.
 */

import { useEffect } from 'react';

import { setWidgetState, type WidgetPace } from '../../modules/widget-bridge';
import { useBudget } from '../state/BudgetContext';
import {
  daysRemainingIn,
  paceStatus,
  todaysSafeToSpend,
} from '../state/selectors';

export function useWidgetSync(): void {
  const { currentMonth, symbol, recurring } = useBudget();

  useEffect(() => {
    const now = new Date();
    const today = todaysSafeToSpend(currentMonth, now, recurring);
    const daysLeft = daysRemainingIn(currentMonth.monthKey, now);
    const needsReview = !!currentMonth.needsReview;
    // When the user hasn't confirmed the month's plan yet, the pace reading
    // isn't meaningful — the "needsReview" pace tells the widget to swap
    // its chip for a Review nudge instead.
    const pace: WidgetPace = needsReview
      ? 'needsReview'
      : paceStatus(currentMonth, now, recurring);

    setWidgetState({
      amount: `${symbol}${today.toLocaleString('en-US')}`,
      daysLeft,
      pace,
      needsReview,
    });
    // currentMonth is a new object reference per month state change, so this
    // covers transactions, plan edits, confirmReview — everything that moves
    // the hero figure. Date rollover (midnight) is handled on next app
    // foreground; a stale widget shows yesterday's number until then, which
    // is fine for v1.2-α.
  }, [currentMonth, symbol, recurring]);
}
