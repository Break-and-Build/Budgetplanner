import { requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

/**
 * Pace keys shared with the native widget. The widget treats any unknown
 * value as `onPace`, so adding a new state here is backwards-compatible with
 * widgets installed from an older app version.
 */
export type WidgetPace = 'ahead' | 'onPace' | 'behind' | 'atLimit' | 'needsReview';

export interface WidgetState {
  /** Pre-formatted amount with symbol (e.g. "₦8,400") — the widget just displays. */
  amount: string;
  daysLeft: number;
  pace: WidgetPace;
  needsReview: boolean;
}

interface WidgetBridgeNative {
  setWidgetState(state: WidgetState): void;
}

// Load lazily so Android (no native module) doesn't throw at import time.
let native: WidgetBridgeNative | null = null;
function getNative(): WidgetBridgeNative | null {
  if (Platform.OS !== 'ios') return null;
  if (native) return native;
  try {
    native = requireNativeModule<WidgetBridgeNative>('WidgetBridge');
    return native;
  } catch {
    // Module not linked (e.g. running in Expo Go, or iOS build without
    // the expo-module autolink). No-op so the app still works everywhere else.
    return null;
  }
}

/**
 * Push a widget payload to the shared App Group store and trigger a
 * WidgetKit timeline reload. No-op on Android and in environments where
 * the native module isn't linked.
 */
export function setWidgetState(state: WidgetState): void {
  getNative()?.setWidgetState(state);
}
