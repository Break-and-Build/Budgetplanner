import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../theme/ThemeProvider';
import { ProgressIndicator, type StepStatus } from './ProgressIndicator';
import { Button } from './ui/Button';

interface ModalStackShellProps {
  children: React.ReactNode;
  /** 1-indexed current step. Pass 0 to hide the indicator (single-screen modal). */
  step?: number;
  totalSteps?: number;
  /** Optional pre-computed statuses; falls back to current+completed. */
  statuses?: StepStatus[];
  /** Sticky bottom action. Pass `null` to omit. */
  primaryAction?: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
  };
  /** Optional secondary action (e.g., "Back") rendered to the left of primary. */
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  /** Tertiary text button (e.g., "I have none") rendered above the action bar. */
  tertiaryAction?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Wraps a full-screen modal step. Three zones, top-to-bottom:
 *
 *   1. Progress dots (when `step` & `totalSteps` are provided)
 *   2. Scrollable content (children — usually a ScreenHeader + form)
 *   3. Sticky action bar — primary button, optional Back and tertiary link
 *
 * Keyboard avoidance is handled here so each step doesn't have to.
 * Content is centered to `maxContentWidth` on wide breakpoints.
 */
export function ModalStackShell({
  children,
  step,
  totalSteps,
  statuses,
  primaryAction,
  secondaryAction,
  tertiaryAction,
}: ModalStackShellProps) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= t.layout.breakpoint.wide;
  const maxWidth = wide ? t.layout.maxContentWidth : '100%';
  const showProgress = !!(step && totalSteps);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: t.color.bg.base }]}
    >
      {/* Top inset + optional progress dots */}
      <View
        style={{
          paddingTop: insets.top + t.space[3],
          paddingBottom: t.space[3],
          alignItems: 'center',
          backgroundColor: t.color.bg.base,
        }}
      >
        {showProgress ? (
          <ProgressIndicator
            currentStep={step!}
            totalSteps={totalSteps!}
            statuses={statuses}
          />
        ) : null}
      </View>

      {/* Scrollable content column */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: t.space[8],
          alignSelf: 'center',
          width: '100%',
          maxWidth,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>

      {/* Sticky action bar */}
      {(primaryAction || tertiaryAction) && (
        <View
          style={{
            paddingHorizontal: t.space[4],
            paddingTop: t.space[3],
            paddingBottom: Math.max(t.space[3], insets.bottom + t.space[3]),
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: t.color.border.hairline,
            backgroundColor: t.color.bg.base,
            alignSelf: 'center',
            width: '100%',
            maxWidth,
          }}
        >
          {tertiaryAction ? (
            <View style={{ alignItems: 'center', marginBottom: t.space[3] }}>
              <Button
                variant="ghost"
                size="sm"
                onPress={tertiaryAction.onPress}
              >
                {tertiaryAction.label}
              </Button>
            </View>
          ) : null}

          {primaryAction ? (
            <View style={{ flexDirection: 'row', gap: t.space[3] }}>
              {secondaryAction ? (
                <View style={{ flex: 1 }}>
                  <Button
                    variant="secondary"
                    onPress={secondaryAction.onPress}
                    fullWidth
                  >
                    {secondaryAction.label}
                  </Button>
                </View>
              ) : null}
              <View style={{ flex: secondaryAction ? 2 : 1 }}>
                <Button
                  variant="primary"
                  onPress={primaryAction.onPress}
                  disabled={primaryAction.disabled}
                  fullWidth
                >
                  {primaryAction.label}
                </Button>
              </View>
            </View>
          ) : null}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
});
