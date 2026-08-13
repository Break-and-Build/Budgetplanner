import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  evaluateExpression,
  formatNumber,
  looksLikeExpression,
  parseNumber,
} from '@budgetplanner/core';
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
 * Tolerates two things the phone keyboard makes awkward:
 *   • decimals — `104.50` is preserved as typed (previously the value round-
 *     tripped through `parseFloat` on every keystroke, so a trailing `.` or
 *     `.50` was lost the moment the user typed it)
 *   • expressions — `1000+800` on blur evaluates to `1800`
 *
 * To make both work we hold a local `draft` string while focused, and only
 * commit a plain-number draft to `onChange` live. Expression drafts commit on
 * blur; if the expression is invalid we snap back to the last valid value.
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
  const [draft, setDraft] = React.useState<string>('');

  const cfg = {
    md: { minHeight: 48, textStyle: t.type.amount, borderless: false, align: 'left' as const },
    lg: { minHeight: 64, textStyle: t.type.title2, borderless: false, align: 'left' as const },
    hero: { minHeight: 88, textStyle: t.type.hero, borderless: true, align: 'center' as const },
  }[size];

  const symbolStyle = {
    md: t.type.amount,
    lg: t.type.headline,
    hero: { ...t.type.title1, fontWeight: t.fontWeight.medium },
  }[size];

  // iOS `decimal-pad` / `numeric` have no operator keys, so users can't type
  // `+` for expressions. `numbers-and-punctuation` gives them digits, `.`, `+`,
  // `-`, `*`, `/`. Android's default `numeric` pad already covers these.
  const keyboardType = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric';

  // What we show in the input:
  //  - unfocused: the canonical formatted number (`1,500.5`)
  //  - focused:   the raw draft the user is typing, unformatted
  const displayed = focused ? draft : formatNumber(value);

  const onFocus = () => {
    // Seed the draft with the current value in a shape that's easy to edit.
    setDraft(value ? String(value) : '');
    setFocused(true);
  };

  const onBlur = () => {
    setFocused(false);
    commit(draft);
  };

  const onChangeText = (text: string) => {
    setDraft(text);
    // Live-update only when it's a plain number — otherwise wait for blur, so
    // typing an operator mid-expression doesn't clobber the value.
    if (!looksLikeExpression(text)) {
      onChange(parseNumber(text));
    }
  };

  const commit = (text: string) => {
    if (!text.trim()) {
      onChange(0);
      return;
    }
    if (looksLikeExpression(text)) {
      const result = evaluateExpression(text);
      if (result != null) {
        onChange(result);
      }
      // Invalid expression → keep the previous value (don't wipe user's data).
      return;
    }
    onChange(parseNumber(text));
  };

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
          borderColor: focused ? t.color.border.focus : t.color.border.card,
        },
        containerStyle,
      ]}
    >
      {symbol ? (
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            symbolStyle,
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
        value={displayed}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.color.text.tertiary}
        keyboardType={keyboardType}
        autoFocus={autoFocus}
        accessibilityLabel={accessibilityLabel ?? 'Amount'}
        accessibilityHint="You can type an expression like 1000+800"
        allowFontScaling
        maxFontSizeMultiplier={t.a11y.maxFontScale}
        onFocus={onFocus}
        onBlur={onBlur}
        selectTextOnFocus
        style={[
          cfg.textStyle,
          {
            color: t.color.text.numeric,
            flex: cfg.align === 'center' ? 0 : 1,
            paddingVertical: 0,
            textAlign: cfg.align,
            minWidth: size === 'hero' ? 48 : undefined,
          },
        ]}
      />
    </View>
  );
}
