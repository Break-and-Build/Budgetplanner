# Design Review: Budget Tracker (Mobile v1)

Reviewed against: [`DESIGN_BRIEF.md`](./DESIGN_BRIEF.md), [`INFORMATION_ARCHITECTURE.md`](./INFORMATION_ARCHITECTURE.md), [`DESIGN_TOKENS.md`](./DESIGN_TOKENS.md)
Philosophy: **Apple-Wallet calm**
Date: 2026-05-18

## Method

Code-level audit (every screen + primitive file, line-by-line) supplemented by 12 device screenshots in [`screenshots/`](./screenshots/). The web preview was intentionally not screenshotted — it's a design preview of the C1-era HomeScreen only and would have added more noise than signal.

## Screenshots Captured

| File | Screen | Notes |
| --- | --- | --- |
| `screenshots/IMG_6668.PNG` | Home (with mock data) | Today's safe-to-spend hero, 4 category bars |
| `screenshots/IMG_6669.PNG` | FastLogSheet | Sheet open, Growth selected, numeric keyboard, Log button disabled |
| `screenshots/IMG_6670.PNG` | Activity | Filter chips, "Today" group, single Airtime transaction |
| `screenshots/IMG_6671.PNG` | Setup · Income (edit mode) | Single Salary entry pre-filled |
| `screenshots/IMG_6672.PNG` | AdjustPlan menu | 4 section cards with totals |
| `screenshots/IMG_6673.PNG` | Setup · Savings (edit mode) | ₦200,000 amount entry |
| `screenshots/IMG_6674.PNG` | TransactionDetail + delete confirm | Filled-red Delete + Cancel sheet |
| `screenshots/IMG_6675.PNG` | Setup · Priorities (edit mode) | Form with X-to-remove icons |
| `screenshots/IMG_6676.PNG` | Settings | Currency / Reset / About cards |
| `screenshots/IMG_6677.PNG` | Setup · Buckets / split | Split editor with 4 percentages |
| `screenshots/IMG_6678.PNG` | Setup · Priorities (full list) | 7 priorities, total at bottom, Cancel + Save |
| `screenshots/IMG_6679.PNG` | Home (lived-in) | Real plan after setup |

---

## Summary

**The build hits the brief.** Apple-Wallet calm is recognizable across every surface — warm-cream `#FAFAF7` background, near-black `#15151A` ink, muted category accents that read as a family, system font with tabular numerals, generous whitespace, no illustrations, single progress arc. Token discipline is strong (one hardcoded color across the entire codebase). Reduce-Motion is honored on all four animation surfaces. Microcopy stays restrained throughout.

The two findings worth fixing before ship are both about **consistency**: (1) the month-close banner on Home open-codes its two buttons instead of using the `Button` primitive, which means inconsistent styling AND a sub-44pt tap target; (2) a single hardcoded hex sits in `Button.tsx` for the destructive-pressed state. Neither is a brief-level miss but both will surface if someone audits the code or runs an a11y sweep.

---

## Must Fix

_None._ The build is functional end-to-end. The 12 device screenshots verify every Core UI route renders correctly with real data.

---

## Should Fix

### 1. Home banner buttons should use the `Button` primitive

**Where**: [`apps/mobile/src/screens/HomeScreen.tsx`](../../apps/mobile/src/screens/HomeScreen.tsx) lines 254–315 — the "Not yet" and "Close out" buttons inside the month-close banner.

**Issue**: Two inline `Pressable` blocks with hand-rolled styling instead of `<Button variant="secondary">` and `<Button variant="primary">`. Three problems with this:

- **Tap target is 40pt** (`minHeight: 40`), under the WCAG 2.1 AA / iOS HIG 44pt minimum. The brief's accessibility section explicitly calls for ≥44pt tap targets.
- **Press state diverges** from `Button` — open-coded `bg.sunken` for secondary press and `fab.pressed` for primary press, vs the `Button`'s tokenized treatment.
- **Style drifts later.** If `Button` is restyled (e.g., for dark mode in v2), this banner won't follow.

