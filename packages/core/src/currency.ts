/**
 * Formats a number for display in currency inputs.
 * Returns an empty string for 0 so inputs appear blank by default.
 * Uses locale-aware thousands separators.
 *
 * Examples:
 *   formatNumber(0)       → ''
 *   formatNumber(1500)    → '1,500'
 *   formatNumber(1500.5)  → '1,500.5'
 */
export function formatNumber(value: number): string {
  if (!value) return '';
  // Preserve decimal portion while formatting integer part
  const [integer, decimal] = value.toString().split('.');
  const formatted = Number(integer).toLocaleString('en-US');
  return decimal !== undefined ? `${formatted}.${decimal}` : formatted;
}

/**
 * Parses a user-typed string into a number.
 * Strips thousands separators (commas) and ignores non-numeric characters
 * other than a decimal point.
 *
 * Examples:
 *   parseNumber('1,500')   → 1500
 *   parseNumber('1500.5')  → 1500.5
 *   parseNumber('')        → 0
 *   parseNumber('abc')     → 0
 */
export function parseNumber(text: string): number {
  if (!text) return 0;
  // Remove commas (thousands separator) and any stray non-numeric chars
  const cleaned = text.replace(/,/g, '').replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}