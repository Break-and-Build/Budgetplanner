/**
 * CategoryEditor — the shared editor for a plan's percentage-based categories.
 *
 * Used by the SetupRitual "Categories" step and the standalone Manage
 * Categories screen. Handles: rename, recolour (palette strip), edit percent,
 * add (up to MAX_CATEGORIES), delete (down to MIN_CATEGORIES), a live Total
 * with balance state, an "even out" auto-balance action, and — when a
 * `safeToSpend` is supplied — a live preview of the resulting amounts.
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Plus, Scale, Trash2 } from 'lucide-react-native';
import type { CategoryDef } from '@budgetplanner/core';
import {
  CATEGORY_PALETTE,
  MAX_CATEGORIES,
  MIN_CATEGORIES,
  newCategoryId,
  nextPaletteColor,
  normalizeCategoryPercents,
  totalPercent,
} from '@budgetplanner/core';

import { useIsDark, useTokens } from '../theme/ThemeProvider';
import { categoryTint } from '../theme/categoryColor';
import { Input } from './ui/Input';
import { AmountDisplay } from './AmountDisplay';

interface CategoryEditorProps {
  categories: CategoryDef[];
  onChange: (next: CategoryDef[]) => void;
  symbol: string;
  /** When provided (> 0), shows a live preview of amounts per category. */
  safeToSpend?: number;
}

