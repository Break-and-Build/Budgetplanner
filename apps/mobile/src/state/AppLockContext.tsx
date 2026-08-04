/**
 * AppLockContext — gates the whole app behind a PIN / biometric lock.
 *
 * Renders its children always, plus a full-screen LockScreen overlay whenever
 * the lock is enabled and currently locked (cold start, or after the app has
 * been backgrounded). All persistence lives in `lib/appLock` (secure store).
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus, View } from 'react-native';

import {
  changePin as libChangePin,
  disableLock as libDisableLock,
  enableLock as libEnableLock,
  isBiometricEnabled,
  isLockEnabled,
  setBiometricEnabled as libSetBiometric,
} from '../lib/appLock';
import { LockScreen } from '../components/LockScreen';

interface AppLockValue {
  ready: boolean;
  enabled: boolean;
  biometricEnabled: boolean;
  locked: boolean;
  /** Called by the LockScreen after a successful PIN / biometric unlock. */
  unlock: () => void;
  /** Enable the lock with a fresh PIN (+ whether to allow biometric). */
  enable: (pin: string, useBiometric: boolean) => Promise<void>;
  changePin: (pin: string) => Promise<void>;
  disable: () => Promise<void>;
  setBiometric: (on: boolean) => Promise<void>;
}

const AppLockContext = createContext<AppLockValue | null>(null);

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [locked, setLocked] = useState(false);

  const load = useCallback(async () => {
    const [en, bio] = await Promise.all([isLockEnabled(), isBiometricEnabled()]);
    setEnabled(en);
    setBiometricEnabled(bio);
    return en;
  }, []);

  // Initial load — start locked if a lock is configured.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const en = await load();
      if (cancelled) return;
      setLocked(en);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  // Re-lock when the app is sent to the background. Only 'background' (not
  // 'inactive') — the biometric prompt briefly makes the app 'inactive' and we
  // must not re-lock underneath it.
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'background' && enabledRef.current) setLocked(true);
    });
    return () => sub.remove();
  }, []);

  const unlock = useCallback(() => setLocked(false), []);

  const enable = useCallback(
    async (pin: string, useBiometric: boolean) => {
      await libEnableLock(pin, useBiometric);
      await load();
    },
    [load],
  );

  const changePin = useCallback(async (pin: string) => {
    await libChangePin(pin);
  }, []);

  const disable = useCallback(async () => {
    await libDisableLock();
    await load();
    setLocked(false);
  }, [load]);

  const setBiometric = useCallback(
    async (on: boolean) => {
      await libSetBiometric(on);
      await load();
    },
    [load],
  );

  const value: AppLockValue = {
    ready,
    enabled,
    biometricEnabled,
    locked,
    unlock,
    enable,
    changePin,
    disable,
    setBiometric,
  };

  return (
    <AppLockContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        {ready && enabled && locked ? <LockScreen /> : null}
      </View>
    </AppLockContext.Provider>
  );
}

export function useAppLock(): AppLockValue {
  const ctx = useContext(AppLockContext);
  if (!ctx) throw new Error('useAppLock must be used within AppLockProvider');
  return ctx;
}
