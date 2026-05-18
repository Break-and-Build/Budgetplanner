/**
 * UndoSnackbar — global toast for destructive actions.
 *
 * Rendered once at the App root (next to FastLogSheet). Surfaces a brief
 * message + Undo button after deletes and other destructive operations.
 * Auto-dismisses after 4 seconds; tapping Undo immediately calls the stored
 * revert callback and hides the snackbar.
 *
 * Visual treatment: dark pill (ink-on-paper inverted) for high-contrast
 * notification feel — distinct from cards and inputs, but consistent with
 * the rest of the Apple-Wallet calm palette (no neon, no semantic color).
 *
 * Positioning: sits above the tab bar by tabBarHeight + safe-area-bottom.
 * On pushed screens (where there's no tab bar) it sits a bit higher than
 * strictly needed — a tolerable compromise vs. screen-aware positioning.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTokens } from '../theme/ThemeProvider';
import { useReducedMotion } from '../theme/useReducedMotion';
import { useBudget } from '../state/BudgetContext';

export function UndoSnackbar() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { multiplier } = useReducedMotion();
  const { undoSnackbar, hideUndoSnackbar } = useBudget();

  // Latch the snackbar payload so the exit animation can finish rendering
  // its label before the underlying state clears. Without this, the snackbar
  // would render an empty string during the slide-down.
  const [latched, setLatched] = useState(undoSnackbar);
  useEffect(() => {
    if (undoSnackbar) setLatched(undoSnackbar);
  }, [undoSnackbar]);

  const visible = !!undoSnackbar;
  const [mounted, setMounted] = useState(false);

  const translateY = useRef(new Animated.Value(120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: t.motion.duration.base * multiplier,
          easing: Easing.bezier(...t.motion.easing.decelerate),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: t.motion.duration.base * multiplier,
          easing: Easing.bezier(...t.motion.easing.decelerate),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 120,
          duration: t.motion.duration.fast * multiplier,
          easing: Easing.bezier(...t.motion.easing.accelerate),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: t.motion.duration.fast * multiplier,
          easing: Easing.bezier(...t.motion.easing.accelerate),
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [visible, mounted, multiplier, opacity, translateY, t.motion]);

  if (!mounted) return null;

  const onUndoPress = () => {
    latched?.onUndo();
    hideUndoSnackbar();
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      // The View itself spans full width but pointerEvents='box-none' lets
      // taps fall through to the screen behind; only the pill captures input.
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom + t.layout.tabBarHeight + t.space[3],
        alignItems: 'center',
        zIndex: t.zIndex.toast,
        transform: [{ translateY }],
        opacity,
      }}
      accessibilityLiveRegion="polite"
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: t.space[4],
          paddingRight: t.space[2],
          paddingVertical: t.space[2],
          minHeight: 52,
          maxWidth: t.layout.maxContentWidth,
          marginHorizontal: t.space[4],
          backgroundColor: t.color.text.primary,
          borderRadius: t.radii.pill,
          ...t.shadow.lg,
        }}
      >
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          accessibilityLiveRegion="polite"
          style={[
            t.type.subhead,
            {
              color: t.color.text.inverse,
              flex: 1,
              paddingRight: t.space[2],
            },
          ]}
          numberOfLines={1}
        >
          {latched?.message ?? ''}
        </Text>
        <Pressable
          onPress={onUndoPress}
          accessibilityRole="button"
          accessibilityLabel="Undo"
          hitSlop={8}
          style={({ pressed }) => ({
            paddingHorizontal: t.space[3],
            paddingVertical: t.space[2],
            borderRadius: t.radii.pill,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.subhead,
              {
                color: t.color.text.inverse,
                fontWeight: t.fontWeight.semibold,
              },
            ]}
          >
            Undo
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
