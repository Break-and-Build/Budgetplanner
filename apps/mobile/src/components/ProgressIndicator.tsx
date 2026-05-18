import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTokens } from '../theme/ThemeProvider';

export type StepStatus = 'completed' | 'current' | 'pending' | 'upcoming';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  statuses?: StepStatus[];
  onStepPress?: (step: number) => void;
}

/**
 * A monochrome dot row. No green/orange/blue states — three visual treatments:
 *
 *  • completed | current → filled ink dot
 *  • upcoming             → outlined hairline dot
 *  • pending              → dashed hairline dot (incomplete data on a past step)
 *
 * The current step is twice the diameter of the others to give it weight
 * without resorting to color. This is the only place we let visual hierarchy
 * use size rather than tint.
 */
export function ProgressIndicator({
  currentStep,
  totalSteps,
  statuses = [],
  onStepPress,
}: ProgressIndicatorProps) {
  const t = useTokens();
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.row}>
      {steps.map((step) => {
        const status: StepStatus = statuses[step - 1] ?? (
          step < currentStep ? 'completed' : step === currentStep ? 'current' : 'upcoming'
        );
        const isCurrent = status === 'current';
        const filled = status === 'completed' || status === 'current';

        const size = isCurrent ? 10 : 6;
        const dot = (
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: filled ? t.color.text.primary : 'transparent',
              borderWidth: filled ? 0 : StyleSheet.hairlineWidth,
              borderColor: t.color.text.tertiary,
              borderStyle: status === 'pending' ? 'dashed' : 'solid',
            }}
          />
        );

        return (
          <Pressable
            key={step}
            onPress={() => onStepPress?.(step)}
            disabled={!onStepPress}
            accessibilityRole="button"
            accessibilityLabel={`Step ${step} of ${totalSteps}, ${status}`}
            // Generous hit area regardless of the small visual.
            hitSlop={t.layout.minTapTarget / 2}
            style={{
              padding: t.space[2],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {dot}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
