/**
 * Mock BudgetBlob for the web preview. Mirrors `apps/mobile/src/state/mockBudget.ts`.
 *
 * Pinned to a deterministic 2026-05-17 "now" so the preview screenshot is
 * stable across runs.
 */

import type { BudgetBlob, Transaction } from '@budgetplanner/core';

function isoBack(days: number, hours: number, minutes: number = 0): string {
  const d = new Date('2026-05-17T09:00:00Z');
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hours, minutes, 0, 0);
  return d.toISOString();
}

const transactions: Transaction[] = [
  { id: 't-01', amount: 1800,  categoryId: 'rewards',    note: 'Coffee + pastry',     loggedAt: isoBack(0, 8, 12),  monthKey: '2026-05' },
  { id: 't-02', amount: 6500,  categoryId: 'essentials', note: 'Lunch with Tomi',     loggedAt: isoBack(0, 13, 45), monthKey: '2026-05' },
  { id: 't-03', amount: 22500, categoryId: 'essentials', note: 'Groceries — Shoprite',loggedAt: isoBack(1, 19, 8),  monthKey: '2026-05' },
  { id: 't-04', amount: 3000,  categoryId: 'essentials', note: 'Uber to office',      loggedAt: isoBack(1, 8, 32),  monthKey: '2026-05' },
  { id: 't-05', amount: 12000, categoryId: 'growth',     note: 'Online course',       loggedAt: isoBack(3, 21, 4),  monthKey: '2026-05' },
  { id: 't-06', amount: 4500,  categoryId: 'rewards',    note: 'Cinema',              loggedAt: isoBack(3, 17, 0),  monthKey: '2026-05' },
  { id: 't-07', amount: 8200,  categoryId: 'essentials', note: 'Pharmacy',            loggedAt: isoBack(6, 11, 18), monthKey: '2026-05' },
  { id: 't-08', amount: 9000,  categoryId: 'stability',  note: 'Insurance top-up',    loggedAt: isoBack(10, 10, 0), monthKey: '2026-05' },
  { id: 't-09', amount: 14000, categoryId: 'essentials', note: 'Phone bill',          loggedAt: isoBack(14, 12, 0), monthKey: '2026-05' },
  { id: 't-10', amount: 2200,  categoryId: 'rewards',                                 loggedAt: isoBack(14, 15, 22), monthKey: '2026-05' },
];

export const MOCK_BLOB: BudgetBlob = {
  schemaVersion: 2,
  currency: 'NGN',
  current: {
    monthKey: '2026-05',
    plan: {
      income: [
        { id: 'i-1', name: 'Salary',    amount: 450000 },
        { id: 'i-2', name: 'Freelance', amount: 80000 },
      ],
      priorities: [
        { id: 'p-1', name: 'Rent',      amount: 150000, isFixed: true },
        { id: 'p-2', name: 'Utilities', amount: 25000,  isFixed: false },
        { id: 'p-3', name: 'Internet',  amount: 15000,  isFixed: true },
        { id: 'p-4', name: 'Transport', amount: 35000,  isFixed: false },
      ],
      savings: {
        enabled: true,
        entries: [{ id: 's-1', name: 'Emergency fund', type: 'percentage', value: 15 }],
      },
      split: { essentials: 50, growth: 25, stability: 15, rewards: 10 },
    },
    transactions,
  },
  history: [],
  setupComplete: true,
};
