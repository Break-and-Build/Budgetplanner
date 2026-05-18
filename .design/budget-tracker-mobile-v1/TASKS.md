# Build Tasks: Budget Tracker (Mobile v1)

Generated from: `.design/budget-tracker-mobile-v1/DESIGN_BRIEF.md`, `INFORMATION_ARCHITECTURE.md`, `DESIGN_TOKENS.md`
Date: 2026-05-17

This list is ordered so each task can be built, visually verified, and committed on its own. Phase 6 should work top-to-bottom. Numbering is for cross-reference, not strict ordering inside a group — within a group, pick whichever next.

**Build target**: `apps/mobile/` only. Web (`src/app/`) is out of scope per the brief.

**Aesthetic anchor** (applies to every task): _Apple-Wallet calm — warm-neutral monochrome surfaces, four muted category accents, system font with tabular numerals, soft shadows, no illustrations, no chart heavier than a single progress arc._

---

## Foundation

### F1. Storage schema v2 + transaction model
- [ ] Extend `@budgetplanner/core` with a `Transaction` type (`id`, `amount`, `categoryId`, `note?`, `loggedAt`, `monthKey`) and a `MonthState` type (`monthKey`, `plan`, `transactions[]`, `reflection?`, `closedAt?`). Add a `schemaVersion: 2` field at the top of the persisted blob. Write a `migrateV1ToV2(raw)` function in core that takes the existing `budgetplanner:mobile:v1` shape and produces a v2 blob whose current-month plan equals the v1 wizard state with zero transactions. Add unit-style assertion tests inline.
- _Modifies: `packages/core/src/types.ts`, `packages/core/src/calculations.ts`, `packages/core/src/index.ts`. New file: `packages/core/src/storage.ts` (pure functions only — no AsyncStorage import here)._
- **Verify**: feed a sample v1 blob; output validates against new types and round-trips cleanly.

### F2. Theme provider & reduce-motion hook
- [ ] Add `apps/mobile/src/theme/ThemeProvider.tsx` that exposes `tokens` via context (forward-compatible with v2 dark swap). Add `useTokens()` hook. Add `useReducedMotion()` hook that wraps `AccessibilityInfo.isReduceMotionEnabled()` + listener, returning a number multiplier `0 | 1` for duration scaling.
- _New: `apps/mobile/src/theme/ThemeProvider.tsx`, `apps/mobile/src/theme/useReducedMotion.ts`._
- **Verify**: a throwaway `<Text>{JSON.stringify(useTokens().color.bg)}</Text>` renders.

### F3. Install navigation & gesture dependencies
- [ ] Add `@react-navigation/bottom-tabs` to `apps/mobile/package.json` (the native-stack is already present). Verify `react-native-gesture-handler` and `react-native-reanimated` are installed — both are required by the bottom-sheet behavior in F11. Update `babel.config.js` if reanimated plugin is missing.
- _Modifies: `apps/mobile/package.json`, possibly `apps/mobile/babel.config.js`._
- **Verify**: `npm install` runs clean; existing `BudgetWizard` still renders unchanged after a Metro reset.

### F4. Restyle existing primitives to tokens
- [ ] Update `Button`, `Input`, `Label`, `Select`, `Switch`, `CurrencyInput`, `ProgressIndicator` in `apps/mobile/src/components/` to consume `tokens` instead of hardcoded colors/sizes. Each becomes monochrome (no sky-blue). Tap targets ≥ 44pt. `CurrencyInput` gains a `largeNumeric` size variant (uses `type.hero`). `ProgressIndicator` becomes a row of small monochrome dots — no fill colors.
- _Modifies: 7 existing files. No API changes._
- **Verify**: drop each into a throwaway screen and confirm it reads as "system app, not Bootstrap."

### F5. New visual primitives — atoms
- [ ] Build six new atom components, each with a Storybook-like example screen in `apps/mobile/src/components/__demo__/`:
    - `AmountDisplay` — three sizes (`hero`, `lg`, `md`), respects `fontVariant: tabular-nums`, currency-symbol-aware (₦, $, €, etc.), truncates large numbers with thousand separators.
    - `CategoryDot` — 8pt circle, single `categoryId` prop, reads from `tokens.color.category`.
    - `DayHeader` — "Today" / "Yesterday" / "Wed, May 13" / "May 3" with the rules from IA (≤ 7 days uses weekday).
    - `ScreenHeader` — large title + optional left/right icon-button slots. Honors safe-area top.
    - `TransactionRow` — amount (right), category dot + name, note (truncated), time. Tap target ≥ 44pt height.
    - `CategoryBar` — horizontal bar with allocated/spent fill, label, remaining caption. Two sizes (`compact`, `expanded`). **Animated fill** uses `tokens.motion.easing.spring` at `slow` duration; respects reduce-motion.
