import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp as NavigationRouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { Wallet, Lock, PiggyBank, Home, Coffee, Star, Edit } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import type {
  IncomeSource,
  PriorityExpense,
  SavingsData,
  BucketsData,
  ReflectionData,
} from '@budgetplanner/core';
import {
  calcTotalIncome,
  calcTotalPriorities,
  calcSavingsAmount,
} from '@budgetplanner/core';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CompletedPlanRouteProp = NavigationRouteProp<RootStackParamList, 'CompletedPlan'>;

export function CompletedPlanScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CompletedPlanRouteProp>();
  const {
    income,
    expenses,
    savings,
    buckets,
    reflection,
    safeToSpend,
    currency,
  } = route.params;

  const totalIncome = calcTotalIncome(income);
  const totalExpenses = calcTotalPriorities(expenses);
  const savingsAmount = calcSavingsAmount(savings, totalIncome - totalExpenses);

  const handleReset = () => {
    navigation.navigate('BudgetWizard', { reset: true });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Your Monthly Budget Plan</Text>
        <Text style={styles.subtitle}>Here's your complete financial picture for this month</Text>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Safe to spend</Text>
        <Text style={styles.heroAmount}>
          {currency}{safeToSpend.toLocaleString()}
        </Text>
        <Text style={styles.heroSubtext}>
          After priorities and savings, this is what you can confidently spend
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Wallet size={20} color="#10b981" />
            <Text style={styles.cardTitle}>Income</Text>
          </View>
          <View style={styles.list}>
            {income.map((source) => (
              <View key={source.id} style={styles.listRow}>
                <Text style={styles.listLabel}>{source.name}</Text>
                <Text style={styles.listValue}>
                  {currency}{source.amount.toLocaleString()}
                </Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.listRow}>
              <Text style={styles.listTotalLabel}>Total</Text>
              <Text style={styles.listTotalValue}>
                {currency}{totalIncome.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Lock size={20} color="#64748b" />
            <Text style={styles.cardTitle}>Priority Expenses</Text>
          </View>
          <View style={styles.list}>
            {expenses.length > 0 ? (
              <>
                {expenses.map((expense) => (
                  <View key={expense.id} style={styles.listRow}>
                    <View style={styles.listLabelRow}>
                      <Text style={styles.listLabel}>{expense.name}</Text>
                      {expense.isFixed && <Lock size={12} color="#94a3b8" />}
                    </View>
                    <Text style={styles.listValue}>
                      {currency}{expense.amount.toLocaleString()}
                    </Text>
                  </View>
                ))}
                <View style={styles.divider} />
                <View style={styles.listRow}>
                  <Text style={styles.listTotalLabel}>Total</Text>
                  <Text style={styles.listTotalValue}>
                    {currency}{totalExpenses.toLocaleString()}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.emptyText}>No priority expenses added</Text>
            )}
          </View>
        </View>

        {savings.enabled && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <PiggyBank size={20} color="#10b981" />
              <Text style={styles.cardTitle}>Savings</Text>
            </View>
            <View style={styles.list}>
              <View style={styles.listRow}>
                <Text style={styles.listLabel}>
                  {savings.type === 'percentage'
                    ? `${savings.value}% of remaining`
                    : 'Fixed amount'}
                </Text>
                <Text style={styles.listValue}>
                  {currency}{savingsAmount.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {(buckets.needs > 0 || buckets.lifestyle > 0 || buckets.niceToHave > 0) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Spending Buckets</Text>
            <View style={styles.bucketsList}>
              {buckets.needs > 0 && (
                <View style={styles.bucketRow}>
                  <View style={[styles.bucketIcon, styles.bucketIconBlue]}>
                    <Home size={16} color="#2563eb" />
                  </View>
                  <Text style={styles.bucketLabel}>Needs</Text>
                  <Text style={styles.bucketValue}>
                    {currency}{buckets.needs.toLocaleString()}
                  </Text>
                </View>
              )}
              {buckets.lifestyle > 0 && (
                <View style={styles.bucketRow}>
                  <View style={[styles.bucketIcon, styles.bucketIconPurple]}>
                    <Coffee size={16} color="#9333ea" />
                  </View>
                  <Text style={styles.bucketLabel}>Lifestyle</Text>
                  <Text style={styles.bucketValue}>
                    {currency}{buckets.lifestyle.toLocaleString()}
                  </Text>
                </View>
              )}
              {buckets.niceToHave > 0 && (
                <View style={styles.bucketRow}>
                  <View style={[styles.bucketIcon, styles.bucketIconAmber]}>
                    <Star size={16} color="#d97706" />
                  </View>
                  <Text style={styles.bucketLabel}>Nice-to-have</Text>
                  <Text style={styles.bucketValue}>
                    {currency}{buckets.niceToHave.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {(reflection.tight || reflection.flexible || reflection.intentional) && (
        <View style={styles.reflectionCard}>
          <Text style={styles.reflectionTitle}>Your Reflections</Text>
          <View style={styles.reflections}>
            {reflection.tight && (
              <View style={styles.reflectionItem}>
                <Text style={styles.reflectionLabel}>What feels tight</Text>
                <Text style={styles.reflectionText}>{reflection.tight}</Text>
              </View>
            )}
            {reflection.flexible && (
              <View style={styles.reflectionItem}>
                <Text style={styles.reflectionLabel}>What feels flexible</Text>
                <Text style={styles.reflectionText}>{reflection.flexible}</Text>
              </View>
            )}
            {reflection.intentional && (
              <View style={styles.reflectionItem}>
                <Text style={styles.reflectionLabel}>Being intentional about</Text>
                <Text style={styles.reflectionText}>{reflection.intentional}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <Button variant="outline" onPress={handleReset} size="lg">
            <View style={styles.resetButtonContent}>
              <Edit size={16} color="#64748b" />
              <Text style={styles.resetButtonText}>Start a New Plan</Text>
            </View>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  heroCard: {
    backgroundColor: '#4f46e5',
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 14,
    color: '#c7d2fe',
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  heroSubtext: {
    fontSize: 14,
    color: '#c7d2fe',
    textAlign: 'center',
    maxWidth: 280,
  },
  grid: {
    gap: 16,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  list: {
    gap: 8,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  listValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  listTotalLabel: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  listTotalValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  bucketsList: {
    gap: 12,
  },
  bucketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bucketIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bucketIconBlue: {
    backgroundColor: '#dbeafe',
  },
  bucketIconPurple: {
    backgroundColor: '#f3e8ff',
  },
  bucketIconAmber: {
    backgroundColor: '#fef3c7',
  },
  bucketLabel: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
  },
  bucketValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  reflectionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 32,
  },
  reflectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  reflections: {
    gap: 12,
  },
  reflectionItem: {
    gap: 4,
  },
  reflectionLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  reflectionText: {
    fontSize: 16,
    color: '#1e293b',
  },
  actions: {
    alignItems: 'center',
  },
  actionButton: {
    width: '100%',
    maxWidth: 300,
  },
  resetButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resetButtonText: {
    color: '#64748b',
    fontSize: 16,
  },
});
