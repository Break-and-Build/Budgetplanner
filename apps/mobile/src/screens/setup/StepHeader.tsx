/**
 * StepHeader — the consistent caption + question pair at the top of every
 * SetupRitual step.
 *
 *   "Step 2 of 5 · Priorities"  ← caption (uppercase, tracked)
 *   "What bills do you have to pay?"  ← question (display type)
 *
 * Lives inside each step's scrollable content area so it scrolls naturally
 * with the form below.
 */

import React from 'react';
import { Text, View } from 'react-native';
import { useTokens } from '../../theme/ThemeProvider';

interface StepHeaderProps {
  step?: number;
  totalSteps?: number;
  stepName: string;
  question: string;
  mode?: 'create' | 'edit';
}

export function StepHeader({ step, totalSteps, stepName, question, mode = 'create' }: StepHeaderProps) {
  const t = useTokens();
  const caption =
    mode === 'edit'
      ? `Editing · ${stepName}`
      : `Step ${step} of ${totalSteps} · ${stepName}`;
  return (
    <View
      style={{
        paddingHorizontal: t.space[4],
        paddingTop: t.space[2],
        paddingBottom: t.space[6],
      }}
    >
      <Text
        allowFontScaling
        maxFontSizeMultiplier={t.a11y.maxFontScale}
        style={[
          t.type.caption2,
          {
            color: t.color.text.secondary,
            textTransform: 'uppercase',
            marginBottom: t.space[2],
          },
        ]}
      >
        {caption}
      </Text>
      <Text
        allowFontScaling
        maxFontSizeMultiplier={t.a11y.maxFontScale}
        accessibilityRole="header"
        style={[t.type.title1, { color: t.color.text.primary }]}
      >
        {question}
      </Text>
    </View>
  );
}
