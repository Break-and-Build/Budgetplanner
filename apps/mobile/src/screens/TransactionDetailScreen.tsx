/**
 * TransactionDetailScreen — edit or delete a single transaction.
 *
 * Reached from:
 *   • Activity row tap
 *   • Home recent-activity row tap
 *   • CategoryDetail row tap
 *
 * Fields:
 *   • Amount — editable (CurrencyInput, lg)
 *   • Category — editable (chip row)
 *   • Note — editable
 *   • Date — read-only in v1 (timestamp locked, brief decision)
 *
 * Actions:
 *   • Save (primary, sticky bottom) — disabled until amount > 0
 *   • Delete (destructive, opens a confirmation BottomSheet)
 *
 * Closing without saving discards in-flight edits. We do NOT prompt
 * "discard changes?" — the user can always edit again, and prompts
 * break the Apple-Wallet calm.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
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
import { BottomSheet } from '../components/BottomSheet';
import { useBudget } from '../state/BudgetContext';
import { CATEGORY_IDS, CATEGORY_LABELS } from '../state/categories';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'TransactionDetail'>;

export function TransactionDetailScreen() {
  const t = useTokens();
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const {
    symbol,
    findTransaction,
    updateTransaction,
    removeTransaction,
    addTransaction,
    showUndoSnackbar,
  } = useBudget();

  const tx = findTransaction(route.params.id);

  // ─── Local form state ─────────────────────────────────────────────────────
  // Initialised from the looked-up transaction. The screen is a single-use
  // form (not a master-detail), so initialising once on mount is fine.
  const [amount, setAmount] = useState(tx?.amount ?? 0);
  const [categoryId, setCategoryId] = useState<CategoryId>(tx?.categoryId ?? 'essentials');
  const [note, setNote] = useState(tx?.note ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Defensive re-sync if the param changes (shouldn't happen, but cheap insurance).
  useEffect(() => {
    if (tx) {
      setAmount(tx.amount);
      setCategoryId(tx.categoryId);
      setNote(tx.note ?? '');
    }
  }, [tx?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Derived ──────────────────────────────────────────────────────────────
  const canSave = amount > 0;
  const dirty = useMemo(
    () =>
      !!tx &&
      (amount !== tx.amount ||
        categoryId !== tx.categoryId ||
        (note.trim() || undefined) !== tx.note),
    [tx, amount, categoryId, note],
  );

  const onSave = useCallback(() => {
    if (!tx || !canSave) return;
    updateTransaction(tx.id, {
      amount,
      categoryId,
      note: note.trim() || undefined,
    });
    nav.goBack();
  }, [tx, amount, categoryId, note, canSave, updateTransaction, nav]);

  const onDelete = useCallback(() => {
    if (!tx) return;
    // Capture the removed transaction so we can re-add it on Undo. The order
    // matters: close the sheet first, navigate back, then surface the
    // snackbar on whatever screen we returned to.
    const removed = removeTransaction(tx.id);
    setConfirmDelete(false);
    nav.goBack();
    if (removed) {
      showUndoSnackbar('Transaction deleted', () => addTransaction(removed));
    }
  }, [tx, removeTransaction, nav, showUndoSnackbar, addTransaction]);

  const wide = width >= t.layout.breakpoint.wide;
  const maxWidth = wide ? t.layout.maxContentWidth : '100%';

  // ─── "Not found" guard ────────────────────────────────────────────────────
  // Happens if the user navigates back to a stale TransactionDetail after the
  // row was deleted from somewhere else.
  if (!tx) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: t.color.bg.base,
          paddingTop: insets.top,
        }}
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
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: t.space[6],
          }}
        >
          <Text style={[t.type.subhead, { color: t.color.text.tertiary, textAlign: 'center' }]}>
            This transaction is no longer available.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.color.bg.base,
        paddingTop: insets.top,
      }}
    >
      <View style={{ flex: 1, alignSelf: 'center', width: '100%', maxWidth }}>
        {/* Header row: back + delete */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: t.space[4],
            paddingTop: t.space[2],
            paddingBottom: t.space[2],
            minHeight: t.layout.minTapTarget,
          }}
        >
          <HeaderIconButton onPress={nav.goBack} accessibilityLabel="Back">
            <ChevronLeft size={26} color={t.color.text.primary} strokeWidth={1.75} />
          </HeaderIconButton>
          <HeaderIconButton
            onPress={() => setConfirmDelete(true)}
            accessibilityLabel="Delete transaction"
          >
            <Trash2 size={20} color={t.color.status.overBudget} strokeWidth={1.75} />
          </HeaderIconButton>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: t.space[10] }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Screen title */}
          <View style={{ paddingHorizontal: t.space[4], paddingTop: t.space[2] }}>
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              accessibilityRole="header"
              style={[t.type.title1, { color: t.color.text.primary }]}
            >
              Edit transaction
            </Text>
          </View>

          {/* Amount */}
          <FieldLabel>Amount</FieldLabel>
          <View
            style={{
              paddingHorizontal: t.space[4],
              paddingTop: t.space[4],
              paddingBottom: t.space[2],
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
                      // Selected → light-indigo tinted pill, matches Activity + FastLog.
                      backgroundColor: selected
                        ? t.color.brand.tint
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
                        color: selected ? t.color.brand.base : t.color.text.primary,
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

          {/* Note */}
          <FieldLabel>Note</FieldLabel>
          <View
            style={{
              paddingHorizontal: t.space[4],
              paddingBottom: t.space[5],
            }}
          >
            <Input
              value={note}
              onChangeText={setNote}
              placeholder="What was it for?"
              accessibilityLabel="Transaction note"
            />
          </View>

          {/* Date — read-only in v1 */}
          <FieldLabel>Logged</FieldLabel>
          <View
            style={{
              paddingHorizontal: t.space[4],
              paddingBottom: t.space[2],
            }}
          >
            <View
              style={{
                minHeight: 48,
                paddingHorizontal: t.space[4],
                paddingVertical: t.space[3],
                backgroundColor: t.color.bg.sunken,
                borderRadius: t.radii.md,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: t.color.border.hairline,
                justifyContent: 'center',
              }}
            >
              <Text
                allowFontScaling
                maxFontSizeMultiplier={t.a11y.maxFontScale}
                style={[t.type.body, { color: t.color.text.primary }]}
              >
                {formatFullDate(new Date(tx.loggedAt))}
              </Text>
            </View>
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              style={[
                t.type.caption1,
                { color: t.color.text.tertiary, marginTop: t.space[1] },
              ]}
            >
              Timestamp locked in v1. To re-date, delete and re-log.
            </Text>
          </View>
        </ScrollView>

        {/* Sticky save bar */}
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
            disabled={!canSave || !dirty}
            fullWidth
          >
            {dirty ? 'Save changes' : 'No changes'}
          </Button>
        </View>
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
          Delete this transaction?
        </Text>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.body,
            { color: t.color.text.secondary, marginBottom: t.space[6] },
          ]}
        >
          {symbol}
          {tx.amount.toLocaleString('en-US')} from {CATEGORY_LABELS[tx.categoryId]}
          {tx.note ? ` · ${tx.note}` : ''}.
        </Text>
        <View style={{ flexDirection: 'row', gap: t.space[3], marginBottom: t.space[2] }}>
          <View style={{ flex: 1 }}>
            <Button
              variant="secondary"
              onPress={() => setConfirmDelete(false)}
              fullWidth
            >
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

// ─── FieldLabel ──────────────────────────────────────────────────────────────
// The uppercase tracked caption that sits above each form field. Inlined
// because the same pattern appears 4 times in this screen and nowhere else.

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

// ─── Utils ───────────────────────────────────────────────────────────────────

function formatFullDate(d: Date): string {
  const date = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${date} at ${time}`;
}