- _New: 6 files under `apps/mobile/src/components/`._
- **Verify**: each demo screen renders cleanly on iPhone 14 simulator.

### F6. Layout shells — TabShell & ModalStackShell
- [ ] Build `TabShell` (wraps a screen with safe-area, screen padding, optional FAB anchor) and `ModalStackShell` (full-screen modal frame with progress dots top, sticky action bar bottom, suppressed back-swipe mid-flow). Both consume tokens for spacing and shadows.
- _New: `apps/mobile/src/components/TabShell.tsx`, `apps/mobile/src/components/ModalStackShell.tsx`._
- **Verify**: render `<TabShell><Text>hi</Text></TabShell>` and `<ModalStackShell step={2} totalSteps={6} actionLabel="Continue"><Text>hi</Text></ModalStackShell>` in a throwaway route.

### F7. Bottom sheet primitive
- [ ] Build a hand-rolled `BottomSheet` component using `Modal` + `Animated` (no extra library — v1 budget). API: `<BottomSheet visible onDismiss snapPoints={['auto']}>{children}</BottomSheet>`. Backdrop fade in/out, sheet rises with `tokens.motion.easing.decelerate` at `base` duration. Reduce-motion: instant appear/dismiss. Swipe-down to dismiss (gesture-handler).
- _New: `apps/mobile/src/components/BottomSheet.tsx`._
- **Verify**: open from a throwaway button; swipe-down dismisses; backdrop tap dismisses; reduce-motion swaps to instant.

### F8. Navigation refactor — root stack + tabs
- [ ] Rewrite `apps/mobile/App.tsx`'s navigator. New shape:
    - `RootStack` (native-stack, headerless) → `FirstRun` (conditional) → `MainTabs` (bottom-tabs) → modal flows `SetupRitual`, `MonthClose`, plus pushed screens `CategoryDetail`, `TransactionDetail`, `AdjustPlan`, `Settings`.
    - `MainTabs` has two tabs: `Home`, `Activity`.
    - Tab bar uses tokens. FAB rendered in `TabShell` (not inside the tab bar itself).
- Update `apps/mobile/src/types/navigation.ts` with the new `RootStackParamList`, `MainTabsParamList` per route names in IA.
- Each tab/screen renders a placeholder `<Text>` so the skeleton is verifiable before content arrives.
- _Modifies: `apps/mobile/App.tsx`, `apps/mobile/src/types/navigation.ts`._
- **Verify**: app launches, tab bar switches between two empty tabs, "+" FAB shows on both.

---

## Core UI

> **Build order rationale**: Home is built first (right after foundation) because it's the headline aesthetic. Validating the brief here lets us course-correct cheaply before investing in setup and modals.

### C1. Home screen — happy path with mock data
- [ ] Implement `HomeScreen` using `TabShell` + the F5 primitives. Hero `AmountDisplay` for today's safe-to-spend with the "left to spend today · 12 days to go" caption. Four `CategoryBar`s stacked. "Recent activity" section showing last 3 `TransactionRow`s with a "See all" link to the Activity tab. Gear icon top-right (navigates to `Settings`). "Adjust plan" link below category bars.
- For this slice, **read from a hardcoded mock month** (real persistence wires in C8). The number flows top-down: hero → bars → recents.
- _New: `apps/mobile/src/screens/HomeScreen.tsx`._
- **Verify**: home renders cleanly on iPhone 14 / SE / iPad simulators, all numerals are tabular, bars sit at equal lightness.

### C2. FastLogSheet — log a transaction
- [ ] Implement `FastLogSheet` using `BottomSheet`. Auto-focus amount field with number-pad keyboard on open. Category chip below amount (default: last-used; tap to switch — picker appears inline inside the sheet). Optional 1-line note input. "Log" button disabled until amount > 0.
- On `Log`: optimistically prepend transaction to in-memory store, fire the bar-fill animation on Home, close sheet. **No toast** — the bar moving is the confirmation.
- For this slice, store transactions in an in-memory provider (real persistence wires in C8).
- _New: `apps/mobile/src/screens/FastLogSheet.tsx`, `apps/mobile/src/state/BudgetContext.tsx` (provisional in-memory)._
- **Verify**: from Home, tap "+", type "850", tap "Log". Sheet collapses; the Rewards bar fills further; the new transaction appears in Recent activity above the fold.

