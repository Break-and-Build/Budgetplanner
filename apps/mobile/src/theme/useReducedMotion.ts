/**
 * Reduce-Motion bridge.
 *
 * Returns a `multiplier`:
 *   1  → motion enabled (normal durations)
 *   0  → motion reduced (instant transitions)
 *
 * Components multiply durations by this. The `0` value relies on the renderer
 * skipping zero-duration animations (Animated.timing with `duration: 0` is
 * effectively a setValue).
 */

import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useTokens } from './ThemeProvider';

export function useReducedMotion(): { reduced: boolean; multiplier: 0 | 1 } {
  const tokens = useTokens();
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (!cancelled) setReduced(v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v: boolean) =>
      setReduced(v),
    );
    return () => {
      cancelled = true;
      sub?.remove?.();
    };
  }, []);

  // Tokens carry `0` as the configured multiplier; we treat any non-1 as "reduced".
  // This indirection lets us experiment with `0.5` (half-speed) later via the token.
  const multiplier = reduced ? (tokens.a11y.reduceMotionDurationMultiplier as 0 | 1) : 1;
  return { reduced, multiplier };
}

/** Scale a token duration through the user's reduce-motion preference. */
export function useScaledDuration(durationMs: number): number {
  const { multiplier } = useReducedMotion();
  return durationMs * multiplier;
}
