/**
 * Web-side token mirror.
 *
 * Hand-mirrored from `apps/mobile/src/theme/tokens.ts` so the web preview is
 * visually faithful to the mobile design. When mobile tokens change, update
 * this file too — they're the same design, different runtime.
 */

export const tokens = {
  color: {
    bg: {
      base: '#FAFAF7',      // warm cream
      elevated: '#FFFFFF',
      sunken: '#F1F0EC',
      overlay: 'rgba(15, 15, 20, 0.32)',
    },
    text: {
      primary: '#15151A',
      secondary: '#6E6E73',
      tertiary: '#A1A1A6',
      disabled: '#C7C7CC',
      inverse: '#FFFFFF',
      numeric: '#15151A',
    },
    border: {
      hairline: 'rgba(60, 60, 67, 0.12)',
      divider: 'rgba(60, 60, 67, 0.18)',
      focus: '#15151A',
    },
    category: {
      essentials: { base: '#4A6FA5', tint: '#E3EBF4' },
      growth:     { base: '#5C8A6B', tint: '#E4EEE7' },
      stability:  { base: '#7A6B95', tint: '#EBE8F0' },
      rewards:    { base: '#B5755C', tint: '#F2E4DE' },
    },
    status: {
      overBudget: '#B84A4A',
      warning: '#C9913B',
    },
    fab: {
      bg: '#15151A',
      icon: '#FFFFFF',
      pressed: '#3A3A40',
    },
  },
  space: { 0: 0, 0.5: 2, 1: 4, 1.5: 6, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 9: 48, 10: 64, 11: 80, 12: 96, 13: 128 },
  radii: { none: 0, sm: 6, md: 10, lg: 14, xl: 20, pill: 9999 },
  type: {
    hero:    { fontSize: 56, lineHeight: '64px', fontWeight: 600, letterSpacing: '-0.4px' },
    display: { fontSize: 40, lineHeight: '46px', fontWeight: 600, letterSpacing: '-0.4px' },
    title1:  { fontSize: 28, lineHeight: '34px', fontWeight: 600, letterSpacing: '-0.2px' },
    title2:  { fontSize: 22, lineHeight: '28px', fontWeight: 600, letterSpacing: '-0.2px' },
    title3:  { fontSize: 20, lineHeight: '25px', fontWeight: 600 },
    headline:{ fontSize: 17, lineHeight: '22px', fontWeight: 600 },
    body:    { fontSize: 17, lineHeight: '22px', fontWeight: 400 },
    callout: { fontSize: 16, lineHeight: '21px', fontWeight: 400 },
    subhead: { fontSize: 15, lineHeight: '20px', fontWeight: 400 },
    footnote:{ fontSize: 13, lineHeight: '18px', fontWeight: 400 },
    caption1:{ fontSize: 12, lineHeight: '16px', fontWeight: 400, letterSpacing: '0.4px' },
    caption2:{ fontSize: 11, lineHeight: '14px', fontWeight: 500, letterSpacing: '0.4px' },
    amount:  { fontSize: 17, lineHeight: '22px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' as const },
  },
  shadow: {
    md: '0 4px 12px rgba(21, 21, 26, 0.06)',
    lg: '0 8px 16px rgba(21, 21, 26, 0.10)',
  },
} as const;

export type Tokens = typeof tokens;

/**
 * The default font stack — Apple-Wallet calm calls for the system font.
 * Web equivalent of `Platform.select({ ios: 'System', android: 'Roboto' })`.
 */
export const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Roboto, "Segoe UI", system-ui, sans-serif';
