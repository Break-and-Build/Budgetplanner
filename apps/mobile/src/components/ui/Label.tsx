import React from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { useTokens } from '../../theme/ThemeProvider';

interface LabelProps {
  children: React.ReactNode;
  /** Visual emphasis. "primary" reads at body size; "subtle" is caption-sized. */
  emphasis?: 'primary' | 'subtle';
  style?: StyleProp<TextStyle>;
}

export function Label({ children, emphasis = 'primary', style }: LabelProps) {
  const t = useTokens();
  const base = emphasis === 'primary' ? t.type.subhead : t.type.caption1;
  const color = emphasis === 'primary' ? t.color.text.primary : t.color.text.secondary;
  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={t.a11y.maxFontScale}
      style={[
        base,
        {
          color,
          fontWeight: t.fontWeight.medium,
          marginBottom: t.space[1],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
