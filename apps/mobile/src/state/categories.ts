/**
 * Category resolution helpers.
 *
 * Categories are user-defined and live on the plan (`plan.categories`), so UI
 * code resolves a `categoryId` to its definition through these helpers rather
 * than a static map. Transactions whose category was deleted resolve to the
 * neutral `UNCATEGORIZED` placeholder so nothing is ever orphaned in the UI.
 */

import type { CategoryDef, CategoryId } from '@budgetplanner/core';

/** Fallback shown for transactions whose category no longer exists. */
export const UNCATEGORIZED: CategoryDef = {
  id: 'uncategorized',
  name: 'Uncategorized',
  color: '#9A9AA0',
  percent: 0,
};

/** Build an id → CategoryDef lookup for O(1) resolution. */
export function indexCategories(categories: CategoryDef[]): Record<string, CategoryDef> {
  const map: Record<string, CategoryDef> = {};
  for (const c of categories) map[c.id] = c;
  return map;
}

/** Resolve a category id to its definition, or the Uncategorized placeholder. */
export function resolveCategory(categories: CategoryDef[], id: CategoryId): CategoryDef {
  return categories.find((c) => c.id === id) ?? UNCATEGORIZED;
}

/** Display name for a category id. */
export function categoryName(categories: CategoryDef[], id: CategoryId): string {
  return resolveCategory(categories, id).name;
}

/** Accent colour for a category id. */
export function categoryColor(categories: CategoryDef[], id: CategoryId): string {
  return resolveCategory(categories, id).color;
}
