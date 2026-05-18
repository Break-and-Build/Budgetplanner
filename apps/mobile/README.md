# Budget Planner Mobile App

React Native mobile app built with Expo for iOS and Android.

## Setup

1. Install dependencies:
```bash
cd apps/mobile
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on device/simulator:
- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`

## Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## Project Structure

- `src/screens/` - Main screens (BudgetWizard, CompletedPlan)
- `src/screens/steps/` - Individual wizard step screens
- `src/components/` - Reusable UI components
- `src/components/ui/` - Basic UI primitives (Button, Input, etc.)

## Shared Code

This app shares business logic with the web app via `packages/core/`:
- Types (IncomeSource, PriorityExpense, etc.)
- Calculations (calcTotalIncome, calcSafeToSpend, etc.)
- Currency utilities (formatNumber, parseNumber)
