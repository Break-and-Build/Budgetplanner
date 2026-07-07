# Budget Tracker — Submission Checklist

Everything you need to submit, in order. Copy-paste values are provided so you
don't have to think about wording.

---

## 0. Assets you already have ✅

| Asset | Location |
|---|---|
| iOS app icon (liquid glass) | `apps/mobile/assets/AppIcon.icon` |
| Android app icon | `apps/mobile/assets/adaptive-icon.png` |
| iOS screenshots (1290×2796) | `docs/store-assets/ios/01–05.png` |
| Android screenshots (1080×1920) | `docs/store-assets/android/01–05.png` |
| Play feature graphic (1024×500) | `docs/store-assets/feature-graphic.png` |
| Play icon (512×512) | `docs/store-assets/play-store-icon-512.png` |
| Privacy policy (hosted) | https://tvbixd.github.io/Budgetplanner1/privacy-policy.html |

---

## 1. Copy-paste store metadata (same for both stores)

**App name:** `Budget Tracker`

**Subtitle / short description (30 char):** `Know what's safe to spend`

**Promo text (iOS, optional, 170 char):**
`A calm budget you actually live in. One clear number tells you what's safe to spend today — log a purchase in five seconds, no noise, no nagging.`

**Keywords (iOS, 100 char):**
`budget,tracker,spending,money,savings,expense,finance,planner,cashflow,budgeting`

**Full description:**
```
Budget Tracker is a calm, no-nonsense budget you actually live in.

Most budget apps drown you in charts, streaks, and notifications. Budget
Tracker answers one question: can I spend right now?

• SAFE TO SPEND TODAY — one clear number, front and center, every day.
• LOG IN FIVE SECONDS — tap +, type the amount, pick a category, done.
• A PLAN THAT FITS YOUR MONTH — income, priorities and savings, balanced.
• FOUR SIMPLE BUCKETS — Essentials, Growth, Stability and Rewards.
• GENTLE REMINDERS — an optional nudge to check in. Never nagging.

Your data stays on your device. No account, no sign-in, no bank connection,
nothing sent to a server. Just the truth about your money, in your pocket.
```

**Category:** Finance
**Support email:** breakxbuildco@gmail.com
**Privacy policy URL:** https://tvbixd.github.io/Budgetplanner1/privacy-policy.html
**Age rating:** 4+ / Everyone (answer "None" to every content question)

---

## 2. iOS — External TestFlight (do this now)

Goal: get the app to outside testers. One Beta App Review (~24–48h first time).

**Step 1 — Confirm the build is up**
App Store Connect → your app → **TestFlight** → the build shows **Ready to Submit**
(not "Processing"). If you rebuilt for the new icon, submit that build first:
```
cd apps/mobile
eas build --platform ios --profile production
eas submit --platform ios --latest
```

**Step 2 — Fill Test Information** (TestFlight → Test Information, left sidebar)
- Beta App Description: use the full description above
- Feedback email: breakxbuildco@gmail.com
- Privacy Policy URL: (above)

**Step 3 — Create the external group**
- TestFlight → **External Testing** → **+** → name it `Beta`
- Add testers by email **or** turn on the **Public Link** (shareable URL)

**Step 4 — Attach build + submit for review**
- Add your build to the Beta group
- Fill **"What to Test"**: `Set up a budget, log a few spends, open the Plan
  tab, and try turning on reminders.`
- **Sign-in required? → NO** (there is no login)
- Export compliance → already answered (encryption declared in the build)
- **Submit for Beta App Review**

**Step 5 — After approval**
Testers get the invite / public link → they install the **TestFlight app** →
then Budget Tracker. New builds you upload appear automatically.

---

## 3. iOS — Full App Store release (later, when beta looks good)

App Store Connect → your app → **(+) version / Prepare for Submission**:
- [ ] Screenshots: upload `docs/store-assets/ios/01–05.png` (6.9" display)
- [ ] Description, keywords, subtitle, support URL, privacy URL (section 1)
- [ ] **App Privacy** → Data collection: **"Data Not Collected"** (nothing leaves the device)
- [ ] Age rating questionnaire → all "None" → 4+
- [ ] Pricing → Free
- [ ] Build → select your latest TestFlight build
- [ ] **Add for Review → Submit** (full review ~24–48h)

---

## 4. Android — push the new build to your testers

Your closed-testing testers are already opted in — just ship a new release to
the **same track**.

- [ ] Build: `cd apps/mobile && eas build --platform android --profile production`
- [ ] Download the `.aab` from expo.dev → Builds
- [ ] Play Console → **Testing → Closed testing** → your existing track →
      **Create new release** → upload the `.aab`
- [ ] Release notes → **Save → Review → Start rollout to Closed testing**
- ⚠️ Do NOT create a new track and do NOT generate a new keystore (say **No**).

**Update the store listing graphics too** (Play Console → Main store listing):
- [ ] Phone screenshots: `docs/store-assets/android/01–05.png`
- [ ] Feature graphic, icon, description (section 1)

**Play production launch (later):** needs 12+ testers opted in for 14 days
(new personal account rule), then promote the release to Production.

---

## 5. Quick answers to the forms that trip people up

| Question | Answer |
|---|---|
| Does the app use encryption? | No (already declared in build) |
| Does the app require sign-in? | No |
| What data do you collect? | None — all data stays on device |
| Financial features (Play) | None |
| Ads? | No |
| Target age | Everyone / 4+ |
| Account deletion | N/A — no account; data is local, cleared on uninstall |
