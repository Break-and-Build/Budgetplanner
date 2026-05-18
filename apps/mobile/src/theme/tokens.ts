/**
 * Design tokens — Budget Tracker (Mobile v1)
 * Aesthetic: Apple-Wallet calm. Warm-neutral monochrome with muted category accents.
 *
 * Source of truth for visual style. Components import from here — never hard-code.
 * Human-readable rationale: .design/budget-tracker-mobile-v1/DESIGN_TOKENS.md
 *
 * Light mode is the only mode shipped in v1. The `tokensDark` export below is a
 * complete stub authored alongside light so dark mode is a swap, not a rewrite.
 */

import { Platform, type TextStyle, type ViewStyle } from 'react-native';

// ─── Color primitives ─────────────────────────────────────────────────────────
// Raw values, never used directly by components. Mapped to semantic names below.

const ink = {
  /** Near-black with a cool undertone. Not pure #000 — softer on warm bg. */
  900: '#15151A',
  700: '#3A3A40',
  500: '#6E6E73',
  300: '#A1A1A6',
  200: '#C7C7CC',
  100: '#E5E5EA',
  50: '#F1F0EC',
  25: '#FAFAF7',
  0: '#FFFFFF',
} as const;

/**
 * Four budget-category accents. All four sit at roughly the same perceived
 * lightness (L≈52 in LCH) and chroma (~28) so they read as a family rather
 * than a hierarchy. Desaturated on purpose — the product is calm, not festive.
 */
const category = {
  essentials: { base: '#4A6FA5', tint: '#E3EBF4' }, // slate blue — foundational
  growth:     { base: '#5C8A6B', tint: '#E4EEE7' }, // sage green — life, savings
  stability:  { base: '#7A6B95', tint: '#EBE8F0' }, // dusty violet — sturdy
  rewards:    { base: '#B5755C', tint: '#F2E4DE' }, // terracotta — treat
} as const;

const status = {
  /** Used only on the "over budget" caption under a category bar. Muted red. */
  overBudget: '#B84A4A',
  /** Pressed state for filled destructive surfaces (Button.destructive). */
  overBudgetPressed: '#9A3D3D',
  /** Warning (e.g., "no income added yet"). Warm amber, used sparingly. */
  warning: '#C9913B',
  /** Success is implicit in the category palette; we don't need a separate green. */
} as const;

// ─── Color: semantic (LIGHT) ──────────────────────────────────────────────────

const colorLight = {
  // Surfaces
  bg: {
    /** App background. Warm off-white. Deliberately not #FFF — "expensive" cream. */
    base: ink[25],
    /** Card surface, modal sheet, FAB. Pure white sits up off the base. */
    elevated: ink[0],
    /** Input wells, sunken areas. */
    sunken: ink[50],
    /** Backdrop behind modals. */
    overlay: 'rgba(15, 15, 20, 0.32)',
  },

  // Text / ink
  text: {
    primary: ink[900],
    secondary: ink[500],
    tertiary: ink[300],
    disabled: ink[200],
    inverse: ink[0],
    /** Hero numerals (today's safe-to-spend, category amounts). Same as primary. */
    numeric: ink[900],
  },

  // Borders / separators
  border: {
    /** iOS-style hairline. Effectively `rgba(60,60,67,0.12)`. */
    hairline: 'rgba(60, 60, 67, 0.12)',
    /** Slightly stronger — used between major sections. */
    divider: 'rgba(60, 60, 67, 0.18)',
    /** Focus ring. We use ink, not an accent color — keeps it neutral. */
    focus: ink[900],
  },

  // Category accents (4-tuple keyed by category id)
  category,

  // Status
  status,

  // Tab bar
  tabBar: {
    bg: ink[0],
    border: 'rgba(60, 60, 67, 0.12)',
    iconActive: ink[900],
    iconInactive: ink[300],
    labelActive: ink[900],
    labelInactive: ink[500],
  },

  // FAB — monochrome ink-on-paper per the brief
  fab: {
    bg: ink[900],
    icon: ink[0],
    pressed: ink[700],
  },
} as const;

// ─── Color: semantic (DARK STUB, v2) ──────────────────────────────────────────
// Authored alongside light to keep the v1 → v2 swap mechanical, not a redesign.

