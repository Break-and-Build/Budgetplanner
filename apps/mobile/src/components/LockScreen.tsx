/**
 * LockScreen — full-screen overlay shown while the app is locked. Unlock via
 * biometrics (auto-prompted when enabled) or by entering the PIN.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTokens } from '../theme/ThemeProvider';
import { PinPad } from './PinPad';
import { useAppLock } from '../state/AppLockContext';
import {
  PIN_LENGTH,
  authenticateBiometric,
  biometricAvailable,
  verifyPin,
} from '../lib/appLock';

export function LockScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { biometricEnabled, unlock } = useAppLock();

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [canBiometric, setCanBiometric] = useState(false);

  const tryBiometric = useCallback(async () => {
    if (!biometricEnabled) return;
    if (!(await biometricAvailable())) return;
    const ok = await authenticateBiometric();
    if (ok) unlock();
  }, [biometricEnabled, unlock]);

  // Auto-prompt biometrics when the lock screen appears.
  useEffect(() => {
    let active = true;
    (async () => {
      const available = biometricEnabled && (await biometricAvailable());
      if (!active) return;
      setCanBiometric(available);
      if (available) tryBiometric();
    })();
    return () => {
      active = false;
    };
  }, [biometricEnabled, tryBiometric]);

  // Verify when a full PIN is entered.
  useEffect(() => {
    if (pin.length < PIN_LENGTH) return;
    let active = true;
    (async () => {
      const ok = await verifyPin(pin);
      if (!active) return;
      if (ok) {
        unlock();
      } else {
        setError(true);
        setTimeout(() => {
          if (active) {
            setPin('');
            setError(false);
          }
        }, 600);
      }
    })();
    return () => {
      active = false;
    };
  }, [pin, unlock]);

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: t.color.bg.base,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Brand mark — the real app icon, not a letter placeholder */}
      <Image
        source={require('../../assets/icon.png')}
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          marginBottom: t.space[5],
        }}
        accessibilityIgnoresInvertColors
      />

      {/* Full-width + centred so long names never clip on narrow screens. */}
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          t.type.title2,
          {
            color: t.color.text.primary,
            marginBottom: t.space[2],
            alignSelf: 'stretch',
            textAlign: 'center',
            paddingHorizontal: t.space[6],
          },
        ]}
      >
        Budget Tracker
      </Text>
      <Text
        style={[
          t.type.subhead,
          {
            color: error ? t.color.status.overBudget : t.color.text.secondary,
            marginBottom: t.space[8],
            alignSelf: 'stretch',
            textAlign: 'center',
            paddingHorizontal: t.space[6],
          },
        ]}
      >
        {error ? 'Wrong PIN, try again' : 'Enter your PIN to unlock'}
      </Text>

      <PinPad
        value={pin}
        onChange={setPin}
        error={error}
        onBiometric={canBiometric ? tryBiometric : undefined}
      />
    </View>
  );
}
