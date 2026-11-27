/**
 * Android widget task handler — Android calls this from a headless-JS
 * context whenever a widget event happens (added, update, resized, click).
 * The handler reads the latest payload from AsyncStorage (written by
 * useWidgetSync on the main app side) and asks the OS to render the
 * widget with that data.
 *
 * iOS doesn't use this flow at all — it goes through the Expo Module
 * bridge to UserDefaults. The handler is deliberately Android-only.
 */

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type WidgetTaskHandlerProps,
} from 'react-native-android-widget';

import type { WidgetPace, WidgetState } from '../../../modules/widget-bridge';
import { BudgetAndroidWidget } from './BudgetAndroidWidget';

/**
 * Shared AsyncStorage key for the widget's cached payload. Writer is
 * useWidgetSync; readers are this handler and (on first-launch render)
 * the request-widget-update caller.
 */
export const ANDROID_WIDGET_STATE_KEY = '@budget-tracker/widget-state';

/** Fallback payload shown before the main app has written one. */
const FALLBACK: WidgetState = {
  amount: '—',
  daysLeft: 0,
  pace: 'onPace',
  needsReview: false,
};

/** Read the cached widget state from AsyncStorage. Falls back on any error. */
export async function readAndroidWidgetState(): Promise<WidgetState> {
  try {
    const raw = await AsyncStorage.getItem(ANDROID_WIDGET_STATE_KEY);
    if (!raw) return FALLBACK;
    const parsed = JSON.parse(raw) as Partial<WidgetState>;
    return {
      amount: typeof parsed.amount === 'string' ? parsed.amount : FALLBACK.amount,
      daysLeft: typeof parsed.daysLeft === 'number' ? parsed.daysLeft : FALLBACK.daysLeft,
      pace: isPace(parsed.pace) ? parsed.pace : FALLBACK.pace,
      needsReview: !!parsed.needsReview,
    };
  } catch {
    return FALLBACK;
  }
}

/** Write the widget's cached payload. Called by useWidgetSync on Android. */
export async function writeAndroidWidgetState(state: WidgetState): Promise<void> {
  try {
    await AsyncStorage.setItem(ANDROID_WIDGET_STATE_KEY, JSON.stringify(state));
  } catch {
    // Non-fatal — next successful write replaces the stale cache.
  }
}

function isPace(value: unknown): value is WidgetPace {
  return (
    value === 'ahead' ||
    value === 'onPace' ||
    value === 'behind' ||
    value === 'atLimit' ||
    value === 'needsReview'
  );
}

/**
 * The handler itself. Must be a pure async function — Android calls it in a
 * short-lived headless context.
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  const { widgetAction, widgetInfo, renderWidget } = props;

  // The lib fires this for every lifecycle event; we render for the three
  // that produce a visible widget frame. DELETED/CLICK don't need a render.
  if (
    widgetAction !== 'WIDGET_ADDED' &&
    widgetAction !== 'WIDGET_UPDATE' &&
    widgetAction !== 'WIDGET_RESIZED'
  ) {
    return;
  }

  const state = await readAndroidWidgetState();
  renderWidget(
    <BudgetAndroidWidget
      amount={state.amount}
      daysLeft={state.daysLeft}
      pace={state.pace}
      needsReview={state.needsReview}
      info={widgetInfo}
    />,
  );
}
