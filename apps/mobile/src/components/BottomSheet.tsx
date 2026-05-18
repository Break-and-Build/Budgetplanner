import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../theme/ThemeProvider';
import { useReducedMotion } from '../theme/useReducedMotion';

interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  /**
   * Optional title rendered at the top of the sheet next to a grab handle.
   * For most uses the sheet's content provides its own header.
   */
  title?: string;
  /** Disable swipe-down-to-dismiss. Defaults to enabled. */
  swipeToDismiss?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Hand-rolled bottom sheet. Single snap point sized to content.
 *
 * Why hand-rolled and not @gorhom/bottom-sheet: v1 budget. The interactions
 * we need (rise · backdrop fade · swipe-down · keyboard avoidance) are well
 * within `Modal + Animated + PanResponder`, and skipping the dep keeps the
 * mobile bundle smaller.
 *
 * Behavior:
 *   • Sheet rises with `decelerate` easing at `base` duration.
 *   • Backdrop fades to `bg.overlay` opacity.
 *   • Swipe-down ≥ 80pt or velocity > 1.0 → dismiss.
 *   • Backdrop tap → dismiss.
 *   • Reduce Motion → instant appear / dismiss, swipe still works.
 */
export function BottomSheet({
  visible,
  onDismiss,
  children,
  title,
  swipeToDismiss = true,
}: BottomSheetProps) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { multiplier } = useReducedMotion();

  // Translation animates from SCREEN_HEIGHT (off-screen) to 0 (resting).
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  // Whether the Modal element is mounted. We delay unmount until the dismiss
  // animation finishes so children can finish their own transitions.
  const [mounted, setMounted] = React.useState(visible);

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
        Animated.timing(backdrop, {
          toValue: 1,
          duration: t.motion.duration.base * multiplier,
          easing: Easing.bezier(...t.motion.easing.decelerate),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: t.motion.duration.base * multiplier,
          easing: Easing.bezier(...t.motion.easing.accelerate),
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 0,
          duration: t.motion.duration.base * multiplier,
          easing: Easing.bezier(...t.motion.easing.accelerate),
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [visible, mounted, multiplier, translateY, backdrop, t.motion]);

  // Swipe-down dismiss
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        swipeToDismiss && g.dy > 4 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 1.0) {
          onDismiss();
        } else {
          Animated.timing(translateY, {
            toValue: 0,
            duration: t.motion.duration.fast * multiplier,
            easing: Easing.bezier(...t.motion.easing.decelerate),
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill}>
        {/* Backdrop */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: t.color.bg.overlay, opacity: backdrop },
          ]}
        >
          <Pressable
            accessibilityLabel="Dismiss"
            style={StyleSheet.absoluteFill}
            onPress={onDismiss}
          />
        </Animated.View>

        {/* Sheet */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.bottomAnchor}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: t.color.bg.elevated,
                borderTopLeftRadius: t.radii.xl,
                borderTopRightRadius: t.radii.xl,
                paddingBottom: insets.bottom + t.space[4],
                ...t.shadow.sheet,
                transform: [{ translateY }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            {/* Grab handle */}
            <View style={{ alignItems: 'center', paddingTop: t.space[2] }}>
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: t.color.text.tertiary,
                  opacity: 0.4,
                }}
              />
            </View>

            {title ? (
              <View
                style={{
                  paddingHorizontal: t.space[5],
                  paddingTop: t.space[3],
                }}
              >
                <View accessibilityRole="header">{title}</View>
              </View>
            ) : null}

            <View style={{ paddingHorizontal: t.space[5], paddingTop: t.space[3] }}>
              {children}
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bottomAnchor: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
  },
});
