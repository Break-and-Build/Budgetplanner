# Information Architecture: Budget Tracker (Mobile v1)

This IA defines the structural skeleton for the mobile redesign. It extends the existing `apps/mobile/` React Navigation setup rather than replacing it: the current native-stack (`BudgetWizard` → `CompletedPlan`) becomes one of three modal flows underneath a new bottom-tab root.

## Site Map

A hierarchical map of every screen. The app is a phone app, so "URL pattern" is the React Navigation route name + params.

- **Root Stack** (native-stack, headerless)
  - **First-Run** `FirstRun` — only on cold launch with no stored data; auto-skipped otherwise
    - `FirstRun/CurrencyPicker` — modal, cannot be dismissed without choice
  - **Main Tabs** `MainTabs` (bottom-tab navigator, persistent FAB on Home & Activity)
    - **Home** `MainTabs/Home`
      - `MainTabs/Home/CategoryDetail?category=:cat` — push from a category bar tap
      - `MainTabs/Home/AdjustPlan` — push, opens plan editor (Setup screens in "edit" mode)
      - `MainTabs/Home/Settings` — modal sheet from gear icon
        - `Settings/Currency` — push within modal
        - `Settings/ResetMonth` — push within modal, confirm sheet
        - `Settings/About` — push within modal
    - **Activity** `MainTabs/Activity`
      - `MainTabs/Activity/TransactionDetail?id=:txId` — push, edit/delete single transaction
  - **Setup Ritual** `SetupRitual` — modal flow, presented full-screen with swipe-down to dismiss disabled
    - `SetupRitual/Income` (step 1 of 6)
    - `SetupRitual/Priorities` (step 2 of 6)
    - `SetupRitual/Savings` (step 3 of 6)
    - `SetupRitual/SafeToSpend` (step 4 of 6) — confirmation moment, not data entry
    - `SetupRitual/Buckets` (step 5 of 6) — includes editable split preset
    - `SetupRitual/Reflection` (step 6 of 6) — for *next-month* setup; skipped on first-ever run
    - `SetupRitual/Confirmation` — "You're set" hand-off to Home
  - **Month Close** `MonthClose` — modal flow, only when triggered
    - `MonthClose/Reflection` — three reflection prompts
    - `MonthClose/RollForward` — review carried-over priorities/savings, edit, confirm
  - **Fast Log Sheet** `FastLogSheet` — bottom sheet, not a route. Presented over Home or Activity. Auto-focused amount field, category chip, optional note, Log button.

### Modal vs. Tab decision rule

Three flows are **modal stacks** layered over the tabs:

1. **Setup Ritual** — a deliberate 3-minute commitment. It owns the screen; tabs disappear; back-swipe is suppressed mid-flow.
2. **Month Close** — same posture: ritual, focus, not interruptible.
3. **Settings** — a sheet, not a flow. Dismissable.

Everything else lives inside tabs. The tab bar always shows on `Home` and `Activity`; never on Setup, Close, or Fast Log Sheet.

## Navigation Model

- **Primary navigation**: A two-item bottom tab bar.
  - `Home` (default)
  - `Activity`
  - **Max items**: 2. We deliberately resist a third tab. Settings is a gear icon on Home; Setup and Close are events, not destinations.

- **Secondary navigation**: Contextual stacks within each tab.
  - On `Home`: gear icon (top-right) → Settings modal · "Adjust plan" link (under category bars) → AdjustPlan stack · tap any category bar → CategoryDetail
  - On `Activity`: filter chips row (All · Essentials · Growth · Stability · Rewards) · search icon (top-right) · tap any transaction → TransactionDetail

- **Utility navigation**: Settings modal contains Currency, Reset Current Month, About. No persistent utility nav — these are rare-access.

- **Floating action**: A single circular "+" FAB anchored bottom-right above the tab bar, visible only on `Home` and `Activity`. Tapping presents `FastLogSheet`. The FAB has a 56pt diameter, 16pt margin from screen edges, drop shadow at elevation 4. **Not** a brand-colored "+" — the FAB is monochrome ink-on-paper to stay inside the Apple-Wallet vibe.

