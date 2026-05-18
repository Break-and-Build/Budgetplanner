# Design Tokens: Budget Tracker (Mobile v1)

The canonical token source lives in code at **`apps/mobile/src/theme/tokens.ts`** — that file is what components import. This document is the human-readable companion: rationale, palette decisions, and the philosophy each token serves.

> **Philosophy**: Apple-Wallet calm. Warm-neutral monochrome with muted category accents. Tokens are authored so the v1 light theme and the deferred v2 dark theme are a runtime swap, not a rewrite.

---

## Why these tokens look the way they do

The brief's three experience principles drive every choice here:

| Principle | Token consequence |
|---|---|
| **Calm over enthusiasm** | Saturated brand colors are absent. Category accents sit at L≈52 and chroma ≈28 — desaturated jewel tones. The four accents are perceptually equal in lightness, so no one category "shouts." |
| **One screen, one answer** | A single hero type step (56pt) is reserved for the one number that screen exists to communicate. Every other type step is HIG-aligned for system-app familiarity. |
| **Friction in setup, not daily use** | A larger-than-typical spacing scale (top end 128pt) so screens can *breathe* during the 3-minute setup ritual; tighter spacing on transactional surfaces is achieved with the small steps (4/8/12). |

---

## Color

### Light mode (shipped in v1)

**Surfaces — the warm-neutral monochrome**

| Token | Hex | Use |
|---|---|---|
| `color.bg.base` | `#FAFAF7` | App background. Cream-tinted off-white. Deliberately *not* `#FFFFFF` — gives surface (`#FFF`) something to sit on top of. |
| `color.bg.elevated` | `#FFFFFF` | Cards, modal sheets, FAB. Pure white. |
| `color.bg.sunken` | `#F1F0EC` | Input wells, "depressed" surfaces. |
| `color.bg.overlay` | `rgba(15,15,20,0.32)` | Modal backdrop. Cool-tinted, not pure black — keeps the warm bg from feeling muddy when dimmed. |

**Ink — text**

| Token | Hex | Use |
|---|---|---|
| `color.text.primary` | `#15151A` | Body & headings. Near-black with cool undertone. Pure `#000` looks harsh against warm cream. |
| `color.text.secondary` | `#6E6E73` | Captions, supporting copy. iOS-style warm gray. |
| `color.text.tertiary` | `#A1A1A6` | Placeholders, disabled hints. |
| `color.text.disabled` | `#C7C7CC` | Disabled control text. |
| `color.text.numeric` | `#15151A` | Same as primary — kept as a separate token so we can shift weight or color for amounts later without touching body text. |

**Categories — the four muted accents**

All four accents sit at roughly equal perceived lightness and chroma. Tints are the same hue at L≈92 — used for category-bar backgrounds and dot halos, never as page backgrounds.

| Category | Base | Tint | Why this hue |
|---|---|---|---|
| **Essentials** (50%) | `#4A6FA5` slate blue | `#E3EBF4` | Foundational. Blue reads "structural." |
| **Growth** (25%) | `#5C8A6B` sage green | `#E4EEE7` | Life, savings, future. Green without aggression. |
| **Stability** (15%) | `#7A6B95` dusty violet | `#EBE8F0` | Sturdy, slightly serious — for emergency fund / insurance. |
| **Rewards** (10%) | `#B5755C` terracotta | `#F2E4DE` | Warm and earthy — a treat, not a flashy reward. |

**Status — used sparingly**

| Token | Hex | Use |
|---|---|---|
| `status.overBudget` | `#B84A4A` | Single use: the caption under a category bar when actual exceeds allocated. Muted red — not a fire alarm. |
| `status.warning` | `#C9913B` | Warm amber. Reserved for setup validation hints. |

We intentionally **do not** ship a `success` token — confirmation is conveyed by the category bar moving, not by a green tick.

**Tab bar & FAB**

The FAB is **ink-on-paper** (`#15151A` on `#FFFFFF`), not a brand color. The brief is explicit about this: the FAB should stay inside the Apple-Wallet vibe, and a colored FAB would break the calm.

