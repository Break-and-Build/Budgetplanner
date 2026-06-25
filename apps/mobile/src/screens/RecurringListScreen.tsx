/**
 * RecurringListScreen — manage subscriptions and other monthly auto-logged
 * transactions.
 *
 * Reached from: Settings → Recurring.
 *
 * Layout:
 *   • Header with back chevron + title + "Add" button
 *   • Each rule renders as a row: name, category dot + label, amount, day,
 *     paused-vs-active visual treatment
 *   • Empty state when no rules exist
 *
 * Tapping a row → RecurringDetailScreen (edit mode).
 * Tapping "Add" → RecurringDetailScreen with id='new' (create mode).
 */

import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useTokens } from '../theme/ThemeProvider';
import { HeaderIconButton } from '../components/ScreenHeader';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryDot } from '../components/CategoryDot';
import { useBudget } from '../state/BudgetContext';
import { CATEGORY_LABELS } from '../state/categories';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function RecurringListScreen() {
  const t = useTokens();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { recurring, symbol } = useBudget();

  return (
    <View style={{ flex: 1, backgroundColor: t.color.bg.base, paddingTop: insets.top }}>
      {/* Header — back + title + add */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: t.space[4],
          paddingTop: t.space[2],
          paddingBottom: t.space[3],
          minHeight: t.layout.minTapTarget,
        }}
      >
        <HeaderIconButton onPress={nav.goBack} accessibilityLabel="Back">
          <ChevronLeft size={26} color={t.color.text.primary} strokeWidth={1.75} />
        </HeaderIconButton>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          accessibilityRole="header"
          style={[t.type.title2, { color: t.color.text.primary, flex: 1, textAlign: 'center' }]}
        >
          Recurring
        </Text>
        <HeaderIconButton
          onPress={() => nav.navigate('RecurringDetail', { id: 'new' })}
          accessibilityLabel="Add a recurring transaction"
        >
          <Plus size={24} color={t.color.brand.base} strokeWidth={2} />
        </HeaderIconButton>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + t.space[8],
        }}
      >
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.callout,
            {
              color: t.color.text.secondary,
              paddingHorizontal: t.space[4],
              paddingBottom: t.space[4],
            },
          ]}
        >
          Subscriptions and monthly charges that auto-log on their scheduled day.
        </Text>

        {recurring.length === 0 ? (
          <View style={{ paddingTop: t.space[8], paddingHorizontal: t.space[6], alignItems: 'center' }}>
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              style={[t.type.subhead, { color: t.color.text.tertiary, textAlign: 'center' }]}
            >
              No recurring transactions yet.
            </Text>
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              style={[
                t.type.footnote,
                {
                  color: t.color.text.tertiary,
                  marginTop: t.space[1],
                  textAlign: 'center',
                },
              ]}
            >
              Tap + to add your first.
            </Text>
          </View>
        ) : (
          <View
            style={{
              marginHorizontal: t.space[4],
              backgroundColor: t.color.bg.elevated,
              borderRadius: t.radii.lg,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: t.color.border.hairline,
              overflow: 'hidden',
            }}
          >
            {recurring.map((rule, idx) => (
              <View key={rule.id}>
                <Pressable
                  onPress={() => nav.navigate('RecurringDetail', { id: rule.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${rule.name}, ${symbol}${rule.amount} on day ${rule.dayOfMonth}, ${rule.active ? 'active' : 'paused'}`}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: t.space[4],
                    paddingVertical: t.space[3],
                    minHeight: 64,
                    backgroundColor: pressed ? t.color.bg.sunken : 'transparent',
                    opacity: rule.active ? 1 : 0.55,
                  })}
                >
                  <CategoryDot
                    category={rule.categoryId}
                    size={8}
                    style={{ marginRight: t.space[3] }}
                  />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      allowFontScaling
                      maxFontSizeMultiplier={t.a11y.maxFontScale}
                      style={[t.type.body, { color: t.color.text.primary }]}
                      numberOfLines={1}
                    >
                      {rule.name}
                      {!rule.active ? '  · Paused' : ''}
                    </Text>
                    <Text
                      allowFontScaling
                      maxFontSizeMultiplier={t.a11y.maxFontScale}
                      style={[
                        t.type.footnote,
                        { color: t.color.text.secondary, marginTop: 2 },
                      ]}
                    >
                      {CATEGORY_LABELS[rule.categoryId]} · day {rule.dayOfMonth}
                    </Text>
                  </View>
                  <AmountDisplay
                    value={rule.amount}
                    symbol={symbol}
                    size="md"
                    align="right"
                  />
                  <ChevronRight
                    size={18}
                    color={t.color.text.tertiary}
                    strokeWidth={1.75}
                    style={{ marginLeft: t.space[2] }}
                  />
                </Pressable>
                {idx < recurring.length - 1 ? (
                  <View
                    style={{
                      height: StyleSheet.hairlineWidth,
                      backgroundColor: t.color.border.hairline,
                      marginLeft: t.space[4] + 8 + t.space[3],
                    }}
                  />
                ) : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
