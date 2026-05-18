/**
 * CurrencyPickerScreen — bundled currency catalogue with search.
 *
 * Two modes (selected via route param):
 *   • 'first-run' — undismissable, sticky "Use [Currency]" button at bottom,
 *     advances to SetupRitual on commit. Used on cold install.
 *   • 'edit'      — has a back chevron, commit returns to caller. Used from
 *     Settings → Currency.
 *
 * Both modes share the same list/search/select UI; only the chrome differs.
 */

import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Check, ChevronLeft } from 'lucide-react-native';
import { CURRENCIES, type Currency } from '@budgetplanner/core';

import { useTokens } from '../theme/ThemeProvider';
import { HeaderIconButton } from '../components/ScreenHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useBudget } from '../state/BudgetContext';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'FirstRun'>;

export function CurrencyPickerScreen() {
  const t = useTokens();
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { blob, setCurrency } = useBudget();

  const mode = route.params?.mode ?? 'first-run';
  const isFirstRun = mode === 'first-run';

  // ─── Selection state ──────────────────────────────────────────────────────
  // In first-run mode we default to nothing — the user must explicitly choose.
  // In edit mode we pre-select the current currency.
  const [selectedCode, setSelectedCode] = useState<string | null>(
    isFirstRun ? null : blob.currency,
  );
  const [search, setSearch] = useState('');

  // ─── Filtered list ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CURRENCIES;
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q),
    );
  }, [search]);

  const selected = useMemo(
    () => CURRENCIES.find((c) => c.code === selectedCode) ?? null,
    [selectedCode],
  );

  // ─── Commit ───────────────────────────────────────────────────────────────
  const onCommit = () => {
    if (!selectedCode) return;
    setCurrency(selectedCode);
    if (isFirstRun) {
      // Replace this screen with SetupRitual so the user can't back into it.
      nav.reset({ index: 0, routes: [{ name: 'SetupRitual' }] });
    } else {
      nav.goBack();
    }
  };

  const wide = width >= t.layout.breakpoint.wide;
  const maxWidth = wide ? t.layout.maxContentWidth : '100%';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.color.bg.base,
        paddingTop: insets.top,
      }}
    >
      <View style={{ flex: 1, alignSelf: 'center', width: '100%', maxWidth }}>
        {/* Header row — back button only in edit mode */}
        <View
          style={{
            paddingHorizontal: t.space[4],
            paddingTop: t.space[2],
            paddingBottom: t.space[2],
            minHeight: t.layout.minTapTarget,
          }}
        >
          {!isFirstRun ? (
            <HeaderIconButton onPress={nav.goBack} accessibilityLabel="Back">
              <ChevronLeft size={26} color={t.color.text.primary} strokeWidth={1.75} />
            </HeaderIconButton>
          ) : null}
        </View>

        {/* Title + subtitle */}
        <View style={{ paddingHorizontal: t.space[4], paddingBottom: t.space[4] }}>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            accessibilityRole="header"
            style={[t.type.title1, { color: t.color.text.primary }]}
          >
            {isFirstRun ? 'Pick your currency' : 'Change currency'}
          </Text>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.callout,
              { color: t.color.text.secondary, marginTop: t.space[1] },
            ]}
          >
            {isFirstRun
              ? 'You can change this later in Settings.'
              : 'Affects how amounts are displayed everywhere.'}
          </Text>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: t.space[4], paddingBottom: t.space[3] }}>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search currency, code, or symbol"
            accessibilityLabel="Search currencies"
          />
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.code}
          contentContainerStyle={{
            paddingHorizontal: t.space[4],
            paddingBottom: t.space[8] + (isFirstRun ? 80 : 0),
          }}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: t.color.border.hairline,
                marginLeft: 48 + t.space[3],
              }}
            />
          )}
          renderItem={({ item }) => (
            <CurrencyRow
              item={item}
              selected={item.code === selectedCode}
              onPress={() => setSelectedCode(item.code)}
            />
          )}
          ListEmptyComponent={
            <View style={{ paddingTop: t.space[8], alignItems: 'center' }}>
              <Text
                allowFontScaling
                maxFontSizeMultiplier={t.a11y.maxFontScale}
                style={[t.type.subhead, { color: t.color.text.tertiary }]}
              >
                No matches for "{search.trim()}".
              </Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />

        {/* Sticky commit button — first-run only.
            Edit mode commits immediately on row tap (see useEffect below). */}
        {isFirstRun ? (
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
              onPress={onCommit}
              disabled={!selectedCode}
              fullWidth
            >
              {selected ? `Use ${selected.name}` : 'Choose a currency'}
            </Button>
          </View>
        ) : null}
      </View>

      {/* Edit mode: commit immediately when the selection actually changes from
          the current value. This makes Settings → Currency feel snappy
          (one tap = applied) without requiring a separate save button. */}
      {!isFirstRun && selectedCode && selectedCode !== blob.currency ? (
        <CommitOnChange code={selectedCode} onCommit={onCommit} />
      ) : null}
    </View>
  );
}

// ─── Currency row ────────────────────────────────────────────────────────────

function CurrencyRow({
  item,
  selected,
  onPress,
}: {
  item: Currency;
  selected: boolean;
  onPress: () => void;
}) {
  const t = useTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.code}${selected ? ', selected' : ''}`}
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: t.space[3],
        backgroundColor: pressed ? t.color.bg.sunken : 'transparent',
        borderRadius: t.radii.sm,
        marginHorizontal: -t.space[2],
        paddingHorizontal: t.space[2],
      })}
    >
      {/* Symbol pill */}
      <View
        style={{
          width: 48,
          height: 36,
          borderRadius: t.radii.md,
          backgroundColor: t.color.bg.sunken,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: t.space[3],
        }}
      >
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.subhead,
            {
              color: t.color.text.primary,
              fontWeight: t.fontWeight.semibold,
            },
          ]}
        >
          {item.symbol}
        </Text>
      </View>

      {/* Name + code */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[t.type.body, { color: t.color.text.primary }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.footnote,
            { color: t.color.text.secondary, marginTop: 1 },
          ]}
        >
          {item.code}
        </Text>
      </View>

      {/* Check */}
      {selected ? <Check size={20} color={t.color.text.primary} strokeWidth={2} /> : null}
    </Pressable>
  );
}

// ─── Edit-mode commit helper ─────────────────────────────────────────────────
// Renders nothing visually. It just calls onCommit once when `code` changes.

function CommitOnChange({
  code,
  onCommit,
}: {
  code: string;
  onCommit: () => void;
}) {
  const lastSeen = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (lastSeen.current !== code) {
      lastSeen.current = code;
      onCommit();
    }
  }, [code, onCommit]);
  return null;
}
