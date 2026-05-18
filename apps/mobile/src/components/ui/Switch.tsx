import React from 'react';
import { Switch as RNSwitch, Platform } from 'react-native';
import { useTokens } from '../../theme/ThemeProvider';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
}

/**
 * Native switch tinted with ink rather than a brand color. Keeps the
 * Apple-Wallet calm — switches are not the place to introduce color.
 */
export function Switch({ value, onValueChange, accessibilityLabel }: SwitchProps) {
  const t = useTokens();
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      accessibilityLabel={accessibilityLabel}
      // iOS uses trackColor.true as the "on" tint; on Android it uses both track + thumb.
      trackColor={{
        false: Platform.OS === 'ios' ? undefined : t.color.text.tertiary,
        true: t.color.text.primary,
      }}
      thumbColor={Platform.OS === 'android' ? t.color.bg.elevated : undefined}
      ios_backgroundColor={t.color.bg.sunken}
    />
  );
}
