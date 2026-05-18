/**
 * Web preview of the mobile HomeScreen design.
 *
 * Visually mirrors `apps/mobile/src/screens/HomeScreen.tsx` 1:1 — same
 * tokens, same hierarchy, same numbers from the mock budget. Renders inside
 * a phone-frame so the preview reads as a mobile design.
 *
 * Pure presentation — no real persistence. C8 wires the mobile real store;
 * this file stays as a design preview until web parity is in scope (v2+).
 */

import { useMemo } from 'react';
import { Settings, Plus } from 'lucide-react';
import { tokens, SYSTEM_FONT } from './tokens';
import { MOCK_BLOB } from './mockBudget';
import {
  allocatedByCategory,
  daysRemainingIn,
  recentTransactions,
  spentByCategory,
  todaysSafeToSpend,
} from './selectors';

const CATEGORY_LABELS = {
  essentials: 'Essentials',
  growth: 'Growth',
  stability: 'Stability',
  rewards: 'Rewards',
} as const;

const CATEGORY_IDS = ['essentials', 'growth', 'stability', 'rewards'] as const;

// Reference date — matches the mock so the preview is deterministic.
const NOW = new Date('2026-05-17T10:00:00Z');

const NGN_SYMBOL = '₦';

// ─── Utilities ───────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  return Math.abs(Math.round(n)).toLocaleString('en-US');
}

// ─── Atoms ───────────────────────────────────────────────────────────────────

function AmountDisplay({
  value,
  symbol,
  size,
  color,
}: {
  value: number;
  symbol?: string;
  size: 'md' | 'lg' | 'hero';
  color?: string;
}) {
  const typeStyle =
    size === 'hero' ? tokens.type.hero : size === 'lg' ? tokens.type.title2 : tokens.type.amount;
  const symStyle =
    size === 'hero'
      ? { ...tokens.type.title2, fontWeight: 500 }
      : size === 'lg'
        ? tokens.type.headline
        : tokens.type.amount;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', color: color ?? tokens.color.text.numeric }}>
      {symbol ? (
        <span style={{ ...symStyle, marginRight: size === 'hero' ? 8 : 2 }}>{symbol}</span>
      ) : null}
      <span style={{ ...typeStyle, fontVariantNumeric: 'tabular-nums' }}>{formatNumber(value)}</span>
    </span>
  );
}

function CategoryDot({ category, size = 8 }: { category: keyof typeof CATEGORY_LABELS; size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: tokens.color.category[category].base,
        flexShrink: 0,
      }}
    />
  );
}

function CategoryBar({
  category,
  label,
  allocated,
  spent,
  symbol,
  onClick,
}: {
  category: keyof typeof CATEGORY_LABELS;
  label: string;
  allocated: number;
  spent: number;
  symbol: string;
  onClick?: () => void;
}) {
  const remaining = allocated - spent;
  const over = remaining < 0;
  const ratio = allocated > 0 ? Math.min(1, spent / allocated) : 0;
  const c = tokens.color.category[category];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}, ${symbol}${formatNumber(spent)} of ${symbol}${formatNumber(allocated)}, ${over ? 'over' : 'remaining'} ${symbol}${formatNumber(Math.abs(remaining))}`}
      style={{
        width: '100%',
        textAlign: 'left',
        background: 'transparent',
        border: 'none',
        padding: `${tokens.space[3]}px ${tokens.space[4]}px`,
        cursor: 'pointer',
        display: 'block',
        font: 'inherit',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.space[2], minWidth: 0 }}>
          <CategoryDot category={category} />
          <span style={{ ...tokens.type.headline, color: tokens.color.text.primary }}>{label}</span>
        </div>
        <AmountDisplay
          value={Math.abs(remaining)}
          symbol={symbol}
          size="md"
          color={over ? tokens.color.status.overBudget : tokens.color.text.primary}
        />
      </div>

      {/* Bar */}
      <div
        style={{
          marginTop: tokens.space[2],
          height: 8,
          width: '100%',
          backgroundColor: c.tint,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${ratio * 100}%`,
            backgroundColor: c.base,
            borderRadius: 4,
            transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </div>

      {/* Caption */}
      <div
        style={{
          marginTop: tokens.space[1],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ ...tokens.type.footnote, color: tokens.color.text.secondary }}>
          {symbol}
          {formatNumber(spent)} of {symbol}
          {formatNumber(allocated)}
        </span>
        {over ? (
          <span
            style={{
              ...tokens.type.footnote,
              color: tokens.color.status.overBudget,
              fontWeight: 500,
            }}
          >
            {symbol}
            {formatNumber(Math.abs(remaining))} over
          </span>
        ) : null}
      </div>
    </button>
  );
}

function TransactionRow({
  transaction,
  symbol,
  isLast,
}: {
  transaction: ReturnType<typeof recentTransactions>[number];
  symbol: string;
  isLast: boolean;
}) {
  const label = CATEGORY_LABELS[transaction.categoryId];
  const time = new Date(transaction.loggedAt).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: `${tokens.space[3]}px ${tokens.space[4]}px`,
        minHeight: 56,
        borderBottom: isLast ? 'none' : `1px solid ${tokens.color.border.hairline}`,
        marginLeft: isLast ? 0 : 0,
      }}
    >
      <div style={{ marginRight: tokens.space[3] }}>
        <CategoryDot category={transaction.categoryId} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            ...tokens.type.body,
            color: tokens.color.text.primary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {transaction.note || label}
        </div>
        <div
          style={{
            ...tokens.type.footnote,
            color: tokens.color.text.secondary,
            marginTop: 2,
          }}
        >
          {label} · {time}
        </div>
      </div>
      <AmountDisplay value={transaction.amount} symbol={symbol} size="md" />
    </div>
  );
}

