import type { CategoryId } from '@budgetplanner/core';

/**
 * The two bottom tabs. Setup, Close, Settings, etc. live in the root stack
 * as modal flows over `MainTabs` — see RootStackParamList below.
 */
export type MainTabsParamList = {
  Home: undefined;
  Activity: undefined;
};

/**
 * Root navigator. Modal flows are nested stacks; everything else is a single
 * screen pushed onto the root stack.
 */
export type RootStackParamList = {
  /**
   * First-run currency picker, also reusable from Settings.
   *   • mode 'first-run' (default) — undismissable, advances to SetupRitual on commit
   *   • mode 'edit' — has a back button, returns to the previous screen on commit
   */
  FirstRun: { mode?: 'first-run' | 'edit' } | undefined;
  /** The bottom-tab navigator (Home + Activity). */
  MainTabs: { screen?: keyof MainTabsParamList } | undefined;

  /** Month-start setup ritual — full-screen modal flow. */
  SetupRitual: { resume?: boolean } | undefined;
  /** Month-end close — full-screen modal flow. */
  MonthClose: undefined;

  /** Pushed screens (not modals). */
  CategoryDetail: { category: CategoryId };
  TransactionDetail: { id: string };
  AdjustPlan: { focus?: 'income' | 'priorities' | 'savings' | 'buckets' } | undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
