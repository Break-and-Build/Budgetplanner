/**
 * AppLockSetupScreen — create a PIN (and opt into biometrics) to enable the
 * app lock, or change an existing PIN.
 *
 * Route param `mode`:
 *   'enable' → create → confirm → (biometric opt-in) → enable lock
 *   'change' → create → confirm → save new PIN
 */

import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { X } from 'lucide-react-native';

import { useTokens } from '../theme/ThemeProvider';
import { HeaderIconButton } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { PinPad } from '../components/PinPad';
import { useAppLock } from '../state/AppLockContext';
import { PIN_LENGTH, biometricAvailable } from '../lib/appLock';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AppLockSetup'>;

type Step = 'create' | 'confirm' | 'biometric';

export function AppLockSetupScreen() {
  const t = useTokens();
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { enable, changePin } = useAppLock();
  const mode = route.params?.mode ?? 'enable';

  const [step, setStep] = useState<Step>('create');
  const [first, setFirst] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);

  useEffect(() => {
    biometricAvailable().then(setBioAvailable);
  }, []);

  // Advance the flow each time a full PIN is entered.
  useEffect(() => {
    if (pin.length < PIN_LENGTH) return;

    if (step === 'create') {
      setFirst(pin);
      setPin('');
      setStep('confirm');
      return;
    }

    if (step === 'confirm') {
      if (pin !== first) {
        // Mismatch — restart.
        setError(true);
        setTimeout(() => {
          setError(false);
          setPin('');
          setFirst('');
          setStep('create');
        }, 700);
        return;
      }
      // Match. For 'change' we're done; for 'enable' offer biometrics.
      if (mode === 'change') {
        changePin(first).then(() => nav.goBack());
      } else if (bioAvailable) {
        setStep('biometric');
      } else {
        enable(first, false).then(() => nav.goBack());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const finishEnable = (useBiometric: boolean) => {
    enable(first, useBiometric).then(() => nav.goBack());
  };

  const title =
    step === 'create'
      ? mode === 'change'
        ? 'Enter a new PIN'
        : 'Create a PIN'
      : step === 'confirm'
        ? 'Confirm your PIN'
        : 'Unlock with Face ID?';

  return (
    <View style={{ flex: 1, backgroundColor: t.color.bg.base, paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingHorizontal: t.space[4],
          paddingTop: t.space[2],
          minHeight: t.layout.minTapTarget,
        }}
      >
        <HeaderIconButton onPress={nav.goBack} accessibilityLabel="Cancel">
          <X size={22} color={t.color.text.primary} strokeWidth={1.75} />
        </HeaderIconButton>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: insets.bottom + t.space[8] }}>
        <Text style={[t.type.title2, { color: t.color.text.primary, marginBottom: t.space[2] }]}>
          {title}
        </Text>

        {step === 'biometric' ? (
          <>
            <Text
              style={[
                t.type.subhead,
                { color: t.color.text.secondary, marginBottom: t.space[8], textAlign: 'center', paddingHorizontal: t.space[6] },
              ]}
            >
              Use Face ID or Touch ID to unlock quickly. You can still use your PIN any time.
            </Text>
            <View style={{ width: 280, gap: t.space[3] }}>
              <Button variant="primary" size="lg" fullWidth onPress={() => finishEnable(true)}>
                Use Face ID
              </Button>
              <Button variant="secondary" size="lg" fullWidth onPress={() => finishEnable(false)}>
                Just the PIN
              </Button>
            </View>
          </>
        ) : (
          <>
            <Text
              style={[
                t.type.subhead,
                { color: error ? t.color.status.overBudget : t.color.text.secondary, marginBottom: t.space[8] },
              ]}
            >
              {error ? "PINs didn't match — start over" : `Choose a ${PIN_LENGTH}-digit PIN`}
            </Text>
            <PinPad value={pin} onChange={setPin} error={error} />
          </>
        )}
      </View>
    </View>
  );
}
