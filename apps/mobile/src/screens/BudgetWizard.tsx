import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { IncomeSetupScreen } from './steps/IncomeSetupScreen';
import { PriorityExpensesScreen } from './steps/PriorityExpensesScreen';
import { SavingsAllocationScreen } from './steps/SavingsAllocationScreen';
import { SafeToSpendScreen } from './steps/SafeToSpendScreen';
import { FlexibleBucketsScreen } from './steps/FlexibleBucketsScreen';
import { MonthlyReflectionScreen } from './steps/MonthlyReflectionScreen';
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
  calcSafeToSpend,
} from '@budgetplanner/core';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type BudgetWizardRouteProp = RouteProp<RootStackParamList, 'BudgetWizard'>;

const STORAGE_KEY = 'budgetplanner:mobile:v1';

export function BudgetWizard() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BudgetWizardRouteProp>();
  const [currentStep, setCurrentStep] = useState(1);
  const [currency, setCurrency] = useState('₦');
  const [isHydrated, setIsHydrated] = useState(false);

  // State for each step
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [expenses, setExpenses] = useState<PriorityExpense[]>([]);
  const [savings, setSavings] = useState<SavingsData>({
    enabled: false,
    type: 'amount',
    value: 0,
  });
  const [buckets, setBuckets] = useState<BucketsData>({
    needs: 0,
    lifestyle: 0,
    niceToHave: 0,
  });
  const [reflection, setReflection] = useState<ReflectionData>({
    tight: '',
    flexible: '',
    intentional: '',
  });

  useEffect(() => {
    let isMounted = true;
    const hydrate = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) {
          return;
        }
        const parsed = JSON.parse(stored) as {
          currentStep?: number;
          currency?: string;
          incomeSources?: IncomeSource[];
          expenses?: PriorityExpense[];
          savings?: SavingsData;
          buckets?: BucketsData;
          reflection?: ReflectionData;
        };

        if (parsed) {
          const safeStep =
            typeof parsed.currentStep === 'number'
              ? Math.min(6, Math.max(1, parsed.currentStep))
              : 1;
          setCurrentStep(safeStep);
          setCurrency(parsed.currency || '₦');
          setIncomeSources(Array.isArray(parsed.incomeSources) ? parsed.incomeSources : []);
          setExpenses(Array.isArray(parsed.expenses) ? parsed.expenses : []);
          setSavings(
            parsed.savings || {
              enabled: false,
              type: 'amount',
              value: 0,
            }
          );
          setBuckets(
            parsed.buckets || {
              needs: 0,
              lifestyle: 0,
              niceToHave: 0,
            }
          );
          setReflection(
            parsed.reflection || {
              tight: '',
              flexible: '',
              intentional: '',
            }
          );
        }
      } catch {
        // Ignore hydration errors and start fresh.
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    hydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    const payload = {
      currentStep,
      currency,
      incomeSources,
      expenses,
      savings,
      buckets,
      reflection,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [
    isHydrated,
    currentStep,
    currency,
    incomeSources,
    expenses,
    savings,
    buckets,
    reflection,
  ]);

  useEffect(() => {
    if (!route.params?.reset) {
      return;
    }

    setCurrentStep(1);
    setCurrency('₦');
    setIncomeSources([]);
    setExpenses([]);
    setSavings({ enabled: false, type: 'amount', value: 0 });
    setBuckets({ needs: 0, lifestyle: 0, niceToHave: 0 });
    setReflection({ tight: '', flexible: '', intentional: '' });
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    navigation.setParams({ reset: false });
  }, [navigation, route.params?.reset]);

  // Calculations
  const totalIncome = calcTotalIncome(incomeSources);
  const totalPriorities = calcTotalPriorities(expenses);
  const remainingAfterPriorities = totalIncome - totalPriorities;
  const savingsAmount = calcSavingsAmount(savings, remainingAfterPriorities);
  const safeToSpend = calcSafeToSpend(totalIncome, totalPriorities, savingsAmount);

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);
  
  const handleFinish = () => {
    navigation.navigate('CompletedPlan', {
      income: incomeSources,
      expenses,
      savings,
      buckets,
      reflection,
      safeToSpend,
      currency,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Priority-Based Budget Planner</Text>
        <Text style={styles.subtitle}>Plan your month with confidence and clarity</Text>
      </View>

      <ProgressIndicator currentStep={currentStep} totalSteps={6} />

      <View style={styles.stepContent}>
        {currentStep === 1 && (
          <IncomeSetupScreen
            incomeSources={incomeSources}
            currency={currency}
            onUpdateIncome={setIncomeSources}
            onUpdateCurrency={setCurrency}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <PriorityExpensesScreen
            expenses={expenses}
            onUpdateExpenses={setExpenses}
            onNext={handleNext}
            onBack={handleBack}
            totalIncome={totalIncome}
            currency={currency}
          />
        )}

        {currentStep === 3 && (
          <SavingsAllocationScreen
            savings={savings}
            onUpdateSavings={setSavings}
            onNext={handleNext}
            onBack={handleBack}
            remainingAfterPriorities={remainingAfterPriorities}
            currency={currency}
          />
        )}

        {currentStep === 4 && (
          <SafeToSpendScreen
            safeToSpend={safeToSpend}
            totalIncome={totalIncome}
            totalPriorities={totalPriorities}
            totalSavings={savingsAmount}
            onNext={handleNext}
            onBack={handleBack}
            currency={currency}
          />
        )}

        {currentStep === 5 && (
          <FlexibleBucketsScreen
            buckets={buckets}
            onUpdateBuckets={setBuckets}
            onNext={handleNext}
            onBack={handleBack}
            safeToSpend={safeToSpend}
            currency={currency}
          />
        )}

        {currentStep === 6 && (
          <MonthlyReflectionScreen
            reflection={reflection}
            onUpdateReflection={setReflection}
            onFinish={handleFinish}
            onBack={handleBack}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  },
  stepContent: {
    marginTop: 48,
    flex: 1,
  },
});
