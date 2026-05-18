import React from 'react';
import { Text, View, type StyleProp, type TextStyle } from 'react-native';
import { useTokens } from '../theme/ThemeProvider';

type Size = 'md' | 'lg' | 'hero';

interface AmountDisplayProps {
  /** Numeric value. Will be formatted with thousand separators. */
  value: number;
  /** Currency symbol to render as a prefix. Optional. */
  symbol?: string;
  /** Style preset matching the design tokens' type ramp. */
  size?: Size;
  /** Override color (e.g., for over-budget caption). Defaults to text.numeric. */
  color?: string;
  /** Optional alignment override. */
  align?: 'left' | 'right' | 'center';
  /** Accessibility label override — defaults to natural-language readout. */
  accessibilityLabel?: string;
  style?: StyleProp<TextStyle>;
}

/**
 * Display a monetary value with tabular numerals and a consistent symbol
 * treatment. Use this anywhere a number is shown — never raw `<Text>` with
 * a `.toLocaleString()` call.
 *
 * The three sizes map to the type tokens:
 *   • md   → `type.amount` (lists, recent activity)
 *   • lg   → `type.title2` (category header trio: allocated / spent / remaining)
 *   • hero → `type.hero`   (Home safe-to-spend, FastLog amount preview)
 */
export function AmountDisplay({
  value,
  symbol,
  size = 'md',
  color,
  align = 'left',
  accessibilityLabel,
  style,
}: AmountDisplayProps) {
  const t = useTokens();
  const typeStyle =
    size === 'hero' ? t.type.hero : size === 'lg' ? t.type.title2 : t.type.amount;

  // Format: thousand separators on the integer, preserve decimals up to 2dp.
  const formatted = formatAmount(value);

  // Accessibility — natural-language readout: "Eighty-five Naira" etc.
  const a11y =
    accessibilityLabel ??
    (symbol ? `${symbol}${formatted}` : formatted);

  // Symbol is rendered slightly smaller than the digits at hero size — the
  // currency mark should never compete with the number.
  const symbolStyle =
    size === 'hero'
      ? { ...t.type.title2, fontWeight: t.fontWeight.medium }
      : size === 'lg'
        ? { ...t.type.headline }
        : { ...t.type.amount };

  return (
    <View
      accessible
      accessibilityLabel={a11y}
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      {symbol ? (
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            symbolStyle,
            {
              color: color ?? t.color.text.numeric,
              marginRight: size === 'hero' ? t.space[2] : t.space['0.5'],
            },
          ]}
        >
          {symbol}
        </Text>
      ) : null}
      <Text
        allowFontScaling
        maxFontSizeMultiplier={t.a11y.maxFontScale}
        style={[
          typeStyle,
          { color: color ?? t.color.text.numeric, textAlign: align },
          style,
        ]}
      >
        {formatted}
      </Text>
    </View>
  );
}

function formatAmount(value: number): string {
  if (!isFinite(value)) return '—';
  const neg = value < 0;
  const abs = Math.abs(value);
  const [intPart, decPart] = abs.toString().split('.');
  const grouped = Number(intPart).toLocaleString('en-US');
  const out = decPart ? `${grouped}.${decPart.slice(0, 2)}` : grouped;
  return neg ? `-${out}` : out;
}
