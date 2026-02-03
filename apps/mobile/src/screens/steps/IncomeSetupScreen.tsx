import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Plus, Trash } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { CurrencyInput } from '../../components/CurrencyInput';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import type { IncomeSource } from '@budgetplanner/core';
import { calcTotalIncome } from '@budgetplanner/core';

interface IncomeSetupScreenProps {
  incomeSources: IncomeSource[];
  currency: string;
  onUpdateIncome: (sources: IncomeSource[]) => void;
  onUpdateCurrency: (currency: string) => void;
  onNext: () => void;
}

const CURRENCIES = [
  { label: '₦ Nigerian Naira (NGN)', value: '₦' },
  { label: '$ US Dollar (USD)', value: '$' },
  { label: '€ Euro (EUR)', value: '€' },
  { label: '£ British Pound (GBP)', value: '£' },
  { label: '¥ Japanese Yen (JPY)', value: '¥' },
  { label: '₹ Indian Rupee (INR)', value: '₹' },
  { label: 'R South African Rand (ZAR)', value: 'R' },
  { label: 'A$ Australian Dollar (AUD)', value: 'A$' },
  { label: 'C$ Canadian Dollar (CAD)', value: 'C$' },
];

export function IncomeSetupScreen({
  incomeSources,
  currency,
  onUpdateIncome,
  onUpdateCurrency,
  onNext,
}: IncomeSetupScreenProps) {
  const [sources, setSources] = useState<IncomeSource[]>(
    incomeSources.length > 0 ? incomeSources : [{ id: '1', name: 'Salary', amount: 0 }]
  );

  const addSource = () => {
    const newSource: IncomeSource = {
      id: Date.now().toString(),
      name: '',
      amount: 0,
    };
    setSources([...sources, newSource]);
  };

  const removeSource = (id: string) => {
    if (sources.length > 1) {
      setSources(sources.filter((s) => s.id !== id));
    }
  };

  const updateSource = (id: string, field: 'name' | 'amount', value: string | number) => {
    setSources(sources.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleNext = () => {
    onUpdateIncome(sources);
    onNext();
  };

  const totalIncome = calcTotalIncome(sources);
  const isValid = sources.every((s) => s.name.trim() && s.amount > 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Let's start with your income</Text>
        <Text style={styles.subtitle}>How much money do you have coming in this month?</Text>
      </View>

      <View style={styles.currencySection}>
        <Label>Select your currency</Label>
        <Select
          value={currency}
          onValueChange={onUpdateCurrency}
          items={CURRENCIES}
          placeholder="Select currency"
        />
      </View>

      <View style={styles.sourcesContainer}>
        {sources.map((source, index) => (
          <View key={source.id} style={styles.sourceRow}>
            <View style={styles.sourceInput}>
              {index === 0 && <Label>Source name</Label>}
              <Input
                placeholder="e.g., Salary, Freelance"
                value={source.name}
                onChangeText={(text) => updateSource(source.id, 'name', text)}
              />
            </View>
            <View style={styles.sourceInput}>
              {index === 0 && <Label>Amount ({currency})</Label>}
              <CurrencyInput
                value={source.amount}
                onChange={(value) => updateSource(source.id, 'amount', value)}
                placeholder="0"
              />
            </View>
            {sources.length > 1 && (
              <View style={styles.deleteButton}>
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={() => removeSource(source.id)}
                >
                  <Trash size={16} color="#ef4444" />
                </Button>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={addSource}
        >
          <View style={styles.addButtonContent}>
            <Plus size={16} color="#64748b" />
            <Text style={styles.addButtonText}>Add another income source</Text>
          </View>
        </TouchableOpacity>
      </View>

      {totalIncome > 0 && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total monthly income</Text>
          <Text style={styles.totalAmount}>
            {currency}{totalIncome.toLocaleString()}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <Button
            onPress={handleNext}
            disabled={!isValid}
            size="lg"
          >
            Continue
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  currencySection: {
    marginBottom: 24,
  },
  sourcesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 24,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sourceInput: {
    flex: 1,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#64748b',
    fontSize: 16,
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 32,
  },
  actionButton: {
    flex: 1,
    maxWidth: 200,
  },
  deleteButton: {
    marginLeft: 8,
  },
  addButton: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
});
