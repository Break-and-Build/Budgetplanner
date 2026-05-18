/**
 * Currency dataset bundled with the app. Used by the first-run picker and
 * the Settings → Currency screen. Flat list — code, symbol, name. Sorted
 * by name for predictable picker order.
 *
 * Symbols are display-only. Currency code (ISO 4217) is the storage key.
 */

export interface Currency {
  /** ISO 4217 code. */
  code: string;
  /** Display symbol. May be multi-char (e.g., "Fr."). */
  symbol: string;
  /** Human-readable name for the picker. */
  name: string;
}

export const CURRENCIES: readonly Currency[] = [
  { code: 'AUD', symbol: 'A$',   name: 'Australian Dollar' },
  { code: 'BRL', symbol: 'R$',   name: 'Brazilian Real' },
  { code: 'CAD', symbol: 'C$',   name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr.',  name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥',    name: 'Chinese Yuan' },
  { code: 'EGP', symbol: 'E£',   name: 'Egyptian Pound' },
  { code: 'EUR', symbol: '€',    name: 'Euro' },
  { code: 'GBP', symbol: '£',    name: 'British Pound' },
  { code: 'GHS', symbol: 'GH₵',  name: 'Ghanaian Cedi' },
  { code: 'INR', symbol: '₹',    name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥',    name: 'Japanese Yen' },
  { code: 'KES', symbol: 'KSh',  name: 'Kenyan Shilling' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'NGN', symbol: '₦',    name: 'Nigerian Naira' },
  { code: 'NZD', symbol: 'NZ$',  name: 'New Zealand Dollar' },
  { code: 'PHP', symbol: '₱',    name: 'Philippine Peso' },
  { code: 'PLN', symbol: 'zł',   name: 'Polish Zloty' },
  { code: 'SEK', symbol: 'kr',   name: 'Swedish Krona' },
  { code: 'SGD', symbol: 'S$',   name: 'Singapore Dollar' },
  { code: 'TRY', symbol: '₺',    name: 'Turkish Lira' },
  { code: 'UGX', symbol: 'USh',  name: 'Ugandan Shilling' },
  { code: 'USD', symbol: '$',    name: 'US Dollar' },
  { code: 'ZAR', symbol: 'R',    name: 'South African Rand' },
] as const;

/** Look up a currency by code, falling back to USD if unknown. */
export function getCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES.find((c) => c.code === 'USD')!;
}

/** Look up just the symbol for a given code. Convenience accessor. */
export function symbolFor(code: string): string {
  return getCurrency(code).symbol;
}