- **Mobile navigation pattern**: Native iOS/Android bottom tab bar (React Navigation's `bottom-tabs`). Icons + labels always visible (never icons-only — the app is rarely opened, labels reinforce). The tab bar uses a hairline 1px top border, no fill blur in v1 (defer "frosted glass" until we have content density that warrants it).

- **No drawer, no hamburger, no header navigation.** Headers are screen-titles-only.

## Content Hierarchy

For each major screen, the priority order of content from top to bottom.

### Home

1. **Today's safe-to-spend** — single huge number. Caption: "left to spend today · 12 days to go". *This is the answer to the question that brings users in.*
2. **The four category bars** — Essentials, Growth, Stability, Rewards. Each shows label, allocated, spent (as a bar fill), and remaining in tabular numerals. Bars are stacked vertically, full-width minus padding. *Lets users see at a glance which bucket is healthy and which is leaking.*
3. **Recent activity** — last 3 transactions, with "See all" → switches to Activity tab. *Closes the loop between "I logged this" and "did it land?"*
4. **Adjust plan** link, low-emphasis text button. *Available, not promoted. Mid-month edits are rare.*
5. **Month-close banner** — appears only from the 28th onward, or on first launch in a new calendar month if previous wasn't closed. Slides in below the safe-to-spend number, dismissable for the session but reappears next launch until closed.

Above-the-fold on a 390pt-wide iPhone: safe-to-spend, days-left caption, all four category bars. "Recent activity" and "Adjust plan" sit below the fold deliberately — they're available without scrolling on tall phones but never compete with the hero number.

### Activity

1. **Filter chips row** — sticky at top. Default: "All". *Lets users narrow the firehose without leaving the tab.*
2. **Transaction list** — grouped by day (today · yesterday · day-of-week up to 7 days back · exact date thereafter). Each row: amount (right-aligned, tabular), category dot + name, note (if any), time. Tap → TransactionDetail.
3. **Empty state** — "No transactions yet. Tap + to log your first." (Replaces list when filter has zero matches or month is fresh.)

### CategoryDetail (per-category)

1. **Header** — category name + dot. Below: allocated · spent · remaining, three big numbers in a row.
2. **Mini progress arc** — single category's progress around the month, with a thin "today" tick mark. *Only chart in the app.*
3. **Transaction list for this category, this month** — same row pattern as Activity, no filter chips needed.
4. **"Adjust [Category]" link** — opens AdjustPlan stack at this category.

### Setup Ritual screens

Each step has the same hierarchy:

1. **Step caption** — "Step 2 of 6 · Priorities". Small, near top.
2. **Question** — one short sentence in the largest type on screen. ("What bills do you have to pay?")
3. **Input area** — list + "Add" button, or single field, depending on step.
4. **Running total** — small caption ("Total: ₦240,000") above the action button.
5. **Action button** — sticky bottom: "Continue". Disabled until step is valid.

### MonthClose / Reflection

1. **Hero**: "How was [Month]?" Single sentence.
2. **Three prompts**: Where was it tight? Where did it feel flexible? What was intentional? Each a multiline text field.
3. **Continue** → RollForward.

### MonthClose / RollForward

1. **Hero**: "Carry forward to [NextMonth]?"
2. **Three review cards**: Priorities · Savings · Buckets. Each shows what will be carried, with an "Edit" button.
3. **Confirm** button.

### Settings (modal)

1. **Currency** — current selection, tap to change. *Most-likely-touched. Top.*
2. **Reset current month** — destructive action, confirmation sheet. *Used to start over.*
3. **About** — version, attributions, link to GitHub.

## User Flows

### Flow 1: First-time setup (cold install)

1. User opens app. No stored data detected → root pushes `FirstRun`.
2. `FirstRun/CurrencyPicker` modal appears — list of currencies, search input. Cannot be dismissed.
   - If a currency is selected → currency saved, root replaces with `SetupRitual` (no `Reflection` step on first-ever run).
3. `SetupRitual/Income` — user adds at least one income source. "Continue" enabled when valid.
4. `SetupRitual/Priorities` — same shape. User can skip via "I have none" link.
5. `SetupRitual/Savings` — switch to enable; if enabled, add at least one entry.
6. `SetupRitual/SafeToSpend` — no inputs. Just shows the computed remainder, with the math broken down. User taps "Looks good".
7. `SetupRitual/Buckets` — user reviews the auto-split (50/25/15/10 default, **editable**). Bars animate to reflect ratio changes.
8. `SetupRitual/Confirmation` — "You're set." Two-second auto-advance OR tap → root replaces with `MainTabs/Home`.

Edge case: app force-closed mid-setup → on next open, `BudgetWizard` (existing) already resumes from last step via AsyncStorage. New `SetupRitual` preserves that behavior via the existing `currentStep` field in the schema.

### Flow 2: Daily fast log

1. User on `Home` or `Activity`. Taps "+" FAB.
2. `FastLogSheet` rises from bottom. Amount field auto-focused; number-pad keyboard open. Category chip below shows last-used category, pre-selected. Note field below (optional, single line).
3. User types amount. Optionally taps category chip → category picker appears inside the sheet, returns to amount + new category. Optionally taps note → keyboard switches to text.
4. User taps "Log".
   - If amount > remaining in selected category → silent "over budget" treatment (the category bar fills to allocation and the overflow is shown in a subtle red caption below the bar on Home — **no modal interruption, no "are you sure?"**).
   - If amount is 0 or empty → button stays disabled.
5. Sheet collapses. On `Home`, the selected category bar animates the new fill. On `Activity`, the new row slides in at the top.

Total taps for a coffee-shop log: 3 (FAB · amount digits via numpad · Log).

### Flow 3: Tap a category bar (Home → Detail)

1. User taps a category bar on Home.
2. Push `CategoryDetail?category=Essentials`.
3. User sees the per-category breakdown. May tap "Adjust Essentials" → opens AdjustPlan focused on that bucket; saving returns here.
4. User swipes back → Home.

### Flow 4: Edit / delete a transaction

1. From `Activity` or `CategoryDetail`, user taps a transaction row.
2. Push `TransactionDetail`. Fields: amount, category, note, date. Save button + delete (destructive, confirmation sheet).
3. User edits → Save → previous screen, with optimistic update.
4. Or: user swipes-left on a row in Activity → reveals "Delete" action. Tap → undo snackbar at bottom for 4 seconds.

### Flow 5: Month-end close

1. From the 28th onward, banner appears on Home: "Close out [Month]". Dismiss = "Not yet". Tap = open `MonthClose`.
2. *Alternative trigger*: first app launch in a new calendar month where previous wasn't closed → on Home appearance, banner is already there with the previous month's name.
3. `MonthClose/Reflection` — three prompts. User fills; "Continue" enabled when at least one prompt has content (the others can be empty).
4. `MonthClose/RollForward` — review priorities, savings, buckets. User can tap "Edit" on any card → temporarily pushes the relevant Setup screen in carry-forward edit mode, returns here.
5. User taps "Start [NextMonth]" → previous month is archived in storage; current month resets to the carried-forward plan; balances zeroed; Home re-renders.

### Flow 6: Returning user, cold launch mid-month

1. App opens. Stored data exists, current month is still active → root replaces straight to `MainTabs/Home`. No splash beyond the system splash.
2. Home shows current state. Banner only if month is closing or overdue.

### Flow 7: Mid-month plan adjustment

1. From Home, user taps "Adjust plan" → `AdjustPlan` stack opens, listing the same setup steps but with current values pre-filled.
2. User edits any step → Save → returns to Home with bars recalculated.
3. **No "are you sure"** — the plan is meant to be living. Changes apply immediately; an "Undo" snackbar appears for 4 seconds after Save.

## Naming Conventions

The vocabulary should be consistent across UI copy, accessibility labels, code, and analytics.

| Concept | Label in UI | Notes |
|---------|-------------|-------|
| The thing the user logs | **Transaction** | Not "expense," not "spend," not "entry." "Transaction" is neutral and matches industry mental model. Internal code: `Transaction`. |
| One of the four buckets | **Category** | Not "bucket" in UI. (The brief uses "bucket" colloquially.) Internal code: `Category`. |
| The four specific categories | **Essentials · Growth · Stability · Rewards** | Capitalized in UI. Never abbreviated. |
| Money that's left to spend | **Safe to spend** | Lowercased mid-sentence ("safe to spend today"), capitalized as a noun on its own. |
| The recurring bills entered in setup | **Priorities** | Not "bills," not "fixed costs." The product's POV. |
| The remainder after priorities + savings | **Flexible budget** | Used once on the Buckets step. Elsewhere, just refer to the four categories. |
| The budgeting period | **Month** or **this month** | Not "cycle," not "period." Calendar month always. |
| The month-end ritual | **Close out** | "Close out March." Active verb. Never "wrap up," never "review." |
| Starting next month | **Roll forward** | Active. "Roll forward to April." |
| The plan editor mid-month | **Adjust plan** | Not "edit budget," not "update plan." |
| Currency selection | **Currency** | Singular. Setting label and modal title both. |
| First-time setup | **Set up your month** | Used as the title of the first SetupRitual screen on cold install. |
| Subsequent month-start | **Start the month** | Used after rollforward. Different from first-run to signal continuity. |

## Component Reuse Map

Structural components shared across screens. Visual components (Button, Input, etc.) are tracked in the brief; this table is about layout & flow primitives.

| Component | Used on | Behavior differences |
|-----------|---------|----------------------|
| `TabShell` (top-level layout w/ tab bar + FAB) | Home, Activity | FAB visible on both, tab bar always shown. |
| `ModalStackShell` (full-screen modal w/ progress dots top, sticky action bottom) | All `SetupRitual/*`, all `MonthClose/*` | Progress dots reflect step count (6 for Setup, 2 for MonthClose). |
| `ScreenHeader` (large title + optional left/right icons) | Home, Activity, CategoryDetail, TransactionDetail, Settings | Settings uses a "Done" right action instead of gear; CategoryDetail uses back chevron left. |
| `AmountDisplay` | Home (hero), CategoryDetail (header), TransactionRow, FastLogSheet | Same component, three sizes (hero, lg, md). Tabular numerals everywhere. |
| `CategoryBar` | Home (4 instances), CategoryDetail (1 instance, larger), AdjustPlan (read-only preview) | Same component, two sizes (compact, expanded). |
| `CategoryDot` | Activity rows, CategoryDetail header, FastLogSheet chip, filter chips | Single component, single size (8pt circle). |
| `TransactionRow` | Activity list, Home recent activity, CategoryDetail list | Identical in all three contexts. |
| `DayHeader` ("Today" / "Yesterday" / date) | Activity, CategoryDetail | Same. |
| `BottomSheet` shell | FastLogSheet, Settings/Reset confirmation, swipe-left "Delete" confirmation | Standard React Native bottom sheet, three sizes. |

## Content Growth Plan

What grows over time and how the IA accommodates it:

- **Transactions** are unbounded. Activity tab loads in pages of 50, lazy-loads on scroll. CategoryDetail shows current-month only — no infinite scroll needed at the category level.
- **Months** accumulate one per cycle. v1 does not surface past months in the UI; closed months are stored in AsyncStorage under a `months[]` key with a `closedAt` timestamp. **v2** will introduce a "History" view, likely reached from Settings. v1 intentionally hides this to keep IA flat — even though the data is preserved.
- **Priorities** and **savings entries** are small (typically 3–10 each). No pagination. The Setup `Priorities` step renders all as a vertical list.
- **Currencies** in the picker are a fixed dataset bundled with the app. No growth.

This IA is therefore essentially **flat and bounded** — the only unbounded list is transactions, and only one screen (Activity) has to handle scale.

## URL Strategy (React Navigation route names)

Mobile app, so "URL" = `navigationRef.navigate(routeName, params)`.

- **Pattern**: `RouteName` (PascalCase). Nested routes: `Parent/Child` is conceptual only; React Navigation uses flat route names within each navigator.
- **Dynamic segments**: passed as params, never embedded in route names.
  - `CategoryDetail` → `{ category: 'essentials' | 'growth' | 'stability' | 'rewards' }`
  - `TransactionDetail` → `{ id: string }` (transaction id, uuid)
  - `AdjustPlan` → `{ focus?: 'income' | 'priorities' | 'savings' | 'buckets' }` (which step to land on)
- **Query parameters**: not used in v1. (Filter chip state on Activity is internal screen state, not a route param — survives backgrounding via React state, intentionally reset on cold launch.)
- **Deep linking**: not configured in v1. (When v2 adds the home-screen widget, deep links will follow `budgetplanner://home`, `budgetplanner://log`, `budgetplanner://category/:cat` — but these are deferred.)

## Resolved Open Items from Brief

- **Fast-log auto-categorize behavior**: pre-fills with last-used category, shows the category chip below the amount field, one tap to change. Resolved in Flow 2.
- **Activity tab content & filtering**: chronological feed of all transactions, grouped by day; filter chips by category; search icon for amount/note text search. Resolved in Content Hierarchy → Activity.
- Other open items (category palette, type scale, schema migration) carry forward to Phase 4 and Phase 5.
