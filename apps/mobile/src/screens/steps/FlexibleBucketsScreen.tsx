import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Home, Coffee, Star } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { CurrencyInput } from '../../components/CurrencyInput';
import { Label } from '../../components/ui/Label';
import type { BucketsData } from '@budgetplanner/core';

interface FlexibleBucketsScreenProps {
  buckets: BucketsData;
  onUpdateBuckets: (buckets: BucketsData) => void;
  onNext: () => void;
  onBack: () => void;
  safeToSpend: number;
  currency: string;
}

export function FlexibleBucketsScreen({
  buckets,
  onUpdateBuckets,
  onNext,
  onBack,
  safeToSpend,
  currency,
}: FlexibleBucketsScreenProps) {
  const [needs, setNeeds] = useState(buckets.needs);
  const [lifestyle, setLifestyle] = useState(buckets.lifestyle);
  const [niceToHave, setNiceToHave] = useState(buckets.niceToHave);

  const handleNext = () => {
    onUpdateBuckets({ needs, lifestyle, niceToHave });
    onNext();
  };

  const totalAllocated = needs + lifestyle + niceToHave;
  const remaining = safeToSpend - totalAllocated;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Allocate your spending (optional)</Text>
        <Text style={styles.subtitle}>
          Break down your {currency}{safeToSpend.toLocaleString()} into simple buckets.
          This is flexible—adjust as you go.
        </Text>
      </View>

      <View style={styles.bucketsContainer}>
        <View style={styles.bucketCard}>
          <View style={styles.bucketHeader}>
            <View style={[styles.iconContainer, styles.iconBlue]}>
              <Home size={20} color="#2563eb" />
            </View>
            <View style={styles.bucketInfo}>
              <Label>Needs</Label>
              <Text style={styles.bucketSubtext}>Groceries, transport, essentials</Text>
            </View>
          </View>
          <CurrencyInput
            value={needs}
            onChange={setNeeds}
            placeholder="0"
          />
        </View>

        <View style={styles.bucketCard}>
          <View style={styles.bucketHeader}>
            <View style={[styles.iconContainer, styles.iconPurple]}>
              <Coffee size={20} color="#9333ea" />
            </View>
            <View style={styles.bucketInfo}>
              <Label>Lifestyle</Label>
              <Text style={styles.bucketSubtext}>Eating out, entertainment, hobbies</Text>
            </View>
          </View>
          <CurrencyInput
            value={lifestyle}
            onChange={setLifestyle}
            placeholder="0"
          />
        </View>

        <View style={styles.bucketCard}>
          <View style={styles.bucketHeader}>
            <View style={[styles.iconContainer, styles.iconAmber]}>
              <Star size={20} color="#d97706" />
            </View>
            <View style={styles.bucketInfo}>
              <Label>Nice-to-have</Label>
              <Text style={styles.bucketSubtext}>Treats, spontaneous fun, extras</Text>
            </View>
          </View>
          <CurrencyInput
            value={niceToHave}
            onChange={setNiceToHave}
            placeholder="0"
          />
        </View>
      </View>

      {totalAllocated > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Allocated</Text>
            <Text style={styles.summaryValue}>
              {currency}{totalAllocated.toLocaleString()}
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
  bucketsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  bucketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    gap: 12,
  },
  bucketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBlue: {
    backgroundColor: '#dbeafe',
  },
  iconPurple: {
    backgroundColor: '#f3e8ff',
  },
  iconAmber: {
    backgroundColor: '#fef3c7',
  },
  bucketInfo: {
    flex: 1,
  },
  bucketSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
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
});
