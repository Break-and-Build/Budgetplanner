/**
 * Smart reminder content — picks the right body copy for a daily notification
 * based on the user's current budget state, so the push is actually useful
 * ("Rewards is at 82% with 6 days left") instead of a generic "tap to log"
 * nag. Pure function — no React, no scheduler, no AsyncStorage. The mobile
 * app passes a `SmartReminderContext` snapshot in and gets `{title, body}`
 * back; the scheduler plugs that into expo-notifications verbatim.
 *
 * Priority order (highest wins):
 *   1. atLimit        — the user has spent all of today's budget
 *   2. needsReview    — a fresh month's plan hasn't been confirmed yet
 *   3. behind pace    — spend has drifted over the even-burn rate
 *   4. category hot   — one category is at >=80% with time still left
 *   5. recurring soon — a recurring bill posts within 3 days
 *   6. default        — calm "X safe to spend today" line
 */

export interface SmartReminderCategorySpend {
  name: string;
  allocated: number;
  spent: number;
}

export interface SmartReminderRecurring {
  name: string;
  amount: number;
  dayOfMonth: number;
  firedThisMonth: boolean;
}

export interface SmartReminderContext {
  symbol: string;
  today: number;
  daysLeft: number;
  needsReview: boolean;
  pace: 'ahead' | 'onPace' | 'behind' | 'atLimit';
  categories: SmartReminderCategorySpend[];
  recurring: SmartReminderRecurring[];
  /** The 1-indexed day of month `now` refers to. Used for "recurring in N days". */
  dayOfMonth: number;
  /** Month name for the needsReview case. "October", not "2026-10". */
  monthLabel: string;
}

export interface SmartReminderCopy {
  title: string;
  body: string;
}

const DEFAULT_COPY: SmartReminderCopy = {
  title: "Today's budget",
  body: 'Tap to log the day and see what you have left to spend.',
};

/**
 * Pick the right copy for the current state. Returns the calm default when
 * the context doesn't trigger any of the priority rules — same shape as the
 * previous generic reminder.
 */
export function smartReminderContent(ctx: SmartReminderContext): SmartReminderCopy {
  // 1. At limit
  if (ctx.pace === 'atLimit' || ctx.today <= 0) {
    return {
      title: "You're at today's limit",
      body: `Nothing safe to spend today. ${ctx.daysLeft} ${ctx.daysLeft === 1 ? 'day' : 'days'} to go.`,
    };
  }

  // 2. Needs review (fresh month)
  if (ctx.needsReview) {
    return {
      title: `${ctx.monthLabel} plan needs a review`,
      body: 'Last month\'s income, priorities and categories carried over. Tap to confirm or tweak.',
    };
  }

  // 3. Behind pace — only once we've got meaningful days elapsed
  if (ctx.pace === 'behind') {
    return {
      title: 'Slipped behind pace',
      body: `${ctx.symbol}${ctx.today.toLocaleString('en-US')} safe to spend today — ease up to get back on track.`,
    };
  }

  // 4. Category hot (>=80% with time left) — surface the worst offender
  const hot = hottestCategory(ctx.categories);
  if (hot) {
    const pct = Math.round((hot.spent / hot.allocated) * 100);
    return {
      title: `${hot.name} is at ${pct}%`,
      body: `${ctx.daysLeft} ${ctx.daysLeft === 1 ? 'day' : 'days'} left in the month — careful here.`,
    };
  }

  // 5. Recurring posts within 3 days
  const upcoming = nextRecurringWithin(ctx.recurring, ctx.dayOfMonth, 3);
  if (upcoming) {
    const daysAway = upcoming.dayOfMonth - ctx.dayOfMonth;
    const when =
      daysAway === 0 ? 'today' : daysAway === 1 ? 'tomorrow' : `in ${daysAway} days`;
    return {
      title: `${upcoming.name} ${when}`,
      body: `${ctx.symbol}${upcoming.amount.toLocaleString('en-US')} posts automatically — it's already out of your safe-to-spend.`,
    };
  }

  // 6. Default — calm status line
  if (ctx.today > 0) {
    return {
      title: "Today's budget",
      body: `${ctx.symbol}${ctx.today.toLocaleString('en-US')} safe to spend today, ${ctx.daysLeft} ${ctx.daysLeft === 1 ? 'day' : 'days'} to go.`,
    };
  }

  return DEFAULT_COPY;
}

/** Return the single most-utilised category at >=80%, or null. */
function hottestCategory(
  cats: SmartReminderCategorySpend[],
): SmartReminderCategorySpend | null {
  let worst: SmartReminderCategorySpend | null = null;
  let worstRatio = 0;
  for (const c of cats) {
    if (c.allocated <= 0) continue;
    const ratio = c.spent / c.allocated;
    if (ratio >= 0.8 && ratio > worstRatio) {
      worst = c;
      worstRatio = ratio;
    }
  }
  return worst;
}

/** Next not-yet-fired recurring that lands within `horizonDays` from today. */
function nextRecurringWithin(
  rules: SmartReminderRecurring[],
  today: number,
  horizonDays: number,
): SmartReminderRecurring | null {
  let soonest: SmartReminderRecurring | null = null;
  for (const r of rules) {
    if (r.firedThisMonth) continue;
    const daysAway = r.dayOfMonth - today;
    if (daysAway < 0 || daysAway > horizonDays) continue;
    if (!soonest || r.dayOfMonth < soonest.dayOfMonth) soonest = r;
  }
  return soonest;
}
