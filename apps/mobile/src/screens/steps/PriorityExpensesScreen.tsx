import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Plus, Trash, Lock } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { CurrencyInput } from '../../components/CurrencyInput';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Switch } from '../../components/ui/Switch';
import type { PriorityExpense } from '@budgetplanner/core';
import { calcTotalPriorities } from '@budgetplanner/core';

interface PriorityExpensesScreenProps {
  expenses: PriorityExpense[];
  onUpdateExpenses: (expenses: PriorityExpense[]) => void;
  onNext: () => void;
  onBack: () => void;
  totalIncome: number;
  currency: string;
}

export function PriorityExpensesScreen({
  expenses,
  onUpdateExpenses,
  onNext,
  onBack,
  totalIncome,
  currency,
}: PriorityExpensesScreenProps) {
  const [items, setItems] = useState<PriorityExpense[]>(
    expenses.length > 0 ? expenses : []
  );

  const addExpense = () => {
    const newExpense: PriorityExpense = {
      id: Date.now().toString(),
      name: '',
      amount: 0,
      isFixed: true,
    };
    setItems([...items, newExpense]);
  };

  const removeExpense = (id: string) => {
    setItems(items.filter((e) => e.id !== id));
  };

  const updateExpense = (
    id: string,
    field: keyof PriorityExpense,
    value: string | number | boolean
  ) => {
    setItems(items.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const handleNext = () => {
    onUpdateExpenses(items);
    onNext();
  };

  const totalExpenses = calcTotalPriorities(items);
  const remaining = totalIncome - totalExpenses;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Priority expenses</Text>
        <Text style={styles.subtitle}>
          Add the expenses that must be paid every month—the non-negotiables.
        </Text>
      </View>

      <View style={styles.expensesContainer}>
        {items.map((expense) => (
          <View key={expense.id} style={styles.expenseCard}>
            <View style={styles.expenseContent}>
              <Input
                placeholder="e.g., Rent, Gym, Internet"
                value={expense.name}
                onChangeText={(text) => updateExpense(expense.id, 'name', text)}
              />
              <CurrencyInput
                placeholder="0"
                value={expense.amount}
                onChange={(value) => updateExpense(expense.id, 'amount', value)}
              />
              <View style={styles.switchRow}>
                <Switch
                  value={expense.isFixed}
                  onValueChange={(checked) => updateExpense(expense.id, 'isFixed', checked)}
                />
                <Text style={styles.switchLabel}>
                  {expense.isFixed ? 'Fixed amount' : 'Estimated amount'}
                </Text>
                {expense.isFixed && <Lock size={12} color="#94a3b8" />}
              </View>
            </View>
            <View style={styles.deleteButton}>
              <Button
                variant="ghost"
                size="icon"
                onPress={() => removeExpense(expense.id)}
              >
                <Trash size={16} color="#ef4444" />
              </Button>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={addExpense}
        >
          <View style={styles.addButtonContent}>
            <Plus size={16} color="#64748b" />
            <Text style={styles.addButtonText}>Add priority expense</Text>
          </View>
        </TouchableOpacity>
      </View>

      {totalExpenses > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total priority expenses</Text>
            <Text style={styles.summaryValue}>
              {currency}{totalExpenses.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text style={[styles.summaryValue, remaining < 0 && styles.summaryValueNegative]}>
              {currency}{remaining.toLocaleString()}
            </Text>
          </View>
        </View>
      )}

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
  expensesContainer: {
    marginBottom: 24,
  },
  expenseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  expenseContent: {
    flex: 1,
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#64748b',
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
  summaryContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 32,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  summaryValueNegative: {
    color: '#dc2626',
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
