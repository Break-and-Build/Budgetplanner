/**
 * App entry — root navigator.
 *
 * Shape (per .design/budget-tracker-mobile-v1/INFORMATION_ARCHITECTURE.md):
 *
 *   RootStack (native-stack, headerless)
 *   ├─ FirstRun                        (auto-skipped if setupComplete)
 *   ├─ MainTabs                        (bottom-tabs: Home + Activity)
 *   ├─ SetupRitual                     (modal flow — full-screen)
 *   ├─ MonthClose                      (modal flow — full-screen)
 *   ├─ CategoryDetail (push)
 *   ├─ TransactionDetail (push)
 *   ├─ AdjustPlan (push)
 *   └─ Settings  (push, presented as a card modal)
 *
 * v1 ships placeholder content for everything except the F-tier primitives;
 * each Core UI task replaces one placeholder.
 */

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the native splash visible until we explicitly hide it. Must be called
// at module load — before any component renders — so the native splash
// doesn't dismiss the moment React hands over the first frame.
const APP_START = Date.now();
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden, that's fine.
});
/** Minimum total splash time (ms), measured from JS module load. */
const MIN_SPLASH_MS = 1500;
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home as HomeIcon, ListMinus } from 'lucide-react-native';

import type { RootStackParamList, MainTabsParamList } from './src/types/navigation';
import { ThemeProvider, useTokens, tokens } from './src/theme';
import { BudgetProvider, useBudget } from './src/state/BudgetContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { ActivityScreen } from './src/screens/ActivityScreen';
import { CategoryDetailScreen } from './src/screens/CategoryDetailScreen';
import { TransactionDetailScreen } from './src/screens/TransactionDetailScreen';
import { SetupRitual } from './src/screens/SetupRitual';
import { CurrencyPickerScreen } from './src/screens/CurrencyPickerScreen';
import { MonthClose } from './src/screens/MonthClose';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AdjustPlanScreen } from './src/screens/AdjustPlanScreen';
import { FastLogSheet } from './src/screens/FastLogSheet';
import { UndoSnackbar } from './src/components/UndoSnackbar';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabsParamList>();

// React Navigation theme — feeds our background color into the gesture-driven
// chrome (otherwise pushes/pops flash a default off-white).
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: tokens.color.bg.base,
    card: tokens.color.bg.elevated,
    text: tokens.color.text.primary,
    border: 'rgba(60, 60, 67, 0.12)',
    primary: tokens.color.text.primary,
  },
};

function MainTabs() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: t.color.tabBar.bg,
          borderTopColor: t.color.tabBar.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          // Real bottom inset, not a hardcoded 34. Works on iPhone (~34),
          // Android (0–24 depending on device), and pre-notch iPhones (0).
          height: t.layout.tabBarHeight + insets.bottom,
          paddingTop: t.space[1],
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: t.color.tabBar.labelActive,
        tabBarInactiveTintColor: t.color.tabBar.labelInactive,
        tabBarLabelStyle: {
          ...t.type.caption2,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <HomeIcon
              size={size - 2}
              color={focused ? t.color.tabBar.iconActive : t.color.tabBar.iconInactive}
              strokeWidth={focused ? 2.25 : 1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <ListMinus
              size={size - 2}
              color={focused ? t.color.tabBar.iconActive : t.color.tabBar.iconInactive}
              strokeWidth={focused ? 2.25 : 1.75}
            />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

function Root({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isHydrated, blob } = useBudget();

  // Hide the native splash once BOTH font loading and AsyncStorage hydration
  // have finished, but never before the minimum total splash time has elapsed.
  // Gives the brand a beat to register without feeling like a stall.
  useEffect(() => {
    if (!isHydrated || !fontsLoaded) return;
    const elapsed = Date.now() - APP_START;
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
    const id = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, remaining);
    return () => clearTimeout(id);
  }, [isHydrated, fontsLoaded]);

  // While hydrating or loading fonts, render an empty pane in the brand
  // background color. The native splash is still up — this is just so React
  // has a mounted tree ready behind it. Once fonts arrive, any text rendered
  // here would use Poppins; pre-load there's nothing to render anyway.
  if (!isHydrated || !fontsLoaded) {
    return <Splash />;
  }

  // Cold-launch routing: incomplete setup → FirstRun (CurrencyPicker), else
  // straight to MainTabs.
  const initialRouteName = blob.setupComplete ? 'MainTabs' : 'FirstRun';

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="dark" />
      <RootStack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: tokens.color.bg.base },
        }}
      >
        <RootStack.Screen name="MainTabs" component={MainTabs} />

        <RootStack.Screen
          name="FirstRun"
          component={CurrencyPickerScreen}
          options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
        />
        <RootStack.Screen
          name="SetupRitual"
          component={SetupRitual}
          options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
        />
        <RootStack.Screen
          name="MonthClose"
          component={MonthClose}
          options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
        />

        <RootStack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
        <RootStack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
        <RootStack.Screen
          name="AdjustPlan"
          component={AdjustPlanScreen}
          options={{ presentation: 'modal' }}
        />
        <RootStack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            // 'card' (default push) ensures NO OS chrome — modal presentation
            // can leak a navigation bar on iOS even with headerShown: false.
            // Our SettingsScreen renders its own header with the X.
            headerShown: false,
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  // Poppins is loaded here at the App root so it's ready before any screen
  // renders. Splash stays up until BOTH fonts and hydration complete (see
  // Root). useFonts handles caching across reloads — subsequent launches
  // resolve nearly instantly.
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  return (
    <SafeAreaProvider>
      <ThemeProvider colorScheme="light">
        <BudgetProvider>
          <View style={styles.root}>
            <Root fontsLoaded={fontsLoaded} />
            {/* Global UI — sits above the navigator so it's available from
                every screen via openFastLog() / showUndoSnackbar() in
                BudgetContext. */}
            <FastLogSheet />
            <UndoSnackbar />
          </View>
        </BudgetProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

// Tiny splash while AsyncStorage hydrates. The Expo native splash covers the
// JS-bundle-load window; this only paints during AsyncStorage read (~<100ms
// on a real device). Just match the app background — no spinner needed at
// this duration.
function Splash() {
  return <View style={styles.root} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.color.bg.base,
  },
});
