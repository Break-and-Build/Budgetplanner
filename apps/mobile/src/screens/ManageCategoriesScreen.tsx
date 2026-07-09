/**
 * ManageCategoriesScreen — standalone editor for the plan's categories.
 *
 * Reached from Settings. Reuses the shared CategoryEditor (same UI as the
 * setup step). Edits persist live; on close we normalise the percentages to
 * total 100 so the plan is always balanced.
 */

import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X } from 'lucide-react-native';
import { normalizeCategoryPercents } from '@budgetplanner/core';

import { useTokens } from '../theme/ThemeProvider';
import { HeaderIconButton } from '../components/ScreenHeader';
import { CategoryEditor } from '../components/CategoryEditor';
import { useBudget } from '../state/BudgetContext';
import { monthSafeToSpend } from '../state/selectors';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ManageCategoriesScreen() {
  const t = useTokens();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { categories, setCategories, symbol, currentMonth } = useBudget();

  const safe = monthSafeToSpend(currentMonth.plan);

  const close = () => {
    // Always leave the plan balanced to exactly 100%.
    setCategories(normalizeCategoryPercents(categories));
    nav.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.color.bg.base, paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: t.space[4],
          paddingTop: t.space[2],
          paddingBottom: t.space[2],
          minHeight: t.layout.minTapTarget,
        }}
      >
        <View style={{ width: t.layout.minTapTarget }} />
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          accessibilityRole="header"
          style={[t.type.headline, { color: t.color.text.primary, flex: 1, textAlign: 'center' }]}
        >
          Categories
        </Text>
        <HeaderIconButton onPress={close} accessibilityLabel="Done">
          <X size={22} color={t.color.text.primary} strokeWidth={1.75} />
        </HeaderIconButton>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: t.space[4],
          paddingTop: t.space[3],
          paddingBottom: insets.bottom + t.space[10],
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[t.type.footnote, { color: t.color.text.secondary, marginBottom: t.space[4] }]}
        >
          Name your categories, pick a colour, and set the share of your
          safe-to-spend each one gets. Percentages should total 100%.
        </Text>

        <CategoryEditor
          categories={categories}
          onChange={setCategories}
          symbol={symbol}
          safeToSpend={safe}
        />
      </ScrollView>
    </View>
  );
}
