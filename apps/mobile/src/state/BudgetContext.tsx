/**
 * BudgetContext — AsyncStorage-backed persistence.
 *
 * Replaces the provisional in-memory provider from C1–C7. The public hook
 * surface is unchanged — every consumer (HomeScreen, FastLogSheet, Activity,
 * etc.) continues to call `useBudget()` without modification.
 *
 * Lifecycle:
 *   1. On mount, read the v2 blob from AsyncStorage. If absent, try the v1
 *      legacy key and run `migrateV1ToV2`. If both absent → fresh blob.
 *   2. Set `isHydrated` after the read settles. Consumers should not render
 *      meaningful UI until then (we serve a splash from App.tsx).
 *   3. Any state change persists to AsyncStorage with a 500ms debounce so
 *      bursty edits (typing in inputs, dragging sliders) don't thrash disk.
 *
 * Defensive: every AsyncStorage operation is try/catch'd. Storage failures
 * never crash the app — at worst the user loses persistence for this session.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  cancelAllReminders,
  requestNotificationPermission,
  scheduleAllReminders,
} from '../lib/notifications';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  BudgetBlob,
  BudgetBlobV1,
  BudgetPlan,
  MonthState,
  RecurringTransaction,
  ReflectionData,
  Transaction,
} from '@budgetplanner/core';
import {
  emptyBudgetBlob,
  migrateV1ToV2,
  parseBudgetBlob,
  rollForward,
  runRecurringRules,
  symbolFor,
} from '@budgetplanner/core';

/** Stable AsyncStorage key for the v2 blob. */
const STORAGE_KEY_V2 = 'budgetplanner:mobile:v2';
/** Legacy v1 key from the original wizard build. Migrated on first hydrate. */
const STORAGE_KEY_V1 = 'budgetplanner:mobile:v1';
/** Debounce window for writes. Tight enough to feel responsive on close, slack
 *  enough to coalesce a burst of `setForm` / type events. */
const PERSIST_DEBOUNCE_MS = 500;

interface BudgetContextValue {
  blob: BudgetBlob;
  currentMonth: MonthState;
  symbol: string;

  /** True once initial AsyncStorage read has settled. */
  isHydrated: boolean;

  // ─── Transactions ─────────────────────────────────────────────────────────
  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  removeTransaction: (id: string) => Transaction | null;
  findTransaction: (id: string) => Transaction | null;

  // ─── Plan / currency ──────────────────────────────────────────────────────
  setPlan: (plan: BudgetPlan) => void;
  setCurrency: (code: string) => void;

  // ─── Recurring transaction rules ──────────────────────────────────────────
  recurring: RecurringTransaction[];
  addRecurring: (rule: Omit<RecurringTransaction, 'id' | 'createdAt'>) => void;
  updateRecurring: (id: string, patch: Partial<RecurringTransaction>) => void;
  removeRecurring: (id: string) => void;

  // ─── Reminders (local notifications) ──────────────────────────────────────
  remindersEnabled: boolean;
  /**
   * Turn reminders on or off. Enabling requests OS permission first; if the
   * user denies, the toggle stays off. Returns the resulting state so the
   * UI can bounce-back if permission was denied.
   */
  setRemindersEnabled: (next: boolean) => Promise<boolean>;

  // ─── Month close ──────────────────────────────────────────────────────────
  /**
   * Archive the current month with a reflection and roll forward to the
   * next calendar month. Transactions zeroed, plan carried.
   */
  closeMonth: (reflection: ReflectionData) => void;
  /** Session-only flag — true once the banner has been dismissed this run. */
  monthCloseBannerDismissed: boolean;
  dismissMonthCloseBanner: () => void;

  // ─── Destructive (testing + Settings) ─────────────────────────────────────
  /** Wipe everything to a clean blob (no currency, no plan). */
  resetAll: () => Promise<void>;
  /** Drop only the current month's transactions, keep the plan. */
  resetCurrentMonth: () => void;

  // ─── FastLogSheet visibility ──────────────────────────────────────────────
  fastLogVisible: boolean;
  openFastLog: () => void;
  closeFastLog: () => void;

  // ─── Undo snackbar ────────────────────────────────────────────────────────
  /**
   * Show the global undo snackbar with a custom revert callback. Auto-dismisses
   * after 4 seconds. Calling again before timeout replaces the previous one.
   */
  showUndoSnackbar: (message: string, onUndo: () => void) => void;
  hideUndoSnackbar: () => void;
  undoSnackbar: { message: string; onUndo: () => void } | null;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  // Start with a fresh-install shape so the typed hook works pre-hydration.
  // `isHydrated` gates UI from rendering against this placeholder.
  const [blob, setBlob] = useState<BudgetBlob>(() => emptyBudgetBlob('USD'));
  const [isHydrated, setIsHydrated] = useState(false);

