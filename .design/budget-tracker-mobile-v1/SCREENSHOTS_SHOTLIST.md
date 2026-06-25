# Screenshot shot list

The 12 screenshots in `screenshots/` were captured **before** the Poppins font + indigo brand color rollout. They show the original Apple-Wallet-calm design.

To refresh the case study with current-build screenshots, capture these on a real device (iPhone 14/15/16 size preferred — 1170×2532 or similar). Save into `screenshots/v2/` (or just overwrite the current files if you want to leave the calm-era ones behind).

The case study should keep **one or two of the calm-era screenshots** for the pivot "before" comparison — see ⭐ flag below.

---

## Hero shot (most important)

| What | Notes |
|---|---|
| **Home screen, lived-in, mid-month state** | Several transactions visible, all four category bars partly filled, some recent activity at the bottom. Real-looking data, not test data. **This becomes the hero of the case study.** |

## Decision-card shots

| Decision | What to capture | Notes |
|---|---|---|
| **#1: Local-only** | Settings screen showing the Currency / Automation / Reminders / Reset rows | Should show the brand color on the toggle + ChevronRight chevrons |
| **#2: One screen, one answer** | Home, clean state. Hero number + 4 bars + recent activity visible | Same as hero but possibly with different month data — could reuse |
| **#3: Manual logging in 3 taps** | FastLogSheet open with amount typed (e.g. ₦8,500), category chip selected, "Log" button active (indigo) | Crucial to show the indigo Log button — proves the brand pivot |
| **#4: Calm aesthetic** ⭐ | **Keep one calm-era screenshot here** (e.g., `IMG_6678.PNG`) | The case study contrasts calm-era vs. pivot. This card *should* show the calm aesthetic. |

## Pivot section — needs BEFORE/AFTER pair

| Surface | Before (calm-era) | After (current) |
|---|---|---|
| Primary button visible | Use existing `IMG_6678.PNG` (Save button is black) | Capture FastLog with "Log" enabled (now indigo) |
| Tab bar active state | Need calm-era screenshot of Activity/Home with ink-black icons (existing screenshots show this) | Capture current Activity tab with indigo active icon + label |
| Filter chip selected | `IMG_6670.PNG` shows ink-filled "All" chip | Capture Activity with a category filter selected — should show light-indigo tinted pill |

## Brand-shift gallery

A 2×3 grid at the bottom of the case study. Pick 6 screens that show the current brand identity at its best:

| Position | Suggested |
|---|---|
| Top-left | Home (lived-in) |
| Top-center | Activity with a category filter active |
| Top-right | CategoryDetail showing the progress arc with indigo accent |
| Bottom-left | TransactionDetail with date editing open |
| Bottom-center | Recurring list (Settings → Recurring) — proves the new feature |
| Bottom-right | Settings with the Reminders toggle on |

## Capture tips

- **iOS**: side button + volume up. Saves to Photos. AirDrop or iCloud Drive to your Mac.
- **Status bar**: clean it up with `xcrun simctl status_bar booted override --time "9:41" --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3` (in iOS Simulator). For device screenshots, full-charge / full-signal + 9:41 are App Store conventions.
- **Don't show debug overlays** — turn off Expo dev menu before capturing.
- **Use real-feeling data** — `Salary ₦450,000`, `Rent ₦150,000`, transactions like "Coffee · ₦1,800" instead of test placeholders.
- **One device size for the gallery** — pick iPhone 14/15/16 Pro size and stick to it. Mixed device sizes look messy in a grid.

## Drop the new screenshots here

Save them to `screenshots/v2/` so we keep both eras intact. I'll wire the references in the case study + HTML when they land.
