/**
 * Theme barrel — single entry point for all visual tokens.
 *
 * Usage:
 *   import { useTokens } from '@/theme';
 *   const t = useTokens();
 *   <View style={{ backgroundColor: t.color.bg.base, padding: t.space[4] }} />
 */

export { tokens, tokensDark } from './tokens';
export type { Tokens, CategoryId } from './tokens';
export {
  ThemeProvider,
  useTokens,
  useIsDark,
  useThemePreference,
} from './ThemeProvider';
export type { ThemePreference } from './ThemeProvider';
export { useReducedMotion, useScaledDuration } from './useReducedMotion';
