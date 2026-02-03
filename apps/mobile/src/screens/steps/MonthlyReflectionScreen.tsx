import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Heart, Sparkles } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import type { ReflectionData } from '@budgetplanner/core';

interface MonthlyReflectionScreenProps {
  reflection: ReflectionData;
  onUpdateReflection: (reflection: ReflectionData) => void;
  onFinish: () => void;
  onBack: () => void;
}

export function MonthlyReflectionScreen({
  reflection,
  onUpdateReflection,
  onFinish,
  onBack,
}: MonthlyReflectionScreenProps) {
  const [tight, setTight] = useState(reflection.tight);
  const [flexible, setFlexible] = useState(reflection.flexible);
  const [intentional, setIntentional] = useState(reflection.intentional);

  const handleFinish = () => {
    onUpdateReflection({ tight, flexible, intentional });
    onFinish();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Heart size={16} color="#4f46e5" />
          <Text style={styles.badgeText}>Almost done</Text>
        </View>
        <Text style={styles.title}>Quick reflection</Text>
        <Text style={styles.subtitle}>
          These prompts are optional but can help you stay mindful.
        </Text>
      </View>

      <View style={styles.reflectionsContainer}>
        <View style={styles.reflectionCard}>
          <Label>What feels tight this month?</Label>
          <Input
            multiline
            numberOfLines={3}
            placeholder="e.g., Rent is taking up more than I'd like..."
            value={tight}
            onChangeText={setTight}
          />
        </View>

        <View style={styles.reflectionCard}>
          <Label>What feels flexible?</Label>
          <Input
            multiline
            numberOfLines={3}
            placeholder="e.g., I have some room for entertainment this month..."
            value={flexible}
            onChangeText={setFlexible}
          />
        </View>

        <View style={styles.reflectionCard}>
          <View style={styles.intentionalHeader}>
            <Sparkles size={16} color="#d97706" />
            <Label>One thing you'll be intentional about</Label>
          </View>
          <Input
            multiline
            numberOfLines={3}
            placeholder="e.g., I'll cook at home more often..."
            value={intentional}
            onChangeText={setIntentional}
          />
        </View>
      </View>

      <View style={styles.completionCard}>
        <Text style={styles.completionTitle}>You're all set! 🎉</Text>
        <Text style={styles.completionText}>
          Your budget plan is ready. Remember, this is a guide—not a rulebook.
          Adjust as you go and be kind to yourself.
        </Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <Button variant="outline" onPress={onBack} size="lg">
            Back
          </Button>
        </View>
        <View style={styles.actionButton}>
          <Button onPress={handleFinish} size="lg">
            View My Plan
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 14,
    color: '#312e81',
    fontWeight: '500',
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
  reflectionsContainer: {
    gap: 24,
    marginBottom: 32,
  },
  reflectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    gap: 12,
  },
  intentionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completionCard: {
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    marginBottom: 32,
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  completionText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
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
