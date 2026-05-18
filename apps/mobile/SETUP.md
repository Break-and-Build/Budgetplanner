# Quick Setup Guide

## The Problem
You're seeing 37 TypeScript errors because `node_modules` isn't installed yet. The dependencies need to be downloaded first.

## The Solution

### Step 1: Install Dependencies
Open your terminal and run:

```bash
cd /Users/Courage/Desktop/Budgetplanner/apps/mobile
npm install
```

This will install all the required packages (expo, react-native, navigation libraries, etc.)

### Step 2: Restart TypeScript Server
After `npm install` completes:

1. **In Cursor/VS Code**: Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
2. Type: `TypeScript: Restart TS Server`
3. Press Enter

### Step 3: Verify
After restarting, the 37 errors should disappear. If you still see errors:
- Wait 10-15 seconds for TypeScript to finish analyzing
- Check that `apps/mobile/node_modules` folder exists
- Try reloading the window: `Cmd+Shift+P` → `Developer: Reload Window`

## What Was Fixed
✅ `tsconfig.json` - Added JSX support and proper path mappings
✅ `expo-env.d.ts` - Created required Expo TypeScript file
✅ All imports updated to use `@budgetplanner/core` alias
✅ Root `tsconfig.json` created for monorepo support

## Next Steps After Setup
Once dependencies are installed and TS server restarted:
1. Run `npm start` to launch the Expo dev server
2. Scan QR code with Expo Go app on your phone
3. Or press `i` for iOS simulator / `a` for Android emulator
