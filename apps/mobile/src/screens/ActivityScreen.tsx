/**
 * ActivityScreen — the chronological transaction feed.
 *
 * Above the fold (top → bottom):
 *   • Title "Activity" + search icon
 *   • (Inline search field, visible after tapping the icon)
 *   • Filter chip row: All · Essentials · Growth · Stability · Rewards
 *   • SectionList of transactions, grouped by day, newest first
 *
 * Three empty-state variants:
 *   • Month has zero transactions → "Tap + to log your first transaction"
 *   • Category filter has zero matches → "Nothing here yet in <Category>"
 *   • Search has zero matches → "No matches for '<query>'"
 *
 * SectionList virtualizes by default — rows off-screen are not rendered.
 * That's our "lazy load" for v1; explicit pagination is overkill until we
 * have months of accumulated transactions.
 */

import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Search, X, Plus } from 'lucide-react-native';
import type { CategoryId, Transaction } from '@budgetplanner/core';

import { useTokens } from '../theme/ThemeProvider';
import { TabShell } from '../components/TabShell';
import { ScreenHeader, HeaderIconButton } from '../components/ScreenHeader';
import { CategoryDot } from '../components/CategoryDot';
import { DayHeader } from '../components/DayHeader';
import { TransactionRow } from '../components/TransactionRow';
import { Input } from '../components/ui/Input';
import { useBudget } from '../state/BudgetContext';
import { CATEGORY_IDS, CATEGORY_LABELS } from '../state/categories';
import type { RootStackParamList, MainTabsParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList> &
  BottomTabNavigationProp<MainTabsParamList>;

type FilterValue = 'all' | CategoryId;

export function ActivityScreen() {
  const t = useTokens();
  const nav = useNavigation<Nav>();
  const { currentMonth, symbol, openFastLog } = useBudget();

  const [filter, setFilter] = useState<FilterValue>('all');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // ─── Filter + group ───────────────────────────────────────────────────────
  const { sections, totalAfterFilter } = useMemo(() => {
    let txs = currentMonth.transactions;
    if (filter !== 'all') {
      txs = txs.filter((t) => t.categoryId === filter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      txs = txs.filter((tx) => {
        const inNote = !!tx.note && tx.note.toLowerCase().includes(q);
        // Search amount as a string too — typing "1800" finds the coffee.
        const inAmount = String(tx.amount).includes(q);
        return inNote || inAmount;
      });
    }
    // Sort newest first
    const sorted = [...txs].sort((a, b) => (a.loggedAt < b.loggedAt ? 1 : -1));
    // Group by ISO date key
    const groups = new Map<string, Transaction[]>();
    for (const tx of sorted) {
      const k = isoDateKey(new Date(tx.loggedAt));
      const bucket = groups.get(k);
      if (bucket) bucket.push(tx);
      else groups.set(k, [tx]);
    }
    return {
      sections: Array.from(groups.entries()).map(([title, data]) => ({ title, data })),
      totalAfterFilter: sorted.length,
    };
  }, [currentMonth.transactions, filter, search]);

  const monthHasAny = currentMonth.transactions.length > 0;

  // ─── Header actions ───────────────────────────────────────────────────────
  const headerRight = (
    <HeaderIconButton
      onPress={() => {
        setSearchOpen((v) => !v);
        if (searchOpen) setSearch(''); // closing the field clears the query
      }}
      accessibilityLabel={searchOpen ? 'Close search' : 'Search transactions'}
    >
      {searchOpen ? (
        <X size={22} color={t.color.text.primary} strokeWidth={1.75} />
      ) : (
        <Search size={22} color={t.color.text.primary} strokeWidth={1.75} />
      )}
    </HeaderIconButton>
  );

  // ─── FAB ──────────────────────────────────────────────────────────────────
  const fab = (
    <Pressable
      onPress={openFastLog}
      accessibilityRole="button"
      accessibilityLabel="Log a transaction"
      style={({ pressed }) => ({
        width: t.layout.fabSize,
        height: t.layout.fabSize,
        borderRadius: t.layout.fabSize / 2,
        backgroundColor: pressed ? t.color.fab.pressed : t.color.fab.bg,
        alignItems: 'center',
        justifyContent: 'center',
        ...t.shadow.lg,
      })}
    >
      <Plus color={t.color.fab.icon} size={26} strokeWidth={2.25} />
    </Pressable>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <TabShell fab={fab}>
      <ScreenHeader title="Activity" right={headerRight} />

      {/* Inline search field — appears below header when search is open */}
      {searchOpen ? (
        <View style={{ paddingHorizontal: t.space[4], paddingBottom: t.space[3] }}>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search by note or amount"
            autoFocus
            accessibilityLabel="Search transactions"
          />
        </View>
      ) : null}

      {/* Filter chips — effectively sticky by being outside the SectionList */}
      <FilterChipRow value={filter} onChange={setFilter} />

      {/* The list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: t.space[12],
          flexGrow: 1,
        }}
        renderSectionHeader={({ section }) => <DayHeader date={section.title} />}
        renderItem={({ item, index, section }) => (
          <View>
            <TransactionRow
              transaction={item}
              symbol={symbol}
              categoryLabel={CATEGORY_LABELS[item.categoryId]}
              onPress={() => nav.navigate('TransactionDetail', { id: item.id })}
            />
            {index < section.data.length - 1 ? (
              <View
                style={{
                  height: StyleSheet.hairlineWidth,
                  backgroundColor: t.color.border.hairline,
                  marginLeft: t.space[4] + 8 + t.space[3], // past dot + gap
                }}
              />
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            monthHasAny={monthHasAny}
            filter={filter}
            search={search}
            onLogPress={openFastLog}
          />
        }
        // Performance — virtualization is already on by default.
        initialNumToRender={20}
        windowSize={5}
        removeClippedSubviews
      />
    </TabShell>
  );
}

// ─── Filter chip row ─────────────────────────────────────────────────────────

function FilterChipRow({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}) {
  const t = useTokens();
  const chips: Array<{ value: FilterValue; label: string; categoryId?: CategoryId }> = [
    { value: 'all', label: 'All' },
    ...CATEGORY_IDS.map((id) => ({
      value: id as FilterValue,
      label: CATEGORY_LABELS[id],
      categoryId: id,
    })),
  ];
  return (
    <View
      // ScrollView could be used, but the 5 chips fit comfortably on every
      // supported width (≥320pt). Wrapping is fine on the smallest devices.
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: t.space[2],
        paddingHorizontal: t.space[4],
        paddingBottom: t.space[4],
      }}
    >
      {chips.map((chip) => {
        const selected = chip.value === value;
        return (
          <Pressable
            key={chip.value}
            onPress={() => onChange(chip.value)}
            accessibilityRole="button"
            accessibilityLabel={`Filter ${chip.label}${selected ? ', selected' : ''}`}
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: t.space[3],
                paddingVertical: t.space[2],
                borderRadius: t.radii.pill,
                minHeight: 32,
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
            {chip.categoryId ? (
              <CategoryDot
                category={chip.categoryId}
                size={8}
                style={{ marginRight: t.space[2] }}
              />
            ) : null}
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              style={[
                t.type.footnote,
                {
                  color: selected ? t.color.text.inverse : t.color.text.primary,
                  fontWeight: selected ? t.fontWeight.semibold : t.fontWeight.medium,
                },
              ]}
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({
  monthHasAny,
  filter,
  search,
  onLogPress,
}: {
  monthHasAny: boolean;
  filter: FilterValue;
  search: string;
  onLogPress: () => void;
}) {
  const t = useTokens();

  let primary: string;
  let secondary: string | null = null;
  let showLogPrompt = false;

  if (search.trim()) {
    primary = `No matches for "${search.trim()}".`;
    secondary = 'Try a different word or amount.';
  } else if (filter !== 'all') {
    primary = `Nothing here yet in ${CATEGORY_LABELS[filter as CategoryId]}.`;
    secondary = monthHasAny ? 'You haven\'t logged anything in this category this month.' : null;
  } else {
    primary = 'No transactions yet.';
    secondary = 'Tap + to log your first.';
    showLogPrompt = true;
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: t.space[10],
        paddingHorizontal: t.space[6],
      }}
    >
      <Text
        allowFontScaling
        maxFontSizeMultiplier={t.a11y.maxFontScale}
        style={[
          t.type.subhead,
          { color: t.color.text.tertiary, textAlign: 'center' },
        ]}
      >
        {primary}
      </Text>
      {secondary ? (
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
          {secondary}
        </Text>
      ) : null}
      {showLogPrompt ? (
        <Pressable
          onPress={onLogPress}
          accessibilityRole="button"
          accessibilityLabel="Log a transaction"
          style={({ pressed }) => ({
            marginTop: t.space[6],
            paddingHorizontal: t.space[5],
            paddingVertical: t.space[3],
            borderRadius: t.radii.pill,
            backgroundColor: pressed ? t.color.fab.pressed : t.color.text.primary,
          })}
        >
          <Text
            style={[
              t.type.subhead,
              {
                color: t.color.text.inverse,
                fontWeight: t.fontWeight.semibold,
              },
            ]}
          >
            Log a transaction
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function isoDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
