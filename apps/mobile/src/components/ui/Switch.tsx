import React from 'react';
import { Switch as RNSwitch, StyleSheet } from 'react-native';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Switch({ value, onValueChange }: SwitchProps) {
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#cbd5e1', true: '#4f46e5' }}
      thumbColor={value ? '#ffffff' : '#f4f4f5'}
    />
  );
}