### C3. Activity screen
- [ ] Implement `ActivityScreen` using `TabShell`. Sticky filter chips row at top (`All`, `Essentials`, `Growth`, `Stability`, `Rewards`). Search icon top-right opens an inline search field that filters by note text. Transaction list grouped by day with `DayHeader`s. Empty state when no transactions exist for the active filter. Page size 50, lazy-load on scroll.
- _New: `apps/mobile/src/screens/ActivityScreen.tsx`._
- **Verify**: filter narrows the list; "All" restores; empty state appears with one category filter on a fresh month; long list scrolls smoothly.

### C4. CategoryDetail screen
- [ ] Implement `CategoryDetailScreen`, pushed from a Home `CategoryBar` tap or a `TransactionRow` tap via `TransactionDetail` back-stack. Header: category name + dot, then three big numbers (allocated · spent · remaining). Single mini progress arc (the only chart in the app) — a thin stroke around a circle with a "today" tick mark. Below: transactions list for this category, this month, newest first. Footer: "Adjust [Category]" link → `AdjustPlan`.
- _New: `apps/mobile/src/screens/CategoryDetailScreen.tsx` and a small `MiniProgressArc` component._
- **Verify**: arc fills proportionally; today-tick is positioned correctly; back-swipe returns to Home with the bar still in sync.

### C5. TransactionDetail screen
- [ ] Implement `TransactionDetailScreen`. Form fields: amount (`CurrencyInput.largeNumeric`), category (segmented picker), note, date. Save (primary) + Delete (destructive, opens a confirmation `BottomSheet`).
- Editing optimistically updates Home / Activity; deleting triggers the undo snackbar (built in S4).
- _New: `apps/mobile/src/screens/TransactionDetailScreen.tsx`._
- **Verify**: editing the amount reflects on the back stack; deletion fires the undo snackbar.

### C6. Setup Ritual — refactor existing wizard screens into the new shell
- [ ] Wrap the six existing wizard screens (`IncomeSetupScreen`, `PriorityExpensesScreen`, `SavingsAllocationScreen`, `SafeToSpendScreen`, `FlexibleBucketsScreen`, `MonthlyReflectionScreen`) inside `ModalStackShell`. Restyle each to match the per-step content hierarchy in the IA (step caption · question · input · running total · sticky action). Replace `BudgetWizard.tsx` as the orchestrator: it now drives a `SetupRitual` stack in the root navigator and ends on a new `SetupConfirmationScreen` ("You're set" — 2s auto-advance OR tap → replace stack with `MainTabs/Home`).
- `FlexibleBucketsScreen` gains an **editable split preset** UI (per Phase 1 decision) — four sliders or numeric inputs that re-distribute and animate the bars.
- _Modifies: `apps/mobile/src/screens/BudgetWizard.tsx`, all six step screens under `apps/mobile/src/screens/steps/`. New: `SetupConfirmationScreen.tsx`._
- **Verify**: cold-launch with no stored data lands in SetupRitual; completing all six steps hands off to Home.

### C7. CurrencyPicker — first-run gate
- [ ] Implement `CurrencyPicker` as a full-screen modal at the front of `SetupRitual` (or its own `FirstRun` stack — see IA). Bundled list of common currencies (`packages/core/src/currencies.ts` — flat list with code, symbol, name). Search field at top. Cannot be dismissed without a selection. Selection persists to the v2 storage blob and replaces the `SetupRitual` start step.
- _New: `apps/mobile/src/screens/CurrencyPickerScreen.tsx`, `packages/core/src/currencies.ts`._
- **Verify**: fresh install opens directly to currency picker; choosing a currency advances to `SetupRitual/Income` and the currency symbol appears everywhere immediately.

