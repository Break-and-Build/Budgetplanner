# Design Brief: Budget Tracker (Mobile v1)

## Problem

I make a budget at the start of the month and then forget about it. Two weeks in, I have no idea whether I'm on track. The current planner is a beautiful one-time wizard — it spits out a plan and then nothing pulls me back to it. So the plan and my real spending drift apart silently until the end of the month, when I either feel vague guilt or pretend it didn't happen.

I want a budget I actually *live in*, not a worksheet I fill out once. Logging a coffee should take less effort than opening a banking app. Seeing where I stand today should be one tap from my home screen.

## Solution

A mobile-first budget tracker built around the rhythm of a month. On the 1st, a short, calm setup ritual captures income, priorities, savings, and how the remainder splits across four buckets — Essentials, Growth, Stability, Rewards. After that, the app's center of gravity is the **Home** screen: today's safe-to-spend, the four category bars with plan vs. actual, days left in the month, and recent activity. A floating "+" anywhere in the app logs a transaction in under five seconds. At the end of the month, a short reflection screen captures what worked, then rolls the plan forward to the next month with the priorities pre-filled.

The experience should feel like a system app — closer to Apple Wallet than to a fintech startup. Quiet, premium, trustworthy. The product earns daily use not by gamifying spending but by making the truth about your money easy to see, with no friction and no judgment.

## Experience Principles

1. **Calm over enthusiasm.** No charts that show off, no streaks, no fireworks when you log a coffee. The interface stays still; the numbers move. Trust comes from restraint.

2. **One screen, one answer.** Every screen exists to answer one question: *Can I spend right now? What's left in this bucket? How did I do this month?* If a screen tries to answer two questions it gets split.

3. **Friction belongs in setup, not in daily use.** The month-start ritual can take three minutes — that's where reflection lives. Logging a transaction must take five seconds or less. Never make a user choose a category they've already chosen for the same merchant.

## Aesthetic Direction

- **Philosophy**: Apple-Wallet calm. Monochrome surface, big SF-style numerals, generous whitespace, gentle 1-pixel separators, soft shadows, no illustrations, no chart heavier than a thin progress arc or bar. Category accent colors appear only on the category bar fills and small dot indicators — never on backgrounds or buttons. The interface should look "expensive" because it is mostly empty.

- **Tone**: Confident, neutral, slightly reverent. Microcopy treats money as a personal subject — never preachy, never cheerful-bordering-on-condescending. ("Logged." beats "Nice job logging that 💸".)

- **Reference points**:
  - **Apple Wallet** — the primary reference. Stacked, tinted cards. Big numerals. Subtle elevation.
  - **Apple Money / Cash app surface** — for the home screen's at-a-glance hierarchy.
  - **Things 3** — for editorial whitespace and microtype calm.

- **Anti-references**:
  - **Mint / Cleo / Copilot Money** — too much personality, too many gradients and emojis, too "fintech-y."
  - **YNAB** — too dense, too power-user. Wrong vibe for a daily tracker.
  - **Anything with a streak counter, gamification, mascots, or a chart with more than two colors.**

## Existing Patterns

The mobile app already has scaffolding to build on. The redesign extends, does not replace.

- **Typography**: System default (no custom font loaded). v1 standardizes on **system font** (SF Pro on iOS, Roboto on Android) with a tabular-numeric variant for monetary values.
- **Colors today**: Slate-based light theme — bg `#f8fafc`, text `#1e293b`, muted `#64748b`. v1 will reset this to a warmer near-monochrome palette during Phase 4.
- **Spacing**: Ad-hoc (`16/24/32` in StyleSheet). v1 will introduce a token scale.
- **Components (mobile, exist)**: `Button`, `Input`, `Label`, `Select`, `Switch`, `CurrencyInput`, `ProgressIndicator` — all in `apps/mobile/src/components/`.
- **Screens (mobile, exist)**: `BudgetWizard` (orchestrator), `IncomeSetupScreen`, `PriorityExpensesScreen`, `SavingsAllocationScreen`, `SafeToSpendScreen`, `FlexibleBucketsScreen`, `MonthlyReflectionScreen`, `CompletedPlanScreen`.
- **Shared core**: `@budgetplanner/core` — types (`IncomeSource`, `PriorityExpense`, `SavingsEntry`, `BucketsData`, `ReflectionData`, `SplitPlan`) and math (`calcTotalIncome`, `calcTotalPriorities`, `calcSavingsTotal`, `calcSafeToSpend`, `calcSplitPlan`). All shared logic stays here — the redesign is a mobile-presentation rewrite.
- **Persistence**: AsyncStorage key `budgetplanner:mobile:v1`. v1 extends the schema to add a `transactions` array and `month` cycle metadata (designed in Phase 3).
- **Navigation**: React Navigation native-stack with `BudgetWizard` + `CompletedPlan`. v1 introduces a tab navigator around a new `Home` tab.