export function CategoryEditor({ categories, onChange, symbol, safeToSpend = 0 }: CategoryEditorProps) {
  const t = useTokens();
  const isDark = useIsDark();
  const [colorPickerFor, setColorPickerFor] = useState<string | null>(null);

  const total = totalPercent(categories);
  const balanced = total === 100;

  const setName = (id: string, name: string) =>
    onChange(categories.map((c) => (c.id === id ? { ...c, name } : c)));

  const setPercent = (id: string, raw: string) => {
    const next = Math.max(0, Math.min(100, Math.floor(Number(raw) || 0)));
    onChange(categories.map((c) => (c.id === id ? { ...c, percent: next } : c)));
  };

  const setColor = (id: string, color: string) => {
    onChange(categories.map((c) => (c.id === id ? { ...c, color } : c)));
    setColorPickerFor(null);
  };

  const add = () => {
    if (categories.length >= MAX_CATEGORIES) return;
    onChange([
      ...categories,
      { id: newCategoryId(), name: '', color: nextPaletteColor(categories), percent: 0 },
    ]);
  };

  const remove = (id: string) => {
    if (categories.length <= MIN_CATEGORIES) return;
    onChange(normalizeCategoryPercents(categories.filter((c) => c.id !== id)));
  };

  const evenOut = () => onChange(normalizeCategoryPercents(categories));

  return (
    <View>
      {/* Editable rows */}
      <View
        style={{
          backgroundColor: t.color.bg.elevated,
          borderRadius: t.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.color.border.card,
          overflow: 'hidden',
        }}
      >
        {categories.map((c, idx) => (
          <View key={c.id}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: t.space[3],
                paddingHorizontal: t.space[4],
                paddingVertical: t.space[3],
                borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth,
                borderTopColor: t.color.border.hairline,
              }}
            >
              {/* Colour swatch → toggles palette strip */}
              <Pressable
                onPress={() => setColorPickerFor(colorPickerFor === c.id ? null : c.id)}
                accessibilityRole="button"
                accessibilityLabel={`Change colour for ${c.name || 'category'}`}
                hitSlop={8}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: c.color,
                  borderWidth: 2,
                  borderColor: colorPickerFor === c.id ? t.color.text.primary : 'transparent',
                }}
              />
              <View style={{ flex: 1 }}>
                <Input
                  value={c.name}
                  onChangeText={(v) => setName(c.id, v)}
                  placeholder="Category name"
                  accessibilityLabel="Category name"
                />
              </View>
              <View style={{ width: 78 }}>
                <Input
                  value={String(c.percent)}
                  onChangeText={(v) => setPercent(c.id, v)}
                  placeholder="0"
                  keyboardType="numeric"
                  trailing={<Text style={[t.type.body, { color: t.color.text.secondary }]}>%</Text>}
                  accessibilityLabel={`${c.name || 'Category'} percentage`}
                />
              </View>
              <Pressable
                onPress={() => remove(c.id)}
                disabled={categories.length <= MIN_CATEGORIES}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${c.name || 'category'}`}
                hitSlop={8}
                style={({ pressed }) => ({
                  opacity: categories.length <= MIN_CATEGORIES ? 0.25 : pressed ? 0.5 : 1,
                  padding: t.space[1],
                })}
              >
                <Trash2 size={18} color={t.color.text.tertiary} strokeWidth={1.75} />
              </Pressable>
            </View>

            {/* Palette strip for this row */}
            {colorPickerFor === c.id ? (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: t.space[3],
                  paddingHorizontal: t.space[4],
                  paddingBottom: t.space[3],
                }}
              >
                {CATEGORY_PALETTE.map((hex) => (
                  <Pressable
                    key={hex}
                    onPress={() => setColor(c.id, hex)}
                    accessibilityRole="button"
                    accessibilityLabel={`Use colour ${hex}`}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: hex,
                      borderWidth: 3,
                      borderColor: c.color === hex ? t.color.text.primary : 'transparent',
                    }}
                  />
                ))}
              </View>
            ) : null}
          </View>
        ))}
      </View>

      {/* Add + even-out + total */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: t.space[3],
          paddingHorizontal: t.space[1],
        }}
      >
        <View style={{ flexDirection: 'row', gap: t.space[4] }}>
          <Pressable
            onPress={add}
            disabled={categories.length >= MAX_CATEGORIES}
            accessibilityRole="button"
            accessibilityLabel="Add category"
            hitSlop={8}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              opacity: categories.length >= MAX_CATEGORIES ? 0.3 : pressed ? 0.5 : 1,
            })}
          >
            <Plus size={16} color={t.color.brand.base} strokeWidth={2} />
            <Text
              style={[
                t.type.footnote,
                { color: t.color.brand.base, fontWeight: t.fontWeight.medium, marginLeft: 4 },
              ]}
            >
              Add
            </Text>
          </Pressable>
          <Pressable
            onPress={evenOut}
            accessibilityRole="button"
            accessibilityLabel="Even out to 100 percent"
            hitSlop={8}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Scale size={15} color={t.color.text.secondary} strokeWidth={1.75} />
            <Text
              style={[
                t.type.footnote,
                { color: t.color.text.secondary, fontWeight: t.fontWeight.medium, marginLeft: 4 },
              ]}
            >
              Balance
            </Text>
          </Pressable>
        </View>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.headline,
            {
              color: balanced ? t.color.text.primary : t.color.status.overBudget,
              fontVariant: ['tabular-nums'],
            },
          ]}
        >
          {total}%
        </Text>
      </View>

      {/* Live preview */}
      {safeToSpend > 0 ? (
        <View style={{ paddingTop: t.space[6] }}>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.caption2,
              { color: t.color.text.secondary, textTransform: 'uppercase', marginBottom: t.space[3] },
            ]}
          >
            Preview against your safe-to-spend
          </Text>
          {categories.map((c) => {
            const amount = Math.round(safeToSpend * ((c.percent || 0) / 100));
            return (
              <View
                key={c.id}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: t.space[1] }}
              >
                <Text
                  numberOfLines={1}
                  style={[t.type.footnote, { color: t.color.text.secondary, width: 90 }]}
                >
                  {c.name || 'Untitled'}
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: categoryTint(c.color, isDark),
                    marginHorizontal: t.space[3],
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${Math.min(100, c.percent || 0)}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </View>
                <View style={{ minWidth: 80, alignItems: 'flex-end' }}>
                  <AmountDisplay value={amount} symbol={symbol} size="md" align="right" />
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
