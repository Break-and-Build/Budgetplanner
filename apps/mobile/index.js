// Local entry point for the monorepo-hoisted Expo install.
//
// `expo/AppEntry.js` hardcodes `import '../../App'`, which assumes expo is
// nested at `apps/mobile/node_modules/expo/` (two levels above the App).
// In a monorepo npm hoists expo to the workspace root (`node_modules/expo/`),
// so `../../App` resolves to the repo root — not where App.tsx lives.
//
// Pattern recommended by Expo's monorepo guide:
//   https://docs.expo.dev/guides/monorepos/

import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