### C8. Real persistence — replace the C2 provisional store
- [ ] Build `apps/mobile/src/state/BudgetStore.ts` — a context+reducer that owns the v2 blob, hydrates from AsyncStorage on mount (running F1's `migrateV1ToV2` if a v1 blob is found), and persists on every state change with a 500ms debounce. Replace the provisional in-memory store from C2.
- Selectors: `useCurrentMonth()`, `useTransactionsForMonth(monthKey)`, `useCategoryTotals()`.
- _New: `apps/mobile/src/state/BudgetStore.ts`, `apps/mobile/src/state/selectors.ts`. Removes provisional `BudgetContext` from C2._
- **Verify**: log a transaction, force-quit, reopen — transaction still there. Wipe AsyncStorage, install a synthetic v1 blob, reopen — migrated cleanly to v2.

### C9. Month Close — Reflection + RollForward modal flow
- [ ] Implement `MonthClose` modal stack with two screens: `Reflection` (three text fields — tight/flexible/intentional) and `RollForward` (three review cards for priorities / savings / buckets, each with an "Edit" jump). Final "Start [NextMonth]" button archives the current month in `months[]`, creates a fresh `MonthState` with carried-forward plan, zeroes balances, returns to Home.
- Triggers: banner on Home from the 28th onward, OR first launch in a new calendar month if previous wasn't closed.
- _New: `apps/mobile/src/screens/MonthCloseReflectionScreen.tsx`, `apps/mobile/src/screens/MonthCloseRollForwardScreen.tsx`. Modifies `HomeScreen` to render the banner._
- **Verify**: manually fast-forward the system clock to the 28th; banner appears. Tap → flow runs end-to-end → Home re-renders with fresh balances.

### C10. Settings modal
- [ ] Implement `SettingsScreen` as a presented modal (not a tab). Three rows: **Currency** (tap → pushes `CurrencyPickerScreen` in edit-mode), **Reset current month** (destructive — confirmation BottomSheet → clears current `MonthState.transactions` and resets balances; does NOT clear plan or close prior months), **About** (version, attributions link, repo link).
- _New: `apps/mobile/src/screens/SettingsScreen.tsx`._
- **Verify**: gear icon on Home opens the modal; changing currency updates symbols everywhere on dismiss.

### C11. AdjustPlan modal
- [ ] Implement `AdjustPlan` as a modal stack that re-uses the C6 setup screens in "edit mode" — values are pre-filled from the current `MonthState.plan`, the step caption changes to "Editing · [Step]", the sticky action becomes "Save" (not "Continue"). Accepts a `focus?` param to land on a specific step.
- Saving updates the current month's plan in place (no archive). The Home bars recalculate on dismiss.
- _New: `apps/mobile/src/screens/AdjustPlanScreen.tsx` (thin wrapper that drives existing setup screens with `mode='edit'`). Modifies setup screens to accept a `mode` prop._
- **Verify**: tap "Adjust plan" on Home → land on the income step pre-filled; edit savings; save; Home bars update.

---

## Interactions & States

### S1. Over-budget treatment
- [ ] When a category's spent exceeds allocated, `CategoryBar` shows: bar fill clamped at 100% allocation, a small `status.overBudget` caption underneath ("`₦4,200 over`"). **No modal interruption, no "are you sure?" on log**. The same caption appears on Home, CategoryDetail, and the FastLogSheet category chip (as a small inline warning the next time the user logs to that category).
- _Modifies: `CategoryBar`, `HomeScreen`, `CategoryDetailScreen`, `FastLogSheet`._
- **Verify**: log a ₦200,000 Rewards transaction on a ₦80,000 allocation — caption appears immediately on Home without interruption.

### S2. Empty states
- [ ] Three empty states, all single-screen-quiet:
    - **Activity empty** — "No transactions yet. Tap + to log your first."
    - **Activity filter empty** — "Nothing here yet in [Category]."
    - **CategoryDetail empty** — same shape as Activity filter empty.
- No illustrations. Center-aligned `subhead` text, 64pt top padding. No "go back" CTA — the tab bar / back gesture is enough.
- _Modifies: `ActivityScreen`, `CategoryDetailScreen`._
- **Verify**: fresh install + finish setup → Activity tab is the empty state.

### S3. Month-end banner & trigger logic
- [ ] On `HomeScreen`, render a non-blocking banner above the category bars when EITHER: the system date is ≥ 28 of the current month, OR the system month differs from the active `monthKey`. Banner copy: "Close out [Month]." Two actions: "Not yet" (dismiss for session) · "Close out" (opens `MonthClose`). On a new-month-but-not-closed scenario, banner is undismissable for the session.
- _Modifies: `HomeScreen`. Pure logic in `packages/core/src/calculations.ts` (`shouldShowMonthCloseBanner(now, monthKey)`)._
- **Verify**: set device clock to May 30 → banner appears with "Close out May".

### S4. Undo snackbar
- [ ] Implement a global `UndoSnackbar` that appears at the bottom after a destructive action (delete transaction, save plan edit). 4-second auto-dismiss. Tap "Undo" → revert. Single global instance.
- _New: `apps/mobile/src/components/UndoSnackbar.tsx`. Modifies: `BudgetStore` to emit undoable actions; `TransactionDetailScreen`, `AdjustPlanScreen`, `ActivityScreen` swipe-delete._
- **Verify**: delete a transaction → snackbar slides up → "Undo" → row re-appears.

---

## Responsive & Polish

### R1. Wide-breakpoint layout
- [ ] On widths ≥ 600pt (iPad / large foldables), center the content column at `maxContentWidth: 520pt` with extra horizontal padding. **No multi-column layouts** per brief. Apply to `HomeScreen`, `ActivityScreen`, `CategoryDetailScreen`, all setup screens, all modal screens. Tab bar full-width; FAB position adjusts to align with the centered column's right edge.
- _Modifies: `TabShell`, `ModalStackShell`._
- **Verify**: iPad simulator — content column centered; FAB sits at column edge, not screen edge.

### R2. Dynamic Type / font-scale pass
- [ ] Honor iOS Dynamic Type and Android font-scale up to **1.3× (Large)**, hard-capped per `tokens.a11y.maxFontScale`. On `CategoryBar`, label wraps **above** the bar at the largest step instead of truncating. Hero `AmountDisplay` reflows (line-height grows) but never truncates digits.
- _Modifies: `AmountDisplay`, `CategoryBar`, `TransactionRow`, anywhere a label appears next to a numeric value._
- **Verify**: simulator with Accessibility → Larger Text → Large; no text clipped; bars still readable.

### R3. Accessibility pass
- [ ] Audit every screen per the brief's a11y section:
    - Every monetary value has a natural-language `accessibilityLabel` ("Eighty-five Naira left in Essentials, twelve days remaining").
    - Category bars are announced as "Category, plan, spent, remaining" — no visual-only meaning.
    - Tap targets ≥ 44pt × 44pt (audit via React Native a11y inspector).
    - Focus management: opening `FastLogSheet` moves screen-reader focus to the amount field; closing returns focus to the FAB.
    - Reduce-Motion honored on bar fill (instant), sheet rise (instant), and screen transitions (instant via `tokens.a11y.reduceMotionDurationMultiplier`).
    - Color is never the sole channel — category dots always paired with category name.
- _Modifies: every screen. No new files._
- **Verify**: VoiceOver pass on iPhone simulator — full setup → home → log a transaction → close-out — all surfaces announce sensibly.

### R4. Empty/error resilience cleanup
- [ ] Final sweep: every async call wrapped, every storage read defensive, every "what if there are no priorities yet" branch handled. No crashes on a freshly-installed device.
- _Modifies: any screen still missing guards._
- **Verify**: simulator → wipe data → first-run flow → Home → cold-quit → re-open. No crashes, no console warnings.

### R5. Visual QA pass on three devices
- [ ] iPhone SE (compact), iPhone 14 Pro (regular), iPad (wide). Verify all screens against the brief:
    - Apple-Wallet calm: no skeumorphism, no excessive color, no illustrations.
    - Category bars at equal lightness.
    - Type scale honored.
    - Spacing generous (especially on setup).
    - System font everywhere, tabular numerals on all amount displays.
- _No code change unless something fails the check — file a follow-up task._
- **Verify**: side-by-side comparison; any miss becomes its own follow-up task.

---

## Review

### Z1. Run `/design-review`
- [ ] Run `/design-review` to audit the built app against `DESIGN_BRIEF.md`. Capture screenshots into `.design/budget-tracker-mobile-v1/screenshots/`. Address any **must-fix** items inline; queue **nice-to-have** items for v1.1.

---

## Out-of-task notes (don't add as tasks)

These were considered and rejected for v1 per the brief — listed here only so reviewers don't ask:

- **The orphaned weather code in `src/app/App.tsx`** stays as-is. It's not in scope this pass; it'll be cleaned up in a separate PR.
- **Dark mode** is not a task — tokens are authored for the v2 swap; no component work yet.
- **Bank sync, recurring transactions, widgets, push, insights, OCR** — none of these are tasks. Re-read the brief's _Out of Scope_ before adding any.
- **Web parity** (`src/app/`) — out of scope. Don't touch it.
