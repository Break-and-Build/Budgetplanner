/**
 * ThemeProvider — exposes design tokens via React context.
 *
 * Follows the OS appearance by default (Settings → Display → Light/Dark).
 * Pass an explicit `colorScheme` to pin a mode (used by tests / previews).
 *
 * Usage:
 *   <ThemeProvider>
 *     <App />
 *   </ThemeProvider>
 *
 *   const t = useTokens();
 *   <View style={{ backgroundColor: t.color.bg.base }} />
 *
 *   const isDark = useIsDark();   // for tint derivation, status bar, etc.
 */

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { tokens, tokensDark } from './tokens';
import type { Tokens } from './tokens';

type ColorScheme = 'light' | 'dark';

interface ThemeProviderProps {
  children: ReactNode;
  /** Omit to follow the system appearance. */
  colorScheme?: ColorScheme;
}

interface ThemeValue {
  tokens: Tokens;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeValue>({ tokens, isDark: false });

export function ThemeProvider({ children, colorScheme }: ThemeProviderProps) {
  const system = useColorScheme();
  // Explicit prop wins; otherwise follow the OS (defaulting to light when the
  // system reports null, which happens on some Android versions).
  const scheme: ColorScheme = colorScheme ?? (system === 'dark' ? 'dark' : 'light');

  const value = useMemo<ThemeValue>(
    () => ({
      tokens: (scheme === 'dark' ? tokensDark : tokens) as Tokens,
      isDark: scheme === 'dark',
    }),
    [scheme],
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