## Component Inventory

| Component | Status | Notes |
| --- | --- | --- |
| `Button` | Modify | Restyle to match new tokens. Tap-target ≥ 44pt. |
| `Input` | Modify | Restyle. Add a large-numeric variant for amounts. |
| `Label` | Modify | Restyle for new type scale. |
| `Select` | Modify | Restyle. Used in currency picker, category picker. |
| `Switch` | Modify | Restyle. |
| `CurrencyInput` | Modify | Becomes the centerpiece of fast-log; needs a number-pad keyboard mode. |
| `ProgressIndicator` | Modify | Restyle as monochrome dot row; remove sky-blue accent. |
| `IncomeSetupScreen` | Modify | Tone & layout rewrite for native-feeling onboarding. |
| `PriorityExpensesScreen` | Modify | Same. |
| `SavingsAllocationScreen` | Modify | Same. |
| `SafeToSpendScreen` | Modify | Becomes a confirmation moment, not a step. |
| `FlexibleBucketsScreen` | Modify | Editable split preset lives here. |
| `MonthlyReflectionScreen` | Modify | Re-roled as the **month-close** screen, not a wizard step. |
| `CompletedPlanScreen` | Modify | Re-purposed as the **first-time confirmation** that hands off to Home. |
| **`HomeScreen`** | New | Plan-vs-actual hub. The center of the app. |
| **`CategoryDetailScreen`** | New | Tap a category bar → list of transactions in that bucket. |
| **`FastLogSheet`** | New | Bottom sheet for adding a transaction. Floats over every tab. |
| **`MonthCloseScreen`** | New | End-of-month reflection + roll-forward confirmation. |
| **`SetupRitual`** | New | Wrapper that runs the existing wizard screens with a new shell — currency picker first, then the six steps, then "you're set." |
| **`TabBar`** | New | Two tabs: Home, Activity. (Setup and Close are modal flows, not tabs.) |
| **`TransactionRow`** | New | Reusable row for activity lists. |
| **`CategoryBar`** | New | Plan-vs-actual horizontal bar with category dot. |
| **`AmountDisplay`** | New | Wrapper that handles tabular numerals, currency symbol placement, and large-number truncation consistently. |
| **`CurrencyPicker`** | New | First-run modal. Searchable list of currencies. |

## Key Interactions

**First run.** Cold launch → `CurrencyPicker` modal (cannot be dismissed without a choice) → `SetupRitual` (the six existing wizard steps, restyled, with a "you can change this later" microcopy on each) → "You're set" confirmation → `Home`.

**Daily — fast log.** From any tab, tap the floating "+" → bottom sheet rises → amount field is auto-focused with the number-pad open → user types amount → category is pre-selected based on last-used; user can swipe or tap to change → optional 1-line note → "Log" button. Sheet collapses; the Home category bar animates the new fill. No confirmation toast — the bar moving *is* the confirmation. Total taps for a typical log: 3 (open, amount, log).

**Home glance.** A `Home` screen visit always answers: *Today's safe-to-spend, four category bars (plan vs. actual), days remaining in this cycle, last three transactions.* No graphs, no filters, no time toggles. Tapping a category bar opens `CategoryDetailScreen`.

**Category detail.** Header: category name, allocation, spent, remaining. List: every transaction in that bucket this month, newest first, grouped by day. Swipe-left on a transaction to delete; tap to edit category or amount.

