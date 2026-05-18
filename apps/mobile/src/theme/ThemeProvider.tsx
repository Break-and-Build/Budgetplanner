/**
 * ThemeProvider — exposes design tokens via React context.
 *
 * v1 ships light-only. The provider returns `tokens` (light); the dark swap
 * is wired here so v2 only needs to flip `colorScheme`.
 *
 * Usage:
 *   <ThemeProvider>
 *     <App />
 *   </ThemeProvider>
 *
 *   const t = useTokens();
 *   <View style={{ backgroundColor: t.color.bg.base }} />
 */

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { tokens, tokensDark } from './tokens';
import type { Tokens } from './tokens';

/**
 * Override defaults to opt into dark mode early (v2 / testing). v1 callers
 * leave this at 'light'.
 */
type ColorScheme = 'light' | 'dark';

interface ThemeProviderProps {
  children: ReactNode;
  colorScheme?: ColorScheme;
}

const ThemeContext = createContext<Tokens>(tokens);

export function ThemeProvider({ children, colorScheme = 'light' }: ThemeProviderProps) {
  const value = useMemo<Tokens>(
    () => (colorScheme === 'dark' ? tokensDark : tokens),
    [colorScheme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Read the active design tokens. Tokens are typed — autocomplete the path. */
export function useTokens(): Tokens {
  return useContext(ThemeContext);
}
