/**
 * RecurringDetailScreen — add or edit a single recurring transaction rule.
 *
 * Route param: `id` — pass `'new'` to create. Any other id loads that rule
 * from BudgetContext for editing.
 *
 * Fields:
 *   • Name (text)
 *   • Amount (CurrencyInput)
 *   • Category (chip row)
 *   • Day of month (1–31)
 *   • Active toggle (paused-vs-firing)
 *   • Optional note
 *
 * Actions:
 *   • Save (primary) — disabled until amount > 0 AND name has content
 *   • Delete (destructive, edit mode only)
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import type { CategoryId } from '@budgetplanner/core';

import { useTokens } from '../theme/ThemeProvider';
import { HeaderIconButton } from '../components/ScreenHeader';
import { CategoryDot } from '../components/CategoryDot';
import { CurrencyInput } from '../components/CurrencyInput';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Switch } from '../components/ui/Switch';
import { BottomSheet } from '../components/BottomSheet';
import { useBudget } from '../state/BudgetContext';
import { CATEGORY_IDS, CATEGORY_LABELS } from '../state/categories';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'RecurringDetail'>;

export function RecurringDetailScreen() {
  const t = useTokens();
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { symbol, recurring, addRecurring, updateRecurring, removeRecurring } = useBudget();

  const isNew = route.params.id === 'new';
  const existing = useMemo(
    () => (isNew ? null : recurring.find((r) => r.id === route.params.id)),
    [isNew, recurring, route.params.id],
  );

  // ─── Form state ───────────────────────────────────────────────────────────
  const [name, setName] = useState(existing?.name ?? '');
  const [amount, setAmount] = useState(existing?.amount ?? 0);
  const [categoryId, setCategoryId] = useState<CategoryId>(
    existing?.categoryId ?? 'rewards',
  );
  const [note, setNote] = useState(existing?.note ?? '');
  const [dayOfMonth, setDayOfMonth] = useState<number>(existing?.dayOfMonth ?? 1);
  const [active, setActive] = useState<boolean>(existing?.active ?? true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canSave = name.trim().length > 0 && amount > 0 && dayOfMonth >= 1 && dayOfMonth <= 31;

  const onSave = useCallback(() => {
    if (!canSave) return;
    if (isNew) {
      addRecurring({
        name: name.trim(),
        amount,
        categoryId,
        note: note.trim() || undefined,
        dayOfMonth,
        active,
      });
    } else if (existing) {
      updateRecurring(existing.id, {
        name: name.trim(),
        amount,
        categoryId,
        note: note.trim() || undefined,
        dayOfMonth,
        active,
      });
    }
    nav.goBack();
  }, [canSave, isNew, existing, name, amount, categoryId, note, dayOfMonth, active, addRecurring, updateRecurring, nav]);

  const onDelete = useCallback(() => {
    if (!existing) return;
    removeRecurring(existing.id);
    setConfirmDelete(false);
    nav.goBack();
  }, [existing, removeRecurring, nav]);

  // Not-found guard — happens if user back-navigates into a stale id.
  if (!isNew && !existing) {
    return (
      <View
        style={{ flex: 1, backgroundColor: t.color.bg.base, paddingTop: insets.top }}
      >
        <View
          style={{
            paddingHorizontal: t.space[4],
            paddingTop: t.space[2],
            minHeight: t.layout.minTapTarget,
          }}
        >
          <HeaderIconButton onPress={nav.goBack} accessibilityLabel="Back">
            <ChevronLeft size={26} color={t.color.text.primary} strokeWidth={1.75} />
          </HeaderIconButton>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: t.space[6] }}>
          <Text style={[t.type.subhead, { color: t.color.text.tertiary, textAlign: 'center' }]}>
            This recurring transaction is no longer available.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.color.bg.base, paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: t.space[4],
          paddingTop: t.space[2],
          paddingBottom: t.space[2],
          minHeight: t.layout.minTapTarget,
        }}
      >
        <HeaderIconButton onPress={nav.goBack} accessibilityLabel="Back">
          <ChevronLeft size={26} color={t.color.text.primary} strokeWidth={1.75} />
        </HeaderIconButton>
        {!isNew ? (
          <HeaderIconButton
            onPress={() => setConfirmDelete(true)}
            accessibilityLabel="Delete recurring transaction"
          >
            <Trash2 size={20} color={t.color.status.overBudget} strokeWidth={1.75} />
          </HeaderIconButton>
        ) : (
          <View style={{ width: t.layout.minTapTarget }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: t.space[10] }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: t.space[4], paddingTop: t.space[2] }}>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            accessibilityRole="header"
            style={[t.type.title1, { color: t.color.text.primary }]}
          >
            {isNew ? 'New recurring' : 'Edit recurring'}
          </Text>
        </View>

        {/* Name */}
        <FieldLabel>Name</FieldLabel>
        <View style={{ paddingHorizontal: t.space[4], paddingBottom: t.space[5] }}>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Netflix, gym, Spotify…"
            accessibilityLabel="Recurring name"
          />
        </View>

        {/* Amount */}
        <FieldLabel>Amount</FieldLabel>
        <View
          style={{
            paddingHorizontal: t.space[4],
            paddingBottom: t.space[5],
          }}
        >
          <CurrencyInput
            value={amount}
            onChange={setAmount}
            symbol={symbol}
            size="lg"
          />
        </View>

        {/* Category */}
        <FieldLabel>Category</FieldLabel>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: t.space[2],
            paddingHorizontal: t.space[4],
            paddingBottom: t.space[5],
          }}
        >
          {CATEGORY_IDS.map((id) => {
            const selected = categoryId === id;
            return (
              <Pressable
                key={id}
                onPress={() => setCategoryId(id)}
                accessibilityRole="button"
                accessibilityLabel={`${CATEGORY_LABELS[id]}${selected ? ', selected' : ''}`}
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: t.space[3],
                    paddingVertical: t.space[2],
                    borderRadius: t.radii.pill,
                    minHeight: 36,
                    backgroundColor: selected
                      ? t.color.text.primary
                      : pressed
                        ? t.color.bg.sunken
                        : 'transparent',
                    borderWidth: selected ? 0 : StyleSheet.hairlineWidth,
                    borderColor: t.color.border.divider,
                  },
                ]}
              >
                <CategoryDot
                  category={id}
                  size={8}
                  style={{ marginRight: t.space[2] }}
                />
                <Text
                  allowFontScaling
                  maxFontSizeMultiplier={t.a11y.maxFontScale}
                  style={[
                    t.type.subhead,
                    {
                      color: selected ? t.color.text.inverse : t.color.text.primary,
                      fontWeight: selected ? t.fontWeight.semibold : t.fontWeight.regular,
                    },
                  ]}
                >
                  {CATEGORY_LABELS[id]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Day of month */}
        <FieldLabel>Day of month</FieldLabel>
        <View style={{ paddingHorizontal: t.space[4], paddingBottom: t.space[2] }}>
          <Input
            value={String(dayOfMonth)}
            onChangeText={(v) =>
              setDayOfMonth(Math.max(1, Math.min(31, Number(v) || 1)))
            }
            keyboardType="numeric"
            accessibilityLabel="Day of month, 1 to 31"
          />
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.caption1,
              { color: t.color.text.tertiary, marginTop: t.space[1] },
            ]}
          >
            If a month has fewer days, fires on the last day instead.
          </Text>
        </View>

        {/* Note */}
        <FieldLabel>Note (optional)</FieldLabel>
        <View style={{ paddingHorizontal: t.space[4], paddingBottom: t.space[5] }}>
          <Input
            value={note}
            onChangeText={setNote}
            placeholder="Anything to remember"
            accessibilityLabel="Optional note"
          />
        </View>

        {/* Active toggle */}
        <View style={{ paddingHorizontal: t.space[4], paddingBottom: t.space[3] }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: t.space[4],
              backgroundColor: t.color.bg.elevated,
              borderRadius: t.radii.lg,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: t.color.border.hairline,
            }}
          >
            <View style={{ flex: 1, paddingRight: t.space[3] }}>
              <Text
                allowFontScaling
                maxFontSizeMultiplier={t.a11y.maxFontScale}
                style={[t.type.body, { color: t.color.text.primary }]}
              >
                Active
              </Text>
              <Text
                allowFontScaling
                maxFontSizeMultiplier={t.a11y.maxFontScale}
                style={[
                  t.type.footnote,
                  { color: t.color.text.secondary, marginTop: 2 },
                ]}
              >
                {active
                  ? 'Auto-fires on day ' + dayOfMonth + ' each month.'
                  : "Paused — won't fire until you turn this back on."}
              </Text>
            </View>
            <Switch
              value={active}
              onValueChange={setActive}
              accessibilityLabel="Active toggle"
            />
          </View>
        </View>
      </ScrollView>

      {/* Sticky save */}
      <View
        style={{
          paddingHorizontal: t.space[4],
          paddingTop: t.space[3],
          paddingBottom: Math.max(t.space[3], insets.bottom + t.space[3]),
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: t.color.border.hairline,
          backgroundColor: t.color.bg.base,
        }}
      >
        <Button
          variant="primary"
          size="md"
          onPress={onSave}
          disabled={!canSave}
          fullWidth
        >
          {isNew ? 'Add recurring' : 'Save changes'}
        </Button>
      </View>

      {/* Delete confirmation */}
      <BottomSheet
        visible={confirmDelete}
        onDismiss={() => setConfirmDelete(false)}
      >
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          accessibilityRole="header"
          style={[t.type.title2, { color: t.color.text.primary, marginBottom: t.space[2] }]}
        >
          Delete this recurring?
        </Text>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[t.type.body, { color: t.color.text.secondary, marginBottom: t.space[6] }]}
        >
          {name || existing?.name} will no longer auto-log. Past transactions
          it created stay in your history.
        </Text>
        <View style={{ flexDirection: 'row', gap: t.space[3], marginBottom: t.space[2] }}>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" onPress={() => setConfirmDelete(false)} fullWidth>
              Cancel
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button variant="destructive" onPress={onDelete} fullWidth>
              Delete
            </Button>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  const t = useTokens();
  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={t.a11y.maxFontScale}
      style={[
        t.type.caption2,
        {
          color: t.color.text.secondary,
          textTransform: 'uppercase',
          paddingHorizontal: t.space[4],
          paddingTop: t.space[3],
          marginBottom: t.space[2],
        },
      ]}
    >
      {children}
    </Text>
  );
}