  const [fastLogVisible, setFastLogVisible] = useState(false);
  const openFastLog = useCallback(() => setFastLogVisible(true), []);
  const closeFastLog = useCallback(() => setFastLogVisible(false), []);

  // ─── Undo snackbar ────────────────────────────────────────────────────────
  const [undoSnackbar, setUndoSnackbar] = useState<
    { message: string; onUndo: () => void } | null
  >(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideUndoSnackbar = useCallback(() => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setUndoSnackbar(null);
  }, []);

  const showUndoSnackbar = useCallback(
    (message: string, onUndo: () => void) => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      setUndoSnackbar({ message, onUndo });
      undoTimerRef.current = setTimeout(() => {
        setUndoSnackbar(null);
        undoTimerRef.current = null;
      }, 4000);
    },
    [],
  );

  // Clean up the timer when the provider unmounts so we don't leak a setTimeout.
  useEffect(
    () => () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    },
    [],
  );

  // ─── Hydrate from AsyncStorage on mount ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rawV2 = await AsyncStorage.getItem(STORAGE_KEY_V2);
        if (rawV2) {
          const parsed = JSON.parse(rawV2);
          const hydrated = parseBudgetBlob(parsed);
          // Fire any recurring rules whose day has passed this month and
          // haven't already fired. Pure: same input + date → same output.
          const withRecurring = runRecurringRules(
            hydrated,
            new Date(),
            () => `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          );
          if (!cancelled) setBlob(withRecurring);
        } else {
          // No v2 — check for a legacy v1 blob and migrate if present.
          const rawV1 = await AsyncStorage.getItem(STORAGE_KEY_V1);
          if (rawV1) {
            try {
              const v1 = JSON.parse(rawV1) as BudgetBlobV1;
              const migrated = migrateV1ToV2(v1);
              if (!cancelled) setBlob(migrated);
              // Persist the migrated blob immediately so we don't repeat work.
              await AsyncStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated));
              // Leave v1 in place — harmless, useful if rollback is ever needed.
            } catch {
              // Corrupt v1 — start fresh.
            }
          }
          // No data either way → keep the emptyBudgetBlob placeholder.
        }
      } catch {
        // Storage unavailable — keep the placeholder. App still works, just
        // won't persist this session.
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Persist on change (debounced) ────────────────────────────────────────
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isHydrated) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY_V2, JSON.stringify(blob)).catch(() => {
        // Silent failure — see lifecycle note.
      });
    }, PERSIST_DEBOUNCE_MS);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [blob, isHydrated]);

  // ─── Transactions ─────────────────────────────────────────────────────────
  const addTransaction = useCallback((t: Transaction) => {
    setBlob((prev) => ({
      ...prev,
      current: {
        ...prev.current,
        transactions: [t, ...prev.current.transactions],
      },
    }));
  }, []);

  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => {
    setBlob((prev) => {
      const txs = prev.current.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...patch } : tx,
      );
      return { ...prev, current: { ...prev.current, transactions: txs } };
    });
  }, []);

  const findTransaction = useCallback(
    (id: string): Transaction | null =>
      blob.current.transactions.find((tx) => tx.id === id) ?? null,
    [blob.current.transactions],
  );

  const removeTransaction = useCallback((id: string): Transaction | null => {
    let removed: Transaction | null = null;
    setBlob((prev) => {
      const idx = prev.current.transactions.findIndex((t) => t.id === id);
      if (idx === -1) return prev;
      removed = prev.current.transactions[idx];
      const next = prev.current.transactions.slice();
      next.splice(idx, 1);
      return {
        ...prev,
        current: { ...prev.current, transactions: next },
      };
    });
    return removed;
  }, []);

  // ─── Plan / currency ──────────────────────────────────────────────────────
  const setPlan = useCallback((plan: BudgetPlan) => {
    setBlob((prev) => ({
      ...prev,
      current: { ...prev.current, plan },
      setupComplete: true,
      setupStep: undefined,
    }));
  }, []);

  const setCurrency = useCallback((code: string) => {
    setBlob((prev) => ({ ...prev, currency: code }));
  }, []);

  // ─── Recurring rules ──────────────────────────────────────────────────────
  const addRecurring = useCallback(
    (rule: Omit<RecurringTransaction, 'id' | 'createdAt'>) => {
      // If the user creates a rule for a day already past in the current
      // month, mark it as already-fired-this-month so it doesn't backfire
      // immediately. Rule activates from the next cycle onward.
      const now = new Date();
      const todayDay = now.getUTCDate();
      const currentMonthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
      const alreadyPast = todayDay >= rule.dayOfMonth;
      const full: RecurringTransaction = {
        ...rule,
        lastGeneratedMonth: alreadyPast ? currentMonthKey : rule.lastGeneratedMonth,
        id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: now.toISOString(),
      };
      setBlob((prev) => ({ ...prev, recurring: [...prev.recurring, full] }));
    },
    [],
  );

  const updateRecurring = useCallback(
    (id: string, patch: Partial<RecurringTransaction>) => {
      setBlob((prev) => ({
        ...prev,
        recurring: prev.recurring.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      }));
    },
    [],
  );

  const removeRecurring = useCallback((id: string) => {
    setBlob((prev) => ({
      ...prev,
      recurring: prev.recurring.filter((r) => r.id !== id),
    }));
  }, []);

  // ─── Reminders ────────────────────────────────────────────────────────────
  const setRemindersEnabled = useCallback(async (next: boolean): Promise<boolean> => {
    if (next) {
      // Ask the OS for permission first. If denied, the toggle stays off and
      // we don't schedule anything. The UI bounces the switch back.
      const granted = await requestNotificationPermission();
      if (!granted) {
        setBlob((prev) => ({ ...prev, remindersEnabled: false }));
        return false;
      }
      await scheduleAllReminders().catch(() => {});
      setBlob((prev) => ({ ...prev, remindersEnabled: true }));
      return true;
    }
    await cancelAllReminders().catch(() => {});
    setBlob((prev) => ({ ...prev, remindersEnabled: false }));
    return false;
  }, []);

  // Re-schedule on every app launch when reminders are enabled — the OS can
  // drop scheduled notifications after device reboots or app updates.
  useEffect(() => {
    if (!isHydrated || !blob.remindersEnabled) return;
    scheduleAllReminders().catch(() => {});
  }, [isHydrated, blob.remindersEnabled]);

  // ─── Month close ──────────────────────────────────────────────────────────
  const [monthCloseBannerDismissed, setBannerDismissed] = useState(false);
  const dismissMonthCloseBanner = useCallback(() => setBannerDismissed(true), []);

  const closeMonth = useCallback((reflection: ReflectionData) => {
    setBlob((prev) => {
      const withReflection = {
        ...prev,
        current: { ...prev.current, reflection },
      };
      return rollForward(withReflection);
    });
    // Reset session dismissal so the next month's banner can appear if needed.
    setBannerDismissed(false);
  }, []);

  // ─── Destructive ──────────────────────────────────────────────────────────
  const resetAll = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_V2);
      await AsyncStorage.removeItem(STORAGE_KEY_V1);
    } catch {
      // Even if removal fails, swap state — next persist will overwrite.
    }
    setBlob(emptyBudgetBlob('USD'));
  }, []);

  const resetCurrentMonth = useCallback(() => {
    setBlob((prev) => ({
      ...prev,
      current: { ...prev.current, transactions: [] },
    }));
  }, []);

  // ─── Public value ─────────────────────────────────────────────────────────
  const value = useMemo<BudgetContextValue>(
    () => ({
      blob,
      currentMonth: blob.current,
      symbol: symbolFor(blob.currency),
      isHydrated,
      addTransaction,
      updateTransaction,
      removeTransaction,
      findTransaction,
      setPlan,
      setCurrency,
      recurring: blob.recurring,
      addRecurring,
      updateRecurring,
      removeRecurring,
      remindersEnabled: !!blob.remindersEnabled,
      setRemindersEnabled,
      closeMonth,
      monthCloseBannerDismissed,
      dismissMonthCloseBanner,
      resetAll,
      resetCurrentMonth,
      fastLogVisible,
      openFastLog,
      closeFastLog,
      showUndoSnackbar,
      hideUndoSnackbar,
      undoSnackbar,
    }),
    [
      blob,
      isHydrated,
      addTransaction,
      updateTransaction,
      removeTransaction,
      findTransaction,
      setPlan,
      setCurrency,
      addRecurring,
      updateRecurring,
      removeRecurring,
      setRemindersEnabled,
      closeMonth,
      monthCloseBannerDismissed,
      dismissMonthCloseBanner,
      resetAll,
      resetCurrentMonth,
      fastLogVisible,
      openFastLog,
      closeFastLog,
      showUndoSnackbar,
      hideUndoSnackbar,
      undoSnackbar,
    ],
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget(): BudgetContextValue {
  const ctx = useContext(BudgetContext);
  if (!ctx) {
    throw new Error('useBudget must be used within a <BudgetProvider>');
  }
  return ctx;
}

/** Convenience accessor that returns just the current month. */
export function useCurrentMonth(): MonthState {
  return useBudget().currentMonth;
}