**Fix**: replace both Pressables with `<Button variant="secondary">Not yet</Button>` and `<Button variant="primary">Close out</Button>`. The `Button` primitive already supports `fullWidth` and `size="md"` (which is 48pt min height, comfortably above 44pt).

### 2. Hardcoded color in `Button` destructive variant

**Where**: [`apps/mobile/src/components/ui/Button.tsx:84`](../../apps/mobile/src/components/ui/Button.tsx#L84)

**Issue**: The destructive pressed state uses a raw hex `'#9A3D3D'` instead of a token. It's the only hardcoded color in the entire codebase, and it'll break for dark mode when that ships.

**Fix**: add a `status.overBudgetPressed: '#9A3D3D'` token alongside `status.overBudget` in [`apps/mobile/src/theme/tokens.ts`](../../apps/mobile/src/theme/tokens.ts), and reference it here. Mirror it in `tokensDark` so the v2 swap stays mechanical.

---

## Could Improve

### 1. Promote `<Percentage>` to a primitive

`fontVariant: ['tabular-nums']` is inlined in four places ([`SafeToSpendStep.tsx:151`](../../apps/mobile/src/screens/setup/SafeToSpendStep.tsx#L151), [`BucketsStep.tsx:189`](../../apps/mobile/src/screens/setup/BucketsStep.tsx#L189), [`MonthCloseRollForwardScreen.tsx:169`](../../apps/mobile/src/screens/monthclose/MonthCloseRollForwardScreen.tsx#L169), [`AdjustPlanScreen.tsx:395`](../../apps/mobile/src/screens/AdjustPlanScreen.tsx#L395)). A tiny `<Percentage value={50} />` component would centralize this and keep the call sites tidy.

### 2. Filter-chip parity on Activity

The "All" filter chip has no dot (correctly — there's no "all" color), but the other four show category dots. This is a tiny visual asymmetry. Options: drop the dots from filter chips entirely (the labels are self-explanatory), or give "All" a row of four tiny dots as a visual anchor. Minor.

### 3. Banner copy could be shorter

Right now: *"Close out May"* / *"A short reflection, then roll forward."* — two lines. The IA writeup says just *"Close out [Month]."* The subhead is helpful for new users but adds vertical weight. Consider showing the subhead only on first viewing.

### 4. Date editing on TransactionDetail

Explicitly deferred in C5 ("Timestamp locked in v1"). Honest punt, but it'll come up as a real user need. Next move: add `@react-native-community/datetimepicker` and inline a date picker on tap of the Logged row.

### 5. Swipe-to-delete on Activity

The IA describes it; current build only supports row-tap → TransactionDetail → trash icon → confirm. Adding `react-native-gesture-handler`'s `Swipeable` to `TransactionRow` would close this. Wired with the new `showUndoSnackbar` from S4, the experience would be: swipe → row gone → undo pill appears.

### 6. Plan-edit undo

`showUndoSnackbar` is wired for transaction delete only. AdjustPlan save should snapshot the prior plan and offer undo, per IA flow 7. Pattern: capture `currentMonth.plan` before `setPlan(newPlan)`, then `showUndoSnackbar('Plan updated', () => setPlan(snapshot))`.

### 7. Per-section "Edit" jumps from MonthClose RollForward

IA flow 5 step 4 calls for an Edit button on each RollForward card to jump into that section's setup screen in carry-forward mode. v1 shipped read-only cards; user can edit after roll-forward via AdjustPlan. Closing this loop would make the close ritual more powerful.

### 8. Real-device QA

The 12 captured screenshots are from a single device (iPhone, likely 13/14/15 class — 1170×2532). Brief's responsive section calls for verification at:
- iPhone SE / mini (≤375pt) — text wrapping, hero sizing
- iPad / wide foldable (≥600pt) — the centered 520pt column

Worth a 30-minute pass through key flows on each.

---

## Verification against the brief

### Experience Principles — three for three

| Principle | Pass / Fail | Evidence |
|---|---|---|
| **Calm over enthusiasm** | ✅ | No streaks, no celebration animations on log, no semantic green for "success" (confirmation is just the bar moving). No mascots, no emojis. The single allowed animation (CategoryBar spring fill) only fires on data change, not on every screen visit. |
| **One screen, one answer** | ✅ | Home → "Can I spend today?" Activity → "What did I spend on?" CategoryDetail → "What's left here?" MonthClose → "How was the month?" Setup steps each ask one question by name. Settings asks no question; it's a utility. |
| **Friction in setup, not daily use** | ✅ | FastLogSheet auto-focuses amount, pre-selects last-used category, requires 3 taps to log. Setup has 5 deliberate steps. The asymmetry is the right one. |

### Aesthetic Direction

| Brief promise | Verdict |
|---|---|
| Warm-neutral monochrome surface | ✅ `bg.base #FAFAF7` (cream), `bg.elevated #FFFFFF`, `bg.sunken #F1F0EC` — three steps with no cool/warm drift |
| Big SF-style numerals with tabular variants | ✅ `type.hero` (56pt) with `fontVariant: ['tabular-nums']`; same on `type.amount` for list rows |
| Generous whitespace | ✅ Spacing scale goes to 128pt; setup ritual uses 80pt+ at the top of each step |
| Gentle 1-pixel separators | ✅ `StyleSheet.hairlineWidth` everywhere; never solid borders for dividers |
| Soft shadows | ✅ Maximum elevation (`lg`) is `0 8 16 rgba(21,21,26,0.10)` — Apple-Wallet-soft |
| No illustrations | ✅ Zero `<Image>` use anywhere |
| No chart heavier than progress arc or bar | ✅ One arc (`MiniProgressArc` on CategoryDetail), four bars (`CategoryBar` instances). Nothing else. |
| Category accents only on bar fills + dots | ✅ Verified — no category color on backgrounds, buttons, headers |
| FAB is monochrome ink-on-paper | ✅ `tokens.color.fab.bg` = `text.primary`, never tinted |

### Tone

| Voice rule | Evidence |
|---|---|
| Confident, neutral, slightly reverent | ✅ Throughout. "You're set." "Carrying forward." "Logged." "Reset everything?" |
| Never preachy, never condescending | ✅ Over-budget caption is just *"₦X over"* in muted red. No "Oops!" No "Yikes — you've overspent." No emoji anywhere. |

### Anti-references

| What we said NO to | Did we drift? |
|---|---|
| Mint / Cleo / Copilot Money personality | ❌ No drift. Zero emoji, zero gradients, zero "Hey!" |
| YNAB density | ❌ No drift. Every screen has 1 hero + at most 1 secondary surface. |
| Streak counter, gamification, mascots | ❌ None of these exist. |
| Chart with >2 colors | ❌ Each bar is 2 colors (tint + base); the arc is 2 colors (tint + base) or 2 colors (tint + overBudget red). |

### Out of Scope — verified clean

Spot-checked the v1 Out of Scope list. **Nothing drifted in.**

- Bank sync ❌ not present
- Receipt OCR ❌ not present
- Recurring transactions ❌ not present
- Widgets ❌ not present
- Push notifications ❌ not present
- Insights / analytics screens ❌ not present
- Multi-user / shared budgets ❌ not present
- Cloud sync / accounts / login ❌ not present
- Dark mode ❌ tokens authored, not actually shipped (correctly)
- Multiple concurrent budgets ❌ not present
- Currency conversion ❌ not present (picker only sets symbol + formatting)
- Onboarding tours / tooltips ❌ not present — SetupRitual is the tour

### Accessibility

- **Tap targets**: ≥44pt everywhere _except_ the home-banner buttons (40pt — see Should Fix #1)
- **Color is never the sole indicator**: every CategoryDot is paired with the category name in copy
- **`accessibilityLabel`** present on every interactive ([64+ inline annotations](../../apps/mobile/src/screens/HomeScreen.tsx) across the three biggest screens alone)
- **`allowFontScaling` + `maxFontSizeMultiplier: 1.3`** on every `<Text>` ✅
- **Reduce Motion** honored via `useReducedMotion` in [`BottomSheet`](../../apps/mobile/src/components/BottomSheet.tsx), [`CategoryBar`](../../apps/mobile/src/components/CategoryBar.tsx), [`ConfirmationStep`](../../apps/mobile/src/screens/setup/ConfirmationStep.tsx), [`UndoSnackbar`](../../apps/mobile/src/components/UndoSnackbar.tsx)
- **Focus management**: `FastLogSheet` auto-focuses amount on open; reduce-motion users get instant transitions
- **`accessibilityLiveRegion: "polite"`** on the undo snackbar so screen readers announce it without interrupting
- **Decorative dots** marked `accessibilityElementsHidden + importantForAccessibility="no"`

### Responsive

- `TabShell`, `ModalStackShell`, `CategoryDetailScreen`, `CurrencyPickerScreen`, `SettingsScreen`, `AdjustPlanScreen`, `TransactionDetailScreen` all center their content at `maxContentWidth: 520pt` on widths ≥600pt
- No multi-column layouts per brief
- Compact-width (≤375pt) verification deferred — see Could Improve #8

---

## What Works Well

These are the strongest aspects to keep going. **This is not padding** — the next phase should preserve these patterns.

1. **Token discipline is remarkable.** One hardcoded color across ~35 files. Every spacing value, every type style, every border radius, every shadow comes from the token export. When dark mode lands in v2, the swap is mechanical exactly as the tokens were authored to be.

2. **The setup steps are mode-aware without duplication.** A single `StepProps` interface with `mode?: 'create' | 'edit'` lets SetupRitual and AdjustPlan share four screens. The cost was a handful of conditional labels — the win is that any improvement to a step ships to both flows.

3. **The single chart (MiniProgressArc) communicates two things at once.** Filled portion = spend ratio; tick mark = today-position-in-month. Glance answers "am I on pace?" without verbose copy. The brief asked for "no chart heavier than a thin progress arc"; this is the leanest possible execution.

4. **No "discard changes?" prompts.** Throughout AdjustPlan, TransactionDetail, FastLogSheet — the user can always dismiss, and unsaved edits evaporate. Matches the brief's "the plan is meant to be living" philosophy.

5. **The bar-fill animation is the only spring in the app.** Reserved exclusively for "you just logged something" feedback. Not used on sheet rises or page pushes (which use `decelerate`). Discipline like this is how the calm vibe holds.

6. **Microcopy stays out of the way.** "Log a spend" not "Add a transaction." "You're set." not "You're all set!" "Carrying forward" not "Time for a new month!" The brief's tone rule is fully honored.

7. **The FastLogSheet hits its target.** 3 taps from anywhere in the app (FAB → amount → Log), with last-used category pre-selected. Below the brief's 5-second target.

8. **Persistence is defensive.** The hydration logic checks for v1 blobs and auto-migrates; `parseBudgetBlob` never throws; storage failures are caught silently with the app still functional. The user can never crash this thing from a storage edge case.

9. **The "Save" / "No changes" toggle on TransactionDetail save button.** Tiny detail, big clarity — the button communicates the form's pristine state without a separate label.

10. **Cards have a single visual treatment everywhere.** `borderRadius: lg`, `borderWidth: hairlineWidth`, `borderColor: hairline`, `backgroundColor: bg.elevated`. Recognizable across Home, Activity, Settings, AdjustPlan, MonthClose, CategoryDetail — even though those screens have very different content density.

---

## Closing

**Ship it.** Address the two Should Fix items (banner buttons + the one hex), then this is done. The Could Improve list is real v1.1 work, not v1 polish. The build is unusually disciplined for the volume of code in this PR — credit the brief's clarity and the token system carrying the consistency the whole way through.

If the team wants a follow-up review pass after v1.1, the right time is once the deferred items (swipe-to-delete, plan-edit undo, date editing on TransactionDetail) and dark mode land. Those four together would round out the experience without changing the core thesis.
