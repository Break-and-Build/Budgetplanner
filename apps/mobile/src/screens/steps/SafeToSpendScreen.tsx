import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';

interface SafeToSpendScreenProps {
  safeToSpend: number;
  totalIncome: number;
  totalPriorities: number;
  totalSavings: number;
  currency: string;
  onNext: () => void;
  onBack: () => void;
}

export function SafeToSpendScreen({
  safeToSpend,
  totalIncome,
  totalPriorities,
  totalSavings,
  currency,
  onNext,
  onBack,
}: SafeToSpendScreenProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Sparkles size={16} color="#d97706" />
          <Text style={styles.badgeText}>Here's your number</Text>
        </View>
        <Text style={styles.title}>Safe to spend this month</Text>
        <Text style={styles.amount}>
          {currency}{safeToSpend.toLocaleString()}
        </Text>
        <Text style={styles.subtitle}>
          This is what you have left after covering priorities and savings.
          Spend this amount with confidence.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Here's the breakdown</Text>
        <View style={styles.breakdown}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Total income</Text>
            <Text style={styles.breakdownValue}>
              {currency}{totalIncome.toLocaleString()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Priority expenses</Text>
            <Text style={styles.breakdownValue}>
              -{currency}{totalPriorities.toLocaleString()}
            </Text>
          </View>
          {totalSavings > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Savings</Text>
              <Text style={styles.breakdownValue}>
                -{currency}{totalSavings.toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownValue}>Safe to spend</Text>
            <Text style={styles.safeToSpendValue}>
              {currency}{safeToSpend.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <Button variant="outline" onPress={onBack} size="lg">
            Back
          </Button>
        </View>
        <View style={styles.actionButton}>
          <Button onPress={onNext} size="lg">
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
    marginBottom: 48,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  amount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#4f46e5',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 300,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 16,
  },
  breakdown: {
    gap: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  breakdownValue: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  safeToSpendValue: {
    fontSize: 16,
    color: '#4f46e5',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
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
});
