import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { formatNumber, parseNumber } from '@budgetplanner/core';
import { useTokens } from '../theme/ThemeProvider';

type Size = 'md' | 'lg' | 'hero';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  /** Currency symbol (e.g., '$', '₦'). Rendered as a fixed prefix. */
  symbol?: string;
  /**
   * - 'md'   → list / form context (height 48, body type)
   * - 'lg'   → setup-ritual primary field (height 64, title2 type)
   * - 'hero' → fast-log amount field (no border, 56pt hero type)
   */
  size?: Size;
  autoFocus?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Currency-aware numeric input.
 *
 * Three visual modes:
 *  - md/lg sit in a bordered sunken well like other Inputs.
 *  - hero is borderless, centered, used only on FastLogSheet.
 *
 * Always uses the number-pad keyboard and tabular-nums type variant.
 */
export function CurrencyInput({
  value,
  onChange,
  placeholder = '0',
  symbol,
  size = 'md',
  autoFocus,
  containerStyle,
  accessibilityLabel,
}: CurrencyInputProps) {
  const t = useTokens();
  const [focused, setFocused] = React.useState(false);

  const cfg = {
    md: { minHeight: 48, textStyle: t.type.amount, borderless: false, align: 'left' as const },
    lg: { minHeight: 64, textStyle: t.type.title2, borderless: false, align: 'left' as const },
    hero: { minHeight: 88, textStyle: t.type.hero, borderless: true, align: 'center' as const },
  }[size];

  return (
    <View
      style={[
        {
          minHeight: cfg.minHeight,
          paddingHorizontal: cfg.borderless ? 0 : t.space[4],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: cfg.align === 'center' ? 'center' : 'flex-start',
          backgroundColor: cfg.borderless ? 'transparent' : t.color.bg.sunken,
          borderRadius: cfg.borderless ? 0 : t.radii.md,
          borderWidth: cfg.borderless ? 0 : focused ? 1.5 : StyleSheet.hairlineWidth,
          borderColor: focused ? t.color.border.focus : t.color.border.hairline,
        },
        containerStyle,
      ]}
    >
      {symbol ? (
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            cfg.textStyle,
            {
              color: value > 0 ? t.color.text.primary : t.color.text.tertiary,
              marginRight: size === 'hero' ? t.space[2] : t.space[1],
            },
          ]}
        >
          {symbol}
        </Text>
      ) : null}
      <TextInput
        value={formatNumber(value)}
        onChangeText={(text) => onChange(parseNumber(text))}
        placeholder={placeholder}
        placeholderTextColor={t.color.text.tertiary}
        keyboardType="numeric"
        autoFocus={autoFocus}
        accessibilityLabel={accessibilityLabel ?? 'Amount'}
        allowFontScaling
        maxFontSizeMultiplier={t.a11y.maxFontScale}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        selectTextOnFocus
        style={[
          cfg.textStyle,
          {
            color: t.color.text.numeric,
            flex: cfg.align === 'center' ? 0 : 1,
            paddingVertical: 0,
            textAlign: cfg.align,
            minWidth: size === 'hero' ? 120 : undefined,
          },
        ]}
      />
    </View>
  );
}
