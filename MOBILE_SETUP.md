# Mobile App Setup Guide

## Overview

The mobile app has been successfully created as a React Native application using Expo. It shares business logic with the web app through the `packages/core/` package.

## Project Structure

```
Budgetplanner/
├── apps/
│   └── mobile/              # React Native Expo app
│       ├── src/
│       │   ├── screens/     # Main screens and step screens
│       │   ├── components/  # Reusable UI components
│       │   └── utils/        # Utility functions
│       ├── App.tsx           # Root component
│       ├── app.json          # Expo configuration
│       └── package.json      # Dependencies
├── packages/
│   └── core/                 # Shared business logic
│       └── src/
│           ├── types.ts      # Type definitions
│           ├── calculations.ts # Budget calculations
│           └── currency.ts   # Currency formatting
└── src/                      # Web app (unchanged)
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (install globally: `npm install -g expo-cli`)
- For iOS: Xcode (Mac only)
- For Android: Android Studio

### Installation

1. Install dependencies for the mobile app:
```bash
cd apps/mobile
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. Run on your device/simulator:
   - **iOS Simulator**: Press `i` in the terminal or run `npm run ios`
   - **Android Emulator**: Press `a` in the terminal or run `npm run android`
   - **Physical Device**: Install Expo Go app and scan the QR code

## Building for Production

### Using EAS Build (Recommended)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure your project (if not already done):
```bash
eas build:configure
```

4. Build for iOS:
```bash
eas build --platform ios
```

5. Build for Android:
```bash
eas build --platform android
```

### Local Builds

For local builds, you'll need to configure native projects:

```bash
cd apps/mobile
npx expo prebuild
```

Then build using Xcode (iOS) or Android Studio (Android).

## Features Implemented

✅ 6-step budget wizard flow:
1. Income Setup
2. Priority Expenses
3. Savings Allocation
4. Safe to Spend Summary
5. Flexible Buckets
6. Monthly Reflection

✅ Completed Plan screen with full budget breakdown

✅ Shared business logic with web app:
- Type definitions
- Calculation functions
- Currency formatting

✅ Native UI components:
- Button, Input, Select, Switch
- Currency Input with formatting
- Progress Indicator

## Next Steps

1. **Add App Icons**: Replace placeholder assets in `apps/mobile/assets/`:
   - `icon.png` (1024x1024)
   - `splash.png` (1242x2436)
   - `adaptive-icon.png` (1024x1024)
   - `favicon.png` (48x48)

2. **Configure App Store/Play Store**:
   - Update `app.json` with your app details
   - Set up App Store Connect (iOS)
   - Set up Google Play Console (Android)

3. **Testing**:
   - Test on both iOS and Android devices
   - Verify calculations match web app
   - Test all 6 wizard steps

4. **Optional Enhancements**:
   - Add data persistence (AsyncStorage)
   - Add offline support
   - Add push notifications
   - Add biometric authentication

## Troubleshooting

### Metro bundler issues
```bash
cd apps/mobile
npx expo start --clear
```

### TypeScript errors
Ensure the core package is properly linked. The mobile app imports from `@budgetplanner/core` which resolves to `../../packages/core/src/index.ts` via TypeScript path mapping and Babel module resolver.

### Navigation issues
The app uses React Navigation. If you see navigation errors, ensure all dependencies are installed:
```bash
cd apps/mobile
npm install @react-navigation/native @react-navigation/stack react-native-screens react-native-safe-area-context react-native-gesture-handler
```

## Notes

- The mobile app uses StyleSheet for styling (not Tailwind classes) for better React Native compatibility
- Icons are from `lucide-react-native` (React Native compatible version)
- The app structure mirrors the web app's component structure for easier maintenance
