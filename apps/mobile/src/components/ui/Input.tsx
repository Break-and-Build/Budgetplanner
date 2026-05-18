import React from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTokens } from '../../theme/ThemeProvider';

type Size = 'md' | 'lg';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps['keyboardType'];
  multiline?: boolean;
  numberOfLines?: number;
  size?: Size;
  autoFocus?: boolean;
  accessibilityLabel?: string;
  containerStyle?: StyleProp<ViewStyle>;
  /** Optional left/right slots for currency symbols, units, etc. */
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

/**
 * The base text input. Sunken background + hairline border + 1.5px focus ring.
 * The visual treatment matches the Apple-Wallet vibe — inputs sit *in* the
 * surface, not on top of it.
 */
export function Input({
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  size = 'md',
  autoFocus,
  accessibilityLabel,
  containerStyle,
  leading,
  trailing,
}: InputProps) {
  const t = useTokens();
  const [focused, setFocused] = React.useState(false);

  const minHeight = size === 'lg' ? 56 : 48;
  const textStyle = size === 'lg' ? t.type.title3 : t.type.body;

  return (
    <View
      style={[
        {
          minHeight,
          backgroundColor: t.color.bg.sunken,
          borderRadius: t.radii.md,
          paddingHorizontal: t.space[4],
          paddingVertical: multiline ? t.space[3] : 0,
          borderWidth: focused ? 1.5 : StyleSheet.hairlineWidth,
          borderColor: focused ? t.color.border.focus : t.color.border.hairline,
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
        },
        containerStyle,
      ]}
    >
      {leading ? <View style={{ marginRight: t.space[2] }}>{leading}</View> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.color.text.tertiary}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoFocus={autoFocus}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        allowFontScaling
        maxFontSizeMultiplier={t.a11y.maxFontScale}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          textStyle,
          {
            color: t.color.text.primary,
            flex: 1,
            // Disable default RN padding inconsistency between platforms
            paddingVertical: 0,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
      />
      {trailing ? <View style={{ marginLeft: t.space[2] }}>{trailing}</View> : null}
    </View>
  );
}
