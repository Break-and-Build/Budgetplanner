/**
 * SetupRitual final step — "You're set."
 *
 * Auto-advances to MainTabs/Home after a brief pause, or immediately on tap.
 * The pause is intentional — it's the "exhale" moment after a 3-minute setup
 * ritual. Honors Reduce Motion (advances instantly when reduced).
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { useTokens } from '../../theme/ThemeProvider';
import { useReducedMotion } from '../../theme/useReducedMotion';

interface ConfirmationStepProps {
  onFinish: () => void;
}

export function ConfirmationStep({ onFinish }: ConfirmationStepProps) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { reduced, multiplier } = useReducedMotion();

  // Soft fade-in for the check + title.
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: t.motion.duration.slow * multiplier,
      easing: Easing.bezier(...t.motion.easing.decelerate),
      useNativeDriver: true,
    }).start();

    // Auto-advance after 2 seconds (or immediately if Reduce Motion).
    const ms = reduced ? 0 : 2000;
    const id = setTimeout(onFinish, ms);
    return () => clearTimeout(id);
  }, [opacity, t.motion, multiplier, reduced, onFinish]);

  return (
    <Pressable
      onPress={onFinish}
      accessibilityRole="button"
      accessibilityLabel="You're set. Tap to continue."
      style={{
        flex: 1,
        backgroundColor: t.color.bg.base,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: t.space[6],
      }}
    >
      <Animated.View style={{ opacity, alignItems: 'center' }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: t.color.text.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: t.space[6],
          }}
        >
          <Check size={40} color={t.color.text.inverse} strokeWidth={2.25} />
        </View>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          accessibilityRole="header"
          style={[
            t.type.display,
            { color: t.color.text.primary, textAlign: 'center' },
          ]}
        >
          You're set.
        </Text>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.callout,
            {
              color: t.color.text.secondary,
              textAlign: 'center',
              marginTop: t.space[3],
              maxWidth: 320,
            },
          ]}
        >
          Tap the + to log a spend. Come back any time — your plan is here.
        </Text>
      </Animated.View>
    </Pressable>
  );
}
