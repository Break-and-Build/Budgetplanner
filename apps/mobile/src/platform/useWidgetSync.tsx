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
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';

import {
  setWidgetState,
  type WidgetPace,
  type WidgetState,
} from '../../modules/widget-bridge';
import { useBudget } from '../state/BudgetContext';
import {
  daysRemainingIn,
  paceStatus,
  todaysSafeToSpend,
} from '../state/selectors';
import { BudgetAndroidWidget } from '../widgets/android/BudgetAndroidWidget';
import { writeAndroidWidgetState } from '../widgets/android/widgetTaskHandler';

/**
 * Push the latest widget payload to the right platform channel. iOS writes
 * to the shared App Group and asks WidgetKit to reload timelines; Android
 * persists to AsyncStorage (so the task handler can read it next tick) and
 * asks the OS to re-render every mounted widget right now.
 */
function pushWidgetState(state: WidgetState): void {
  if (Platform.OS === 'ios') {
    setWidgetState(state);
    return;
  }
  if (Platform.OS === 'android') {
    // Fire-and-forget. Both calls fail silently — a stale widget on a
    // failed write is a non-blocking visual nit, not a correctness issue.
    void writeAndroidWidgetState(state);
    void requestWidgetUpdate({
      widgetName: 'BudgetWidget',
      renderWidget: (info) => (
        <BudgetAndroidWidget
          amount={state.amount}
          daysLeft={state.daysLeft}
          pace={state.pace}
          needsReview={state.needsReview}
          info={info}
        />
      ),
      // User hasn't added the widget yet — nothing to render, just move on.
      widgetNotFound: () => {},
    });
  }
}

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

    pushWidgetState({
      amount: `${symbol}${today.toLocaleString('en-US')}`,
      daysLeft,
      pace,
      needsReview,
    });
    // currentMonth is a new object reference per month state change, so this
    // covers transactions, plan edits, confirmReview — everything that moves
    // the hero figure. Date rollover (midnight) is handled on next app
    // foreground; a stale widget shows yesterday's number until then, which
    // is fine for v1.2.
  }, [currentMonth, symbol, recurring]);
}
