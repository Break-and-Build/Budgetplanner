/**
 * Category helpers — defaults, palette, migration, and percentage math.
 *
 * Categories are percentage-based: every category owns a share of the month's
 * flexible budget and all categories in a plan sum to 100. These helpers are
 * pure so the mobile app and tests can share them.
 */

import type { CategoryDef, SplitPlan } from './types';

/** Hard limits on how many categories a plan can hold. */
export const MIN_CATEGORIES = 1;
export const MAX_CATEGORIES = 8;

/**
 * Preset colour palette for categories. The first four match the original
 * fixed-bucket accents so migrated installs keep their bar colours.
 */
export const CATEGORY_PALETTE: readonly string[] = [
  '#4A6FA5', // slate blue
  '#5C8A6B', // sage green
  '#7A6B95', // dusty violet
  '#B5755C', // terracotta
  '#4F8F9D', // teal
  '#B08A3E', // ochre
  '#9A5C7A', // plum
  '#6E7F8D', // steel
];

/** Defaults for a fresh install — clear, common names anyone recognises. */
export function defaultCategories(): CategoryDef[] {
  return [
    { id: 'needs', name: 'Needs', color: '#4A6FA5', percent: 50 },
    { id: 'wants', name: 'Wants', color: '#5C8A6B', percent: 25 },
    { id: 'savings', name: 'Savings', color: '#7A6B95', percent: 15 },
    { id: 'fun', name: 'Fun', color: '#B5755C', percent: 10 },
  ];
}

/**
 * Legacy fixed-bucket metadata, keyed by the original four ids. Used to convert
 * an old `split` into `categories` while keeping the ids stable (so existing
 * transactions still map). Names are upgraded to the clearer defaults.
 */
const LEGACY_META: Record<string, { name: string; color: string }> = {
  essentials: { name: 'Needs', color: '#4A6FA5' },
  growth: { name: 'Wants', color: '#5C8A6B' },
  stability: { name: 'Savings', color: '#7A6B95' },
  rewards: { name: 'Fun', color: '#B5755C' },
};

/**
 * Convert a legacy `SplitPlan` into `categories`, preserving the four ids so
 * transactions logged under them still resolve. Falls back to fresh defaults
 * if the split is missing or empty.
 */
export function categoriesFromSplit(split: SplitPlan | null | undefined): CategoryDef[] {
  if (!split || typeof split !== 'object') return defaultCategories();
  const ids = ['essentials', 'growth', 'stability', 'rewards'] as const;
  const cats = ids.map((id) => ({
    id,
    name: LEGACY_META[id].name,
    color: LEGACY_META[id].color,
    percent: typeof split[id] === 'number' ? split[id] : 0,
  }));
  // If every percent came back 0 (corrupt split), use defaults instead.
  return cats.some((c) => c.percent > 0) ? cats : defaultCategories();
}

/** Sum of category percentages. */
export function totalPercent(categories: CategoryDef[]): number {
  return categories.reduce((s, c) => s + (c.percent || 0), 0);
}

/**
 * Rebalance percentages so they sum to exactly 100 while preserving each
 * category's relative weight. Any rounding drift lands on the first category.
 * An all-zero list is split evenly. Never mutates the input.
 */
export function normalizeCategoryPercents(categories: CategoryDef[]): CategoryDef[] {
  if (categories.length === 0) return [];
  const total = totalPercent(categories);
  if (total === 100) return categories.map((c) => ({ ...c }));

  let scaled: CategoryDef[];
  if (total <= 0) {
    const even = Math.floor(100 / categories.length);
    scaled = categories.map((c) => ({ ...c, percent: even }));
  } else {
    scaled = categories.map((c) => ({
      ...c,
      percent: Math.round((c.percent / total) * 100),
    }));
  }
  const drift = 100 - totalPercent(scaled);
  scaled[0] = { ...scaled[0], percent: scaled[0].percent + drift };
  return scaled;
}

/** True when the category list is valid: 1–8 entries, percentages total 100. */
export function categoriesAreValid(categories: CategoryDef[]): boolean {
  return (
    categories.length >= MIN_CATEGORIES &&
    categories.length <= MAX_CATEGORIES &&
    totalPercent(categories) === 100 &&
    categories.every((c) => c.name.trim().length > 0 && c.percent >= 0)
  );
}

/** Generate a unique-enough category id. Local-only; no true UUID needed. */
export function newCategoryId(): string {
  return `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Next unused palette colour for a list of categories (cycles if exhausted). */
export function nextPaletteColor(categories: CategoryDef[]): string {
  const used = new Set(categories.map((c) => c.color));
  const free = CATEGORY_PALETTE.find((c) => !used.has(c));
  return free ?? CATEGORY_PALETTE[categories.length % CATEGORY_PALETTE.length];
}