const inkDark = {
  900: '#F2F2F4',
  700: '#C7C7CC',
  500: '#8E8E93',
  300: '#636366',
  200: '#48484A',
  100: '#2C2C2E',
  50: '#1C1C1E',
  25: '#121214', // app bg
  0: '#000000',  // unused, kept for symmetry
} as const;

const categoryDark = {
  // Slightly lighter & less saturated than light — keeps contrast manageable on dark bg.
  essentials: { base: '#7095C2', tint: '#1E2733' },
  growth:     { base: '#8AB295', tint: '#1F2924' },
  stability:  { base: '#A091BC', tint: '#26222E' },
  rewards:    { base: '#D29A82', tint: '#2E2520' },
} as const;

const colorDark = {
  bg: {
    base: inkDark[25],
    elevated: inkDark[50],
    sunken: inkDark[100],
    overlay: 'rgba(0, 0, 0, 0.56)',
  },
  text: {
    primary: inkDark[900],
    secondary: inkDark[500],
    tertiary: inkDark[300],
    disabled: inkDark[200],
    inverse: ink[900],
    numeric: inkDark[900],
  },
  border: {
    hairline: 'rgba(235, 235, 245, 0.12)',
    divider: 'rgba(235, 235, 245, 0.18)',
    focus: inkDark[900],
  },
  category: categoryDark,
  status: {
    overBudget: '#E07A7A',
    overBudgetPressed: '#B86060',
    warning: '#E4B26A',
  },
  tabBar: {
    bg: inkDark[50],
    border: 'rgba(235, 235, 245, 0.12)',
    iconActive: inkDark[900],
    iconInactive: inkDark[300],
    labelActive: inkDark[900],
    labelInactive: inkDark[500],
  },
  fab: {
    bg: inkDark[900],
    icon: inkDark[25],
    pressed: inkDark[700],
  },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
// 4-point base. The brief calls for generous whitespace, so the upper end is
// roomier than typical 8-point systems.

const space = {
  0: 0,
  px: 1,
  '0.5': 2,
  1: 4,
  '1.5': 6,
  2: 8,
  3: 12,
  4: 16,   // default screen edge padding
  5: 20,
  6: 24,   // common card padding
  7: 32,
  8: 40,
  9: 48,
  10: 64,
  11: 80,
  12: 96,
  13: 128,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
// System font on both platforms: SF Pro (iOS) / Roboto (Android).
// Defined as TextStyle presets so consumers spread them: <Text style={type.title1} />

const fontFamily = {
  /** Default UI text. System font. */
  ui: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' })!,
  /** Monetary values — same family but with tabular-nums variant for vertical alignment. */
  numeric: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' })!,
} as const;

const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;

const letterSpacing = {
  tight: -0.4,
  snug: -0.2,
  normal: 0,
  wide: 0.4,
} as const;

/**
 * Type scale — iOS HIG-aligned with a custom hero step for the safe-to-spend
 * number on Home. All sizes are unitless pt values (RN's fontSize unit).
 *
 * Naming follows Apple HIG semantics — `body` is the canonical reading size.
 */
const type = {
  hero: {
    fontFamily: fontFamily.numeric,
    fontSize: 56,
    lineHeight: 64,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.tight,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  },
  display: {
    fontFamily: fontFamily.ui,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.tight,
  },
  title1: {
    fontFamily: fontFamily.ui,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.snug,
  },
  title2: {
    fontFamily: fontFamily.ui,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.snug,
  },
  title3: {
    fontFamily: fontFamily.ui,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  },
  headline: {
    fontFamily: fontFamily.ui,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontFamily: fontFamily.ui,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
  callout: {
    fontFamily: fontFamily.ui,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
  subhead: {
    fontFamily: fontFamily.ui,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
  footnote: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
  caption1: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.wide,
  },
  caption2: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide,
  },
  /** Numeric variant: monetary values that must align vertically in lists. */
  amount: {
    fontFamily: fontFamily.numeric,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  },
} as const satisfies Record<string, TextStyle>;

// ─── Radii ────────────────────────────────────────────────────────────────────

const radii = {
  none: 0,
  sm: 6,    // chips, dots-with-text
  md: 10,   // buttons, inputs
  lg: 14,   // cards, sheet bottoms
  xl: 20,   // bottom sheets, modal sheets
  pill: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────
// RN shadows are platform-split. Each token is a complete ViewStyle delta.

const shadow = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  /** Hairline elevation — chips, tab bar. Barely visible. */
  xs: {
    shadowColor: ink[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  /** Soft button-press / pressed state. */
  sm: {
    shadowColor: ink[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  /** Default card elevation. */
  md: {
    shadowColor: ink[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  /** FAB, prominent buttons. */
  lg: {
    shadowColor: ink[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
  /** Bottom-sheet rise — shadow goes UP (negative y). */
  sheet: {
    shadowColor: ink[900],
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
} as const satisfies Record<string, ViewStyle>;

// ─── Motion ───────────────────────────────────────────────────────────────────
// Durations are ms. Easings are bezier control-point tuples so consumers can
// construct `Easing.bezier(...t)` from react-native-reanimated or Animated.

const motion = {
  duration: {
    /** For Reduce-Motion fallback. Consumer should check `useReducedMotion()`. */
    instant: 0,
    /** Chip toggle, dot fill. */
    fast: 150,
    /** Most interface transitions — sheet, push, fade. */
    base: 250,
    /** Category bar fill, hero number tick. */
    slow: 400,
    /** Reserved for one-off moments (e.g., the month-end roll-forward). */
    slower: 600,
  },
  easing: {
    /** Default — symmetric ease. Use when entering and leaving share a curve. */
    standard: [0.4, 0, 0.2, 1] as const,
    /** Entering elements — eases out at the end (lands gently). */
    decelerate: [0, 0, 0.2, 1] as const,
    /** Exiting elements — accelerates away. */
    accelerate: [0.4, 0, 1, 1] as const,
    /** Spring-like overshoot. Use sparingly — bar fills, NOT sheet rises. */
    spring: [0.34, 1.56, 0.64, 1] as const,
  },
} as const;

// ─── Layout ───────────────────────────────────────────────────────────────────

const layout = {
  /** Breakpoints in width (pt). Compare against `useWindowDimensions().width`. */
  breakpoint: {
    compact: 0,    // ≤375 (iPhone SE, mini)
    regular: 376,  // standard iPhones
    wide: 600,     // iPad, foldables
  },
  /** Max content column on wide breakpoints. Brief: no multi-column layouts. */
  maxContentWidth: 520,
  /** Default screen edge padding (matches space[4]). */
  screenPaddingX: space[4],
  /** Standard FAB size & offset. */
  fabSize: 56,
  fabOffset: space[4],
  /** Tab bar height excluding safe area. */
  tabBarHeight: 49,
  /** Minimum accessible tap target (WCAG / iOS HIG). */
  minTapTarget: 44,
} as const;

// ─── Z-index ──────────────────────────────────────────────────────────────────

const zIndex = {
  base: 0,
  elevated: 10,
  fab: 50,
  sticky: 100,
  modal: 1000,
  toast: 2000,
} as const;

// ─── Accessibility ────────────────────────────────────────────────────────────

const a11y = {
  /** Honored across motion, animations, sheet rise, category-bar fills. */
  reduceMotionDurationMultiplier: 0,
  /** WCAG AA targets (informational — components must verify their own contrast). */
  minContrastBody: 4.5,
  minContrastLargeText: 3,
  /** Dynamic Type cap, per brief — honor up to Large (1.3×). */
  maxFontScale: 1.3,
} as const;

// ─── Public surface ───────────────────────────────────────────────────────────

export const tokens = {
  color: colorLight,
  space,
  type,
  fontFamily,
  fontWeight,
  letterSpacing,
  radii,
  shadow,
  motion,
  layout,
  zIndex,
  a11y,
} as const;

/**
 * v2 dark-mode swap. Authored alongside light so the runtime change is:
 *
 *   const t = colorScheme === 'dark' ? tokensDark : tokens;
 *
 * No component rewrites required — they reference `t.color.text.primary` etc.
 */
export const tokensDark = {
  ...tokens,
  color: colorDark,
  shadow: {
    ...shadow,
    // Dark shadows use black at higher opacity (light shadows would glow on dark).
    md: { ...shadow.md, shadowOpacity: 0.32 },
    lg: { ...shadow.lg, shadowOpacity: 0.40 },
    sheet: { ...shadow.sheet, shadowOpacity: 0.48 },
  },
} as const;

export type Tokens = typeof tokens;
export type CategoryId = keyof typeof category;
