import React from 'react';
import { Switch as RNSwitch, Platform } from 'react-native';
import { useTokens } from '../../theme/ThemeProvider';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
}

/** iOS-native "on" green for switches. Matches system Settings behavior. */
const ON_GREEN = '#34C759';

/**
 * Thin wrapper over the platform switch. Uses the iOS-native green tint when
 * on — matches the system Settings and reads as active at a glance.
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
        true: ON_GREEN,
      }}
      thumbColor={Platform.OS === 'android' ? t.color.bg.elevated : undefined}
      ios_backgroundColor={t.color.bg.sunken}
    />
  );
}
