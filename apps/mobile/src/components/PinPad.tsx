/**
 * PinPad — the dots + numeric keypad used by the lock screen and PIN setup.
 * Controlled: the parent owns the `value` string and reacts when it reaches
 * `length`.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Delete, ScanFace } from 'lucide-react-native';
import { PIN_LENGTH } from '../lib/appLock';
import { useTokens } from '../theme/ThemeProvider';

interface PinPadProps {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  /** When true, the dots render in the error colour. */
  error?: boolean;
  /** If provided, the bottom-left key becomes a biometric-unlock button. */
  onBiometric?: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function PinPad({ value, onChange, length = PIN_LENGTH, error, onBiometric }: PinPadProps) {
  const t = useTokens();

  const press = (digit: string) => {
    if (value.length >= length) return;
    onChange(value + digit);
  };
  const backspace = () => onChange(value.slice(0, -1));

  const dotColor = error ? t.color.status.overBudget : t.color.text.primary;

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Dots */}
      <View style={{ flexDirection: 'row', gap: t.space[4], marginBottom: t.space[8] }}>
        {Array.from({ length }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              borderWidth: 1.5,
              borderColor: dotColor,
              backgroundColor: i < value.length ? dotColor : 'transparent',
            }}
          />
        ))}
      </View>

      {/* Keypad */}
      <View style={{ width: 280, flexDirection: 'row', flexWrap: 'wrap', rowGap: t.space[3] }}>
        {KEYS.map((k) => (
          <Key key={k} onPress={() => press(k)} label={k} />
        ))}
        {/* Bottom row: biometric / empty, 0, backspace */}
        {onBiometric ? (
          <Key onPress={onBiometric} accessibilityLabel="Unlock with biometrics">
            <ScanFace size={26} color={t.color.text.primary} strokeWidth={1.75} />
          </Key>
        ) : (
          <View style={{ width: '33.33%', height: 64 }} />
        )}
        <Key onPress={() => press('0')} label="0" />
        <Key onPress={backspace} accessibilityLabel="Delete">
          <Delete size={24} color={t.color.text.primary} strokeWidth={1.75} />
        </Key>
      </View>
    </View>
  );
}

function Key({
  label,
  children,
  onPress,
  accessibilityLabel,
}: {
  label?: string;
  children?: React.ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const t = useTokens();
  return (
    <View style={{ width: '33.33%', alignItems: 'center' }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        style={({ pressed }) => ({
          width: 64,
          height: 64,
          borderRadius: 32,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pressed ? t.color.bg.sunken : 'transparent',
        })}
      >
        {label ? (
          <Text style={[t.type.title1, { color: t.color.text.primary, fontWeight: t.fontWeight.regular }]}>
            {label}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    </View>
  );
}
