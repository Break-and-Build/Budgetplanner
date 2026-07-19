# Raw device screenshots

Drop **real** device screenshots here (PNG, portrait, from a 6.9" iPhone —
1290×2796 — or the simulator). `.design/budget-tracker-mobile-v1/store-shots.cjs`
composes them into the editorial marketing frames.

Required filenames:

| File | Screen to capture |
|---|---|
| `home.png` | Home — safe-to-spend + category bars + Your plan |
| `log.png` | Home with the **Log a spend** sheet open, amount typed, a category selected |
| `category.png` | Category detail (tap a category bar) — the arc + transactions |
| `lock.png` | The PIN lock screen |
| `adjust.png` | Adjust plan (Home → Your plan → Adjust) |

Re-render with:
    node .design/budget-tracker-mobile-v1/store-shots.cjs
