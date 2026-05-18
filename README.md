# Priority-Based Budget Planner

A budget planning application available as both a web app and native mobile app (iOS/Android).

## Project Structure

This is a monorepo containing:

- **Web App** (`src/`) - React + Vite web application
- **Mobile App** (`apps/mobile/`) - React Native + Expo mobile application
- **Shared Core** (`packages/core/`) - Shared business logic, types, and utilities

## Running the Web App

```bash
npm install
npm run dev
```

## Running the Mobile App

```bash
cd apps/mobile
npm install
npm start
```

Then choose to run on iOS simulator, Android emulator, or scan QR code with Expo Go app.

## Building for Production

### Web
```bash
npm run build
```

### Mobile (iOS/Android)
```bash
cd apps/mobile
eas build --platform ios
eas build --platform android
```

## Shared Code

The `packages/core/` package contains:
- Type definitions (IncomeSource, PriorityExpense, SavingsData, etc.)
- Calculation functions (calcTotalIncome, calcSafeToSpend, etc.)
- Currency formatting utilities

Both web and mobile apps import from this shared package to ensure consistency.
