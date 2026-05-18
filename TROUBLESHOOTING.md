# Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Cannot find module 'expo-status-bar'" or similar errors

**Cause**: Dependencies are not installed yet.

**Solution**:
1. Make sure Node.js is installed: `node --version`
2. If not installed: `brew install node`
3. Install dependencies:
   ```bash
   cd apps/mobile
   npm install
   ```
4. Restart TypeScript Server in Cursor: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

### Issue: "Cannot find module '@budgetplanner/core'"

**Cause**: TypeScript can't resolve the path alias.

**Solution**:
1. Verify `apps/mobile/tsconfig.json` has the correct paths configuration ✅
2. Verify `apps/mobile/babel.config.js` has module-resolver configured ✅
3. Restart TypeScript Server
4. If still failing, try reloading the window: `Cmd+Shift+P` → "Developer: Reload Window"

### Issue: "File 'expo/tsconfig.base' not found"

**Cause**: Expo dependencies not installed.

**Solution**:
```bash
cd apps/mobile
npm install
```

### Issue: JSX errors ("Cannot use JSX unless the '--jsx' flag is provided")

**Cause**: TypeScript configuration issue (should be fixed now).

**Solution**: 
- Verify `apps/mobile/tsconfig.json` has `"jsx": "react-native"` ✅
- Restart TypeScript Server

### Issue: Navigation type errors

**Cause**: Type definitions not properly set up (should be fixed now).

**Solution**:
- Verify `apps/mobile/src/types/navigation.ts` exists ✅
- Restart TypeScript Server

## Step-by-Step Fix for All Errors

1. **Install Node.js** (if not installed):
   ```bash
   brew install node
   ```

2. **Verify Node.js is installed**:
   ```bash
   node --version
   npm --version
   ```

3. **Install mobile app dependencies**:
   ```bash
   cd /Users/Courage/Desktop/Budgetplanner/apps/mobile
   npm install
   ```
   This will take a few minutes. Wait for it to complete.

4. **Restart TypeScript Server**:
   - Press `Cmd+Shift+P`
   - Type: `TypeScript: Restart TS Server`
   - Press Enter
   - Wait 10-15 seconds for analysis to complete

5. **If errors persist, reload the window**:
   - Press `Cmd+Shift+P`
   - Type: `Developer: Reload Window`
   - Press Enter

## Verification Checklist

After following the steps above, verify:

- ✅ `apps/mobile/node_modules` folder exists
- ✅ `node --version` shows a version number
- ✅ `npm --version` shows a version number
- ✅ No red squiggles in `apps/mobile/App.tsx`
- ✅ TypeScript Server shows "0 errors" in the status bar

## Still Having Issues?

If you're still seeing errors after following all steps:

1. **Check the exact error message** - Copy the first few error messages
2. **Check if it's a specific file** - Note which file(s) have errors
3. **Verify Node.js version** - Should be v18 or higher: `node --version`

## Current Configuration Status

✅ Root `tsconfig.json` - Created and configured
✅ Mobile `tsconfig.json` - JSX, paths, baseUrl all set
✅ Vite config - Alias configured
✅ Babel config - Module resolver configured
✅ Metro config - Watch folders configured
✅ All imports - Using `@budgetplanner/core` alias
✅ Navigation types - Properly defined
✅ No unused imports - Cleaned up

All configuration is correct. The remaining issues are due to missing `node_modules`.
