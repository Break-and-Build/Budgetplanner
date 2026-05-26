import React from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTokens } from '../../theme/ThemeProvider';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Accessibility label override. Defaults to children text if a string. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The primary action primitive.
 *
 *   • primary     — filled indigo (the brand color). Press → darker indigo.
 *   • secondary   — outlined card with neutral ink text. Cancel-style action.
 *   • ghost       — transparent. Tertiary affordance, low emphasis.
 *   • destructive — filled muted red, white text. Confirmation sheets.
 *
 * `lg` size is reserved for screens whose primary action is the screen's
 * focal point (FastLog "Log", Setup "Continue"). `md` is the default.
 */
export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const t = useTokens();

  // Size table — height ≥ 44 for primary/lg per a11y; sm sits below for
  // dense rows but should be reserved for icon-paired buttons.
  const sizing = {
    sm: { minHeight: 36, paddingX: t.space[3], textStyle: t.type.subhead },
    md: { minHeight: 48, paddingX: t.space[5], textStyle: t.type.headline },
    lg: { minHeight: 56, paddingX: t.space[6], textStyle: t.type.title3 },
  }[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? (typeof children === 'string' ? children : undefined)
      }
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: sizing.minHeight,
          paddingHorizontal: sizing.paddingX,
          borderRadius: t.radii.md,
          opacity: disabled ? 0.4 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        variant === 'primary' && {
          // Filled brand (indigo). Filled-pressed = darker indigo.
          backgroundColor: pressed ? t.color.brand.pressed : t.color.brand.base,
        },
        variant === 'secondary' && {
          backgroundColor: pressed ? t.color.bg.sunken : t.color.bg.elevated,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.color.border.divider,
        },
        variant === 'ghost' && {
          backgroundColor: pressed ? t.color.bg.sunken : 'transparent',
        },
        variant === 'destructive' && {
          // Filled red on rest, darker red on press — same pattern as primary
          // (ink on rest, darker ink on press). No border on a filled variant.
          backgroundColor: pressed
            ? t.color.status.overBudgetPressed
            : t.color.status.overBudget,
        },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            sizing.textStyle,
            variant === 'primary' && { color: t.color.text.inverse },
            variant === 'secondary' && { color: t.color.text.primary },
            variant === 'ghost' && { color: t.color.text.primary },
            variant === 'destructive' && {
              color: t.color.text.inverse,
              fontWeight: t.fontWeight.semibold,
            },
          ]}
        >
          {children}
        </Text>
      ) : (
        <View>{children}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
