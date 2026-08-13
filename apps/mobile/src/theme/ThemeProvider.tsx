/**
 * ThemeProvider — exposes design tokens via React context.
 *
 * Resolves the active theme in this order:
 *   1. Explicit `colorScheme` prop (tests / previews).
 *   2. User preference stored in AsyncStorage (`theme.preference`):
 *      'system' (default) | 'light' | 'dark'.
 *   3. If preference is 'system', follows `useColorScheme()`.
 *
 * The preference lives here rather than in the budget blob because it's a
 * UI preference, not budget state — this keeps ThemeProvider outside of
 * BudgetProvider (which uses `useTokens` transitively) and avoids a cycle.
 *
 * Usage:
 *   const t = useTokens();
 *   const isDark = useIsDark();
 *   const { preference, setPreference } = useThemePreference();
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokens, tokensDark } from './tokens';
import type { Tokens } from './tokens';

type ColorScheme = 'light' | 'dark';
export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme.preference';
const VALID_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

interface ThemeProviderProps {
  children: ReactNode;
  /** Omit to follow the stored preference (or the OS if it's 'system'). */
  colorScheme?: ColorScheme;
}

interface ThemeValue {
  tokens: Tokens;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeValue>({
  tokens,
  isDark: false,
  preference: 'system',
  setPreference: () => {},
});

export function ThemeProvider({ children, colorScheme }: ThemeProviderProps) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  // Hydrate the stored preference on mount. AsyncStorage is fast (~<50ms), so
  // any early paint using the default 'system' is fine — the flip after
  // hydration is imperceptible in practice.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (cancelled) return;
        if (v && (VALID_PREFERENCES as readonly string[]).includes(v)) {
          setPreferenceState(v as ThemePreference);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  // Resolve the active scheme: explicit prop > preference > OS.
  const resolved: ColorScheme = colorScheme
    ?? (preference === 'system'
      ? (system === 'dark' ? 'dark' : 'light')
      : preference);

  const value = useMemo<ThemeValue>(
    () => ({
      tokens: (resolved === 'dark' ? tokensDark : tokens) as Tokens,
      isDark: resolved === 'dark',
      preference,
      setPreference,
    }),
    [resolved, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Read the active design tokens. Tokens are typed — autocomplete the path. */
export function useTokens(): Tokens {
  return useContext(ThemeContext).tokens;
}

/** True when the dark palette is active. */
export function useIsDark(): boolean {
  return useContext(ThemeContext).isDark;
}

/** Read and change the user's theme preference. */
export function useThemePreference(): {
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
} {
  const { preference, setPreference } = useContext(ThemeContext);
  return { preference, setPreference };
}