### Dark mode (v2 stub, authored alongside light)

`tokensDark` ships in `tokens.ts` but is unused by v1. Dark mode is **not just inverted light**:

- Background base is `#121214` (warm-cool dark, not pure black). Surfaces step up from there in 4 stops.
- Category accents are slightly *lighter* than their light-mode counterparts so they have enough lightness contrast against the dark surface (light bases would disappear on dark).
- Shadows use higher opacity black (0.32–0.48) instead of the soft 0.04–0.12 of light mode — light-mode shadows would *glow* on dark.
- Border hairlines are inverted to `rgba(235,235,245,0.12)`.

When v2 lands, the swap is mechanical:

```ts
const t = useColorScheme() === 'dark' ? tokensDark : tokens;
```

---

## Spacing

**4-point base. 14 steps.** Roomy at the top end — the upper steps (80, 96, 128) exist so the setup ritual can give each question its own breath.

| Step | px | Common use |
|---|---|---|
| `0` | 0 | — |
| `px` | 1 | Hairlines |
| `0.5` | 2 | Micro-gap between dot and label |
| `1` | 4 | Tight inline spacing |
| `1.5` | 6 | — |
| `2` | 8 | Compact gap (icon-to-label) |
| `3` | 12 | Inside button padding |
| `4` | 16 | **Default screen edge padding** |
| `5` | 20 | — |
| `6` | 24 | Common card padding |
| `7` | 32 | Section gaps |
| `8` | 40 | Between major sections |
| `9` | 48 | — |
| `10` | 64 | Hero number breathing room |
| `11` | 80 | Top padding on setup screens (above the question) |
| `12` | 96 | — |
| `13` | 128 | Maximum — reserved for empty-state generosity |

---

## Typography

**System font, always.** SF Pro on iOS, Roboto on Android — set via `Platform.select`. No custom fonts ship in v1; the brief's "feels like a system app" goal is structural.

**Type scale — iOS HIG-aligned with one custom step**

| Token | Size | Line | Weight | Use |
|---|---|---|---|---|
| `hero` | 56 | 64 | 600 | The one number the screen exists for. Today's safe-to-spend, category remaining. **Tabular numerals.** |
| `display` | 40 | 46 | 600 | Setup-ritual hero questions. |
| `title1` | 28 | 34 | 600 | Screen title (large nav title). |
| `title2` | 22 | 28 | 600 | Section heading. |
| `title3` | 20 | 25 | 600 | Card heading. |
| `headline` | 17 | 22 | 600 | Emphasized body. |
| `body` | 17 | 22 | 400 | iOS canonical body — default text. |
| `callout` | 16 | 21 | 400 | Slightly smaller body for dense areas. |
| `subhead` | 15 | 20 | 400 | Secondary copy. |
| `footnote` | 13 | 18 | 400 | Captions under headings. |
| `caption1` | 12 | 16 | 400 | Smallest readable label. |
| `caption2` | 11 | 14 | 500 | Tab bar labels — weight bumped because they're hit-target sized. |
| `amount` | 17 | 22 | 600 | Monetary value in lists. **Tabular numerals** for vertical alignment. |

**Tabular numerals**: applied via `fontVariant: ['tabular-nums']` on `hero` and `amount`. Critical for vertical alignment of monetary values in lists — without it, a column of `₦12,400 / ₦7,500 / ₦108` wobbles.

**Dynamic Type cap**: honored up to **1.3× (Large)** per brief. Beyond that, components must reflow rather than truncate (see brief: large-step behavior on category bars).

---

## Radii

| Token | px | Use |
|---|---|---|
| `none` | 0 | — |
| `sm` | 6 | Chips, filter pills (when not pill-rounded) |
| `md` | 10 | Buttons, inputs |
| `lg` | 14 | Cards, card-like rows |
| `xl` | 20 | Bottom sheets, full modals |
| `pill` | 9999 | FAB, fully rounded filter chips |

