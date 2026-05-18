import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTokens } from '../theme/ThemeProvider';

interface ScreenHeaderProps {
  title: string;
  /** Optional subtitle below the title — small, secondary color. */
  subtitle?: string;
  /** Slot for a left button (typically back / close). */
  left?: React.ReactNode;
  /** Slot for a right button (typically gear / done / search). */
  right?: React.ReactNode;
  /** Small caption above the title — used for "Step 2 of 6" on setup screens. */
  eyebrow?: string;
}

/**
 * The large-title screen header used at the top of every scrollable screen.
 * Title sits on the page (not in a nav bar). Left/right slots overlay above
 * the title at touch-target size — Apple-Wallet pattern.
 */
export function ScreenHeader({ title, subtitle, left, right, eyebrow }: ScreenHeaderProps) {
  const t = useTokens();
  return (
    <View
      style={{
        paddingHorizontal: t.space[4],
        paddingTop: t.space[2],
        paddingBottom: t.space[4],
      }}
    >
      {(left || right) && (
        <View
          style={{
            height: t.layout.minTapTarget,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: t.space[2],
          }}
        >
          <View>{left}</View>
          <View>{right}</View>
        </View>
      )}

      {eyebrow ? (
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.caption2,
            {
              color: t.color.text.secondary,
              textTransform: 'uppercase',
              marginBottom: t.space[1],
            },
          ]}
        >
          {eyebrow}
        </Text>
      ) : null}

      <Text
        allowFontScaling
        maxFontSizeMultiplier={t.a11y.maxFontScale}
        accessibilityRole="header"
        style={[t.type.title1, { color: t.color.text.primary }]}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.callout,
            { color: t.color.text.secondary, marginTop: t.space[1] },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

interface HeaderIconButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
}

/** Tap-target sized icon button for ScreenHeader left/right slots. */
export function HeaderIconButton({ onPress, accessibilityLabel, children }: HeaderIconButtonProps) {
  const t = useTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => ({
        width: t.layout.minTapTarget,
        height: t.layout.minTapTarget,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: t.radii.pill,
        backgroundColor: pressed ? t.color.bg.sunken : 'transparent',
      })}
    >
      {children}
    </Pressable>
  );
}
