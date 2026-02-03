import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PiggyBank } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { CurrencyInput } from '../../components/CurrencyInput';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Switch } from '../../components/ui/Switch';
import type { SavingsData } from '@budgetplanner/core';
import { calcSavingsAmount } from '@budgetplanner/core';

interface SavingsAllocationScreenProps {
  savings: SavingsData;
  onUpdateSavings: (savings: SavingsData) => void;
  onNext: () => void;
  onBack: () => void;
  remainingAfterPriorities: number;
  currency: string;
}

export function SavingsAllocationScreen({
  savings,
  onUpdateSavings,
  onNext,
  onBack,
  remainingAfterPriorities,
  currency,
}: SavingsAllocationScreenProps) {
  const [savingsEnabled, setSavingsEnabled] = useState(savings.enabled);
  const [savingsType, setSavingsType] = useState<'amount' | 'percentage'>(savings.type);
  const [savingsValue, setSavingsValue] = useState(savings.value);

  const handleNext = () => {
    onUpdateSavings({
      enabled: savingsEnabled,
      type: savingsType,
      value: savingsValue,
    });
    onNext();
  };

  const savingsAmount = calcSavingsAmount(
    { enabled: savingsEnabled, type: savingsType, value: savingsValue },
    remainingAfterPriorities
  );
  const afterSavings = remainingAfterPriorities - savingsAmount;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Save before you spend?</Text>
        <Text style={styles.subtitle}>
          Setting aside savings now helps you stay intentional about what's left.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleContent}>
            <View style={styles.iconContainer}>
              <PiggyBank size={20} color="#10b981" />
            </View>
            <View>
              <Label>Enable monthly savings</Label>
              <Text style={styles.toggleSubtext}>Treat it like a priority expense</Text>
            </View>
          </View>
          <Switch value={savingsEnabled} onValueChange={setSavingsEnabled} />
        </View>

        {savingsEnabled && (
          <View style={styles.savingsContent}>
            <View style={styles.typeButtons}>
              <View style={styles.typeButton}>
                <Button
                  variant={savingsType === 'amount' ? 'default' : 'outline'}
                  onPress={() => setSavingsType('amount')}
                >
                  Fixed Amount
                </Button>
              </View>
              <View style={styles.typeButton}>
                <Button
                  variant={savingsType === 'percentage' ? 'default' : 'outline'}
                  onPress={() => setSavingsType('percentage')}
                >
                  Percentage
                </Button>
              </View>
            </View>

            <View style={styles.valueInput}>
              <Label>
                {savingsType === 'amount' ? `Amount (${currency})` : 'Percentage (%)'}
              </Label>
              {savingsType === 'amount' ? (
                <CurrencyInput
                  value={savingsValue}
                  onChange={setSavingsValue}
                  placeholder="0"
                />
              ) : (
                <Input
                  keyboardType="numeric"
                  value={savingsValue.toString()}
                  onChangeText={(text) => setSavingsValue(parseFloat(text) || 0)}
                  placeholder="10"
                />
              )}
            </View>

            {savingsValue > 0 && (
              <View style={styles.summary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>You'll save</Text>
                  <Text style={styles.summaryValue}>
                    {currency}{savingsAmount.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>This leaves you</Text>
                  <Text style={[styles.summaryValue, afterSavings < 0 && styles.summaryValueNegative]}>
                    {currency}{afterSavings.toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {!savingsEnabled && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No savings set for this month. You can always add savings later.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <Button variant="outline" onPress={onBack} size="lg">
            Back
          </Button>
        </View>
        <View style={styles.actionButton}>
          <Button onPress={handleNext} size="lg">
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 32,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#d1fae5',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  savingsContent: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 16,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  valueInput: {
    gap: 8,
  },
  summary: {
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#065f46',
  },
  summaryValue: {
    fontSize: 14,
    color: '#064e3b',
    fontWeight: '600',
  },
  summaryValueNegative: {
    color: '#dc2626',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