// ─── HomeScreen ──────────────────────────────────────────────────────────────

export function BudgetHomeScreen() {
  const month = MOCK_BLOB.current;
  const today = todaysSafeToSpend(month, NOW);
  const daysLeft = daysRemainingIn(month.monthKey, NOW);
  const allocated = useMemo(() => allocatedByCategory(month.plan), [month.plan]);
  const spent = useMemo(() => spentByCategory(month), [month]);
  const recent = useMemo(() => recentTransactions(month, 3), [month]);

  return (
    <div
      style={{
        backgroundColor: tokens.color.bg.base,
        minHeight: '100%',
        fontFamily: SYSTEM_FONT,
        color: tokens.color.text.primary,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        position: 'relative',
      }}
    >
      {/* Top row: gear icon only */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: `${tokens.space[2]}px ${tokens.space[4]}px`,
          paddingTop: `calc(env(safe-area-inset-top, ${tokens.space[2]}px) + ${tokens.space[2]}px)`,
        }}
      >
        <button
          type="button"
          aria-label="Open settings"
          style={{
            width: 44,
            height: 44,
            borderRadius: 9999,
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: tokens.color.text.primary,
          }}
        >
          <Settings size={22} strokeWidth={1.75} />
        </button>
      </div>

      {/* Hero */}
      <section
        style={{
          padding: `${tokens.space[4]}px ${tokens.space[4]}px ${tokens.space[7]}px`,
        }}
      >
        <div
          style={{
            ...tokens.type.caption2,
            color: tokens.color.text.secondary,
            textTransform: 'uppercase',
            marginBottom: tokens.space[2],
          }}
        >
          Safe to spend today
        </div>
        <AmountDisplay value={today} symbol={NGN_SYMBOL} size="hero" />
        <div
          style={{
            ...tokens.type.callout,
            color: tokens.color.text.secondary,
            marginTop: tokens.space[2],
          }}
        >
          {today > 0
            ? `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} to go this month`
            : `You're at today's limit · ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} to go`}
        </div>
      </section>

      {/* Category bars card */}
      <section style={{ padding: `0 ${tokens.space[4]}px` }}>
        <div
          style={{
            backgroundColor: tokens.color.bg.elevated,
            borderRadius: tokens.radii.lg,
            border: `1px solid ${tokens.color.border.hairline}`,
            overflow: 'hidden',
          }}
        >
          {CATEGORY_IDS.map((id, idx) => (
            <div key={id}>
              <CategoryBar
                category={id}
                label={CATEGORY_LABELS[id]}
                allocated={allocated[id]}
                spent={spent[id]}
                symbol={NGN_SYMBOL}
              />
              {idx < CATEGORY_IDS.length - 1 ? (
                <div
                  style={{
                    height: 1,
                    backgroundColor: tokens.color.border.hairline,
                    marginLeft: tokens.space[4],
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* Adjust plan */}
      <section style={{ padding: `${tokens.space[3]}px ${tokens.space[4]}px 0` }}>
        <button
          type="button"
          style={{
            background: 'transparent',
            border: 'none',
            padding: `${tokens.space[2]}px 0`,
            cursor: 'pointer',
            ...tokens.type.footnote,
            color: tokens.color.text.secondary,
            fontWeight: 500,
          }}
        >
          Adjust plan →
        </button>
      </section>

      {/* Recent activity */}
      <section style={{ marginTop: tokens.space[7], paddingBottom: tokens.space[12] }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            padding: `0 ${tokens.space[4]}px`,
            marginBottom: tokens.space[2],
          }}
        >
          <div
            style={{
              ...tokens.type.caption2,
              color: tokens.color.text.secondary,
              textTransform: 'uppercase',
            }}
          >
            Recent activity
          </div>
          <button
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              ...tokens.type.footnote,
              color: tokens.color.text.secondary,
              fontWeight: 500,
            }}
          >
            See all
          </button>
        </div>
        <div style={{ padding: `0 ${tokens.space[4]}px` }}>
          <div
            style={{
              backgroundColor: tokens.color.bg.elevated,
              borderRadius: tokens.radii.lg,
              border: `1px solid ${tokens.color.border.hairline}`,
              overflow: 'hidden',
            }}
          >
            {recent.map((tx, idx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                symbol={NGN_SYMBOL}
                isLast={idx === recent.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAB */}
      <button
        type="button"
        aria-label="Log a transaction"
        style={{
          position: 'absolute',
          right: tokens.space[4],
          bottom: tokens.space[7],
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: tokens.color.fab.bg,
          color: tokens.color.fab.icon,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: tokens.shadow.lg,
        }}
      >
        <Plus size={26} strokeWidth={2.25} />
      </button>
    </div>
  );
}
