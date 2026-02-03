import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { formatNumber, parseNumber } from '@budgetplanner/core';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0",
}: CurrencyInputProps) {
  const handleChange = (text: string) => {
    const parsed = parseNumber(text);
    onChange(parsed);
  };

  return (
    <TextInput
      style={styles.input}
      value={formatNumber(value)}
      onChangeText={handleChange}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      keyboardType="numeric"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    minHeight: 44,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#1e293b',
  },
});