**Month-end.** On the last day of the month (or first launch of a new month), the app surfaces a non-blocking banner on Home: "Close out [month]." Tap → `MonthCloseScreen` → three short reflection prompts (the existing tight / flexible / intentional) → "Roll forward" button → next month created with priorities and savings carried over; user can edit before confirming → Home.

**Editing the plan mid-month.** Available, but tucked under a "Adjust plan" action on Home (not a tab). Opens the relevant setup screen for that category. Saving updates the current cycle in place.

## Responsive Behavior

This is a phone-first native app. Three breakpoints inside React Native:

- **Compact (≤ 375pt width, iPhone SE / mini)**: Single-column. Type scales down one step. The hero number on Home stays large but caption text tightens.
- **Default (376–428pt, modern iPhones)**: Reference design. All proportions native.
- **Wide (≥ 600pt, tablets, large foldables)**: Center the content column at a max width of 520pt. The setup ritual occupies the centered column; Home keeps category bars at the centered width with extra surrounding whitespace. **No multi-column layouts** — preserving the calm hierarchy beats using the extra space.

Orientation: portrait only in v1. Locked via `app.json`.

## Accessibility Requirements

- **Contrast**: WCAG 2.1 AA on all text. Body copy ≥ 4.5:1, large numerals ≥ 3:1. Category accent dots are decorative — never the sole indicator of category (always paired with the category name).
- **Type**: Honor iOS Dynamic Type and Android font scale up to the **Large (1.3×)** step. The hero number on Home reflows; category bars wrap labels above the bar on the largest steps instead of truncating.
- **Tap targets**: Minimum 44 × 44pt for every interactive element. Spacing between adjacent tap targets ≥ 8pt.
- **VoiceOver / TalkBack**: Every monetary value has an accessibility label that reads naturally ("Eighty-five dollars left in Essentials, twelve days remaining"). Category bars are announced as "Category, plan, spent, remaining" — not as a visual bar.
- **Motion**: Honor "Reduce Motion" — disable bar fill animations and sheet rise animation; replace with instant transitions.
- **Focus management**: Opening the fast-log sheet moves screen-reader focus to the amount field; closing returns it to the "+".

## Out of Scope

Explicitly **not** in v1. These will not be designed or built in this pass, and the brief should not be expanded to cover them mid-flow:

- **Bank account sync (Plaid / Mono / Open Banking).** All transactions are manual.
- **Receipt OCR / photo capture.**
- **Recurring transactions** (auto-create rent, subscriptions). User re-adds these next month.
- **Home-screen widgets** (iOS / Android native widgets).
- **Push notifications, reminders, daily summaries.**
- **Insights / analytics screens** ("you spent 40% more on Rewards"). Avoid the rabbit hole.
- **Multi-user / shared budgets / couples mode.**
- **Cloud sync, accounts, login, password reset.** Local-only.
- **iCloud / Google Drive backup.** Manual export as v2.
- **Dark mode.** Light only in v1. System-mode auto dark is v2 — tokens will be authored to make it trivial later.
- **Multiple concurrent budgets** (e.g., personal + business). One active budget at a time.
- **Goals beyond savings categories** (e.g., "save $5k for a car"). Savings entries already cover this.
- **Currency conversion / multi-currency budgets.** A single currency per budget; the picker only sets the symbol & formatting.
- **Charts beyond the category bars and a single progress arc.**
- **Onboarding tours / tooltips / coach marks.** The setup ritual is the tour.
- **Web parity.** The existing `src/app/` web app is out of scope this pass. (The orphaned weather code in `src/app/App.tsx` is left alone — to be cleaned up separately.)

## Open Items (deferred to later phases)

- Exact category accent palette → **Phase 4: Design Tokens**
- Type scale numbers → **Phase 4: Design Tokens**
- Whether "fast log" auto-categorizes silently or always shows the category chip → **Phase 3: Information Architecture** (likely "shows chip, pre-filled, one-tap to change")
- AsyncStorage schema migration plan from existing `budgetplanner:mobile:v1` key → **Phase 5: Brief to Tasks**
- Activity tab content & filtering → **Phase 3: Information Architecture**