The 10/14 split between buttons and cards (rather than a single radius) is intentional: cards sit *behind* buttons, and the slightly larger card radius lets the smaller button radius read clearly when nested.

---

## Shadows

React Native shadow API + Android elevation in a single object per token. Five steps + `none`.

| Token | Y-offset | Blur | Opacity | Elev | Use |
|---|---|---|---|---|---|
| `none` | 0 | 0 | 0 | 0 | — |
| `xs` | 1 | 2 | 0.04 | 1 | Tab bar, chips |
| `sm` | 2 | 6 | 0.05 | 2 | Pressed button state |
| `md` | 4 | 12 | 0.06 | 4 | Default card |
| `lg` | 8 | 16 | 0.10 | 6 | FAB, prominent button |
| `sheet` | **-4** | 24 | 0.12 | 12 | Bottom sheet — shadow rises *up* over content |

Shadows are deliberately soft. Apple-Wallet calm depends on shadows that *suggest* elevation without performing it. If a shadow ever needs to be heavier than `lg`, redesign the component instead.

---

## Motion

**Durations** (ms): `instant 0` · `fast 150` · `base 250` · `slow 400` · `slower 600`

**Easings** (bezier control points — consume with `Easing.bezier(...t)`):

| Token | Curve | Use |
|---|---|---|
| `standard` | `[0.4, 0, 0.2, 1]` | Default. Symmetric ease. |
| `decelerate` | `[0, 0, 0.2, 1]` | Entering elements — sheet rises, push transitions. |
| `accelerate` | `[0.4, 0, 1, 1]` | Exiting elements — sheet dismisses, fades out. |
| `spring` | `[0.34, 1.56, 0.64, 1]` | One use: category bar fill after a transaction logs. **Never** on sheets — overshoot on a modal feels cheap. |

**Reduce Motion**: components must check `AccessibilityInfo.isReduceMotionEnabled()` (or RN's `useReducedMotion` hook) and multiply durations by `tokens.a11y.reduceMotionDurationMultiplier` (0 in v1 → instant). Bar fills become instant snaps; sheet rises become instant appears.

---

## Layout

| Token | Value | Notes |
|---|---|---|
| `breakpoint.compact` | 0 (≤375) | iPhone SE / mini |
| `breakpoint.regular` | 376 | Reference design size |
| `breakpoint.wide` | 600 | iPad, large foldables |
| `maxContentWidth` | 520 | Centered column on wide |
| `screenPaddingX` | 16 | Default screen edge padding |
| `fabSize` | 56 | iOS-standard FAB diameter |
| `fabOffset` | 16 | Edge distance for FAB |
| `tabBarHeight` | 49 | Pre-safe-area tab bar |
| `minTapTarget` | 44 | WCAG / iOS HIG minimum |

---

## Z-index

`base 0 · elevated 10 · fab 50 · sticky 100 · modal 1000 · toast 2000`

Modal sits above sticky and FAB so the bottom sheet (which is a kind of modal) properly covers the FAB it was launched from.

---

## What's intentionally missing

Tokens we deliberately did **not** generate. Each is a no-go for v1.

- **A `success` color.** Confirmation comes from motion (the bar moving), not a green checkmark.
- **A "brand" / "primary" color.** The brief is a system-app vibe. Apple Wallet has no brand color either — it adopts the card's tint.
- **Multiple font families.** No display font, no serif accent. System everywhere.
- **A chart palette.** The only chart is a single-category arc on `CategoryDetail` — it uses that category's `base` color, period.
- **Animation curves beyond four.** More easings = more decisions in PRs. Four is enough.

---

## Files

| Path | Role |
|---|---|
| `apps/mobile/src/theme/tokens.ts` | **Source of truth.** Typed export. Components import from here. |
| `apps/mobile/src/theme/index.ts` | Barrel re-export. |
| `.design/budget-tracker-mobile-v1/DESIGN_TOKENS.md` | **This file.** Rationale & spec. |

When tokens change, update **both** — the code first, then this doc with the *why*.
