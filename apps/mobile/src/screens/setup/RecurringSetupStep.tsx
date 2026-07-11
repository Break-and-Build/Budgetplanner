/**
 * SetupRitual "Recurring" step.
 *
 * Optional. Lets people add monthly bills (rent, subscriptions, gym) during
 * onboarding so they don't have to discover the feature in Settings later.
 * Reuses the existing RecurringDetail form via navigation — no duplicate UI —
 * and this step just shows the running list + a skip/continue.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Trash2 } from 'lucide-react-native';

import { useTokens } from '../../theme/ThemeProvider';
import { ModalStackShell } from '../../components/ModalStackShell';
import { AmountDisplay } from '../../components/AmountDisplay';
import { CategoryDot } from '../../components/CategoryDot';
import { useBudget } from '../../state/BudgetContext';
import { resolveCategory } from '../../state/categories';
import { StepHeader } from './StepHeader';
import type { StepProps } from './types';
import type { RootStackParamList } from '../../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function RecurringSetupStep({ step, totalSteps, mode = 'create', form, onNext, onBack }: StepProps) {
  const t = useTokens();
  const nav = useNavigation<Nav>();
  const { recurring, symbol, removeRecurring } = useBudget();
  const categories = form.categories;

  return (
    <ModalStackShell
      step={step}
      totalSteps={totalSteps}
      primaryAction={{
        label: recurring.length > 0 ? 'Continue' : 'Skip for now',
        onPress: onNext,
      }}
      secondaryAction={{ label: 'Back', onPress: onBack }}
    >
      <StepHeader
        step={step}
        totalSteps={totalSteps}
        stepName="Recurring"
        question="Anything that repeats?"
        mode={mode}
      />

      <View style={{ paddingHorizontal: t.space[4] }}>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[t.type.subhead, { color: t.color.text.secondary, marginBottom: t.space[5] }]}
        >
          Rent, subscriptions, a gym — add bills that repeat monthly and they'll
          log themselves each month. Optional, and you can manage them any time in
          Settings.
        </Text>

        {recurring.length > 0 ? (
          <View
            style={{
              backgroundColor: t.color.bg.elevated,
              borderRadius: t.radii.lg,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: t.color.border.hairline,
              overflow: 'hidden',
              marginBottom: t.space[4],
            }}
          >
            {recurring.map((r, i) => {
              const cat = resolveCategory(categories, r.categoryId);
              return (
                <View key={r.id}>
                  {i > 0 ? (
                    <View
                      style={{
                        height: StyleSheet.hairlineWidth,
                        backgroundColor: t.color.border.hairline,
                        marginLeft: t.space[4],
                      }}
                    />
                  ) : null}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: t.space[4],
                      paddingVertical: t.space[3],
                      gap: t.space[3],
                    }}
                  >
                    <CategoryDot color={cat.color} size={8} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        allowFontScaling
                        maxFontSizeMultiplier={t.a11y.maxFontScale}
                        numberOfLines={1}
                        style={[t.type.body, { color: t.color.text.primary }]}
                      >
                        {r.name}
                      </Text>
                      <Text
                        allowFontScaling
                        maxFontSizeMultiplier={t.a11y.maxFontScale}
                        style={[t.type.footnote, { color: t.color.text.secondary, marginTop: 2 }]}
                      >
                        {cat.name} · day {r.dayOfMonth}
                      </Text>
                    </View>
                    <AmountDisplay value={r.amount} symbol={symbol} size="md" align="right" />
                    <Pressable
                      onPress={() => removeRecurring(r.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${r.name}`}
                      hitSlop={8}
                      style={({ pressed }) => ({ padding: t.space[1], opacity: pressed ? 0.5 : 1 })}
                    >
                      <Trash2 size={18} color={t.color.text.tertiary} strokeWidth={1.75} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Add button — reuses the existing RecurringDetail form */}
        <Pressable
          onPress={() => nav.navigate('RecurringDetail', { id: 'new' })}
          accessibilityRole="button"
          accessibilityLabel="Add a recurring bill"
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: t.space[2],
            paddingVertical: t.space[4],
            borderRadius: t.radii.lg,
            borderWidth: 1,
            borderColor: t.color.brand.base,
            backgroundColor: pressed ? t.color.brand.tint : 'transparent',
          })}
        >
          <Plus size={18} color={t.color.brand.base} strokeWidth={2} />
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[t.type.body, { color: t.color.brand.base, fontWeight: t.fontWeight.semibold }]}
          >
            Add recurring bill
          </Text>
        </Pressable>
      </View>
    </ModalStackShell>
  );
}
