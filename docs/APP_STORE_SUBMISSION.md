# Budget Tracker — App Store submission (v1.0.0)

Everything to paste into App Store Connect, in the order the forms appear.
Build to submit: **1.0.0 (8)**.

---

## 0. Blockers to clear first

- [ ] **Agreements, Tax, and Banking** → the latest **Free Apps** agreement is
      accepted (Account Holder only). If it isn't green, Submit stays disabled.
- [ ] Build **1.0.0 (8)** shows in TestFlight as processed.
- [ ] Privacy policy + support pages are live:
      - https://tvbixd.github.io/Budgetplanner1/privacy-policy.html
      - https://tvbixd.github.io/Budgetplanner1/support.html

---

## 1. App Information

| Field | Value |
|---|---|
| Name | `Budget Tracker` |
| Subtitle (30) | `Know what's safe to spend` |
| Primary category | **Finance** |
| Secondary category | *(leave empty)* |
| Content rights | **No third-party content** |
| Age rating | **4+** — answer *None* to every content question |
| Privacy Policy URL | `https://tvbixd.github.io/Budgetplanner1/privacy-policy.html` |
| License agreement | Apple's standard EULA |

---

## 2. Pricing and Availability

- Price: **Free**
- Availability: **All countries and regions**
- Pre-orders: off

---

## 3. App Privacy  → **"Data Not Collected"**

Answer **No** to "Do you or your third-party partners collect data from this app?"

This is accurate: everything is stored on-device (AsyncStorage), reminders are
local notifications, the app-lock PIN is a salted hash in the Keychain, there is
no account, no analytics, no ads, and no network calls that carry user data.

---

## 4. Version 1.0.0 — "Prepare for Submission"

### Promotional text (170)
```
A calm budget you actually live in. One number tells you what's safe to spend today — log a purchase in five seconds, lock it behind Face ID, and keep your figures private.
```

### Description
```
Budget Tracker is a calm, no-nonsense budget you actually live in.

Most budget apps drown you in charts, streaks and notifications. Budget Tracker
answers one question: can I spend right now?

SAFE TO SPEND TODAY
One clear number, front and centre, every day. No hunting through screens.

LOG IN FIVE SECONDS
Tap +, type the amount, pick a category, done. No forms, no friction.

CATEGORIES THAT ARE YOURS
Start with Needs, Wants, Savings and Fun — then rename them, recolour them, add
your own, and set how much of your money each one gets.

RECURRING BILLS, HANDLED
Add rent, subscriptions or a gym once and they log themselves every month.

REMINDERS ON YOUR SCHEDULE
Pick your own times — morning, midday, evening, up to five a day. Never a streak,
never a guilt trip.

PRIVATE BY DESIGN
Lock the app with a PIN or Face ID, and hide every figure on screen with one tap
when someone's looking over your shoulder.

LIGHT AND DARK
Follows your phone's appearance automatically.

YOUR DATA STAYS YOURS
No account. No sign-in. No bank connection. Nothing is uploaded — your budget
lives on your device and nowhere else.
```

### Keywords (100 max — this is 99)
```
budget,tracker,spending,expense,money,savings,finance,planner,cashflow,bills,budgeting,spend
```

### URLs
- Support URL: `https://tvbixd.github.io/Budgetplanner1/support.html`
- Marketing URL: *(optional — same support page, or leave blank)*

### Screenshots — iPhone 6.9"
Upload in this order from `docs/store-assets/ios/` (all 1290×2796):
1. `01-home.png` — Know what's safe to spend today
2. `02-log.png` — Log a spend in five seconds
3. `03-plan.png` — A plan that fits your month
4. `04-today.png` — Every spend, at a glance
5. `05-reminders.png` — Nudges at your times
6. `06-lock.png` — Locked, and private

iPad screenshots: **not required** (the app is iPhone-only).

### General
- App icon: comes from the build automatically
- Copyright: `2026 Break and Build`
- Version: `1.0.0`
- Build: **8**

---

## 5. App Review Information

- **Sign-in required:** **No**
- **Contact:** *your first name, last name, phone, email* ← only thing I can't fill in
- **Notes to reviewer:**
```
No account or sign-in is required — open the app and start budgeting.

All data is stored locally on the device. There is no backend, no analytics and
no network calls carrying user data.

Optional features you may want to exercise:
• App lock (Settings → Privacy & security): sets a 4-digit PIN with optional
  Face ID. It is OFF by default, so it will not block review.
• Reminders are local notifications only; times are user-chosen in Settings.
• "Hide amounts" (eye icon on Home) masks figures on screen.

Currency is chosen on first launch and can be changed in Settings.
```

---

## 6. Declarations shown at submit

- **Export compliance:** already answered by the build
  (`ITSAppUsesNonExemptEncryption: false`). The app only uses standard platform
  cryptography for local authentication (hashing the app-lock PIN), which is
  exempt — so **No** remains the correct answer.
- **Advertising Identifier (IDFA):** **No** — the app doesn't use it.
- **Version release:** **Manually release this version** (recommended, so you
  control the go-live moment).

---

## 7. Submit

**Add for Review → Submit.** First review is typically 24–48h.

---

## "What's New" (for the next update, not 1.0.0)
1.0.0 is the first public release, so this field won't appear. Keep for v1.1:
```
• Dark mode
• Set your own reminder times — up to five a day
• Lock the app with a PIN or Face ID
• Hide your figures with one tap
```
