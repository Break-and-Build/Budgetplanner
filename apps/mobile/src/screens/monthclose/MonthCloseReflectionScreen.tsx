/**
 * MonthClose step 1 — Reflection.
 *
 * Three short prompts. User fills any of them (at least one) to continue.
 * Per the brief: "Where was it tight? Where did it feel flexible? What was
 * intentional?" — these are deliberately soft. No "did you blow your
 * budget" framing, no preachy tone.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import type { ReflectionData } from '@budgetplanner/core';

import { useTokens } from '../../theme/ThemeProvider';
import { ModalStackShell } from '../../components/ModalStackShell';
import { Input } from '../../components/ui/Input';

interface Props {
  monthLabel: string;
  /** True when overdue close — disables the cancel X. */
  required: boolean;
  reflection: ReflectionData;
  setReflection: React.Dispatch<React.SetStateAction<ReflectionData>>;
  onNext: () => void;
  onCancel: () => void;
}

export function MonthCloseReflectionScreen({
  monthLabel,
  required,
  reflection,
  setReflection,
  onNext,
  onCancel,
}: Props) {
  const t = useTokens();

  const anyFilled =
    !!reflection.tight.trim() ||
    !!reflection.flexible.trim() ||
    !!reflection.intentional.trim();

  return (
    <ModalStackShell
      step={1}
      totalSteps={2}
      primaryAction={{ label: 'Continue', onPress: onNext, disabled: !anyFilled }}
    >
      {/* Top close X — only when the close is not overdue.
          When overdue, the user must complete the flow (no escape hatch). */}
      {!required ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingHorizontal: t.space[4],
            paddingBottom: t.space[2],
          }}
        >
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Close without completing"
            hitSlop={8}
            style={({ pressed }) => ({
              width: t.layout.minTapTarget,
              height: t.layout.minTapTarget,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: t.radii.pill,
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <X size={22} color={t.color.text.secondary} strokeWidth={1.75} />
          </Pressable>
        </View>
      ) : null}

      {/* Hero */}
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
          Close out
        </Text>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          accessibilityRole="header"
          style={[t.type.title1, { color: t.color.text.primary }]}
        >
          How was {monthLabel}?
        </Text>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.callout,
            { color: t.color.text.secondary, marginTop: t.space[1] },
          ]}
        >
          A short reflection — fill any one prompt.
        </Text>
      </View>

      {/* Three prompts */}
      <View style={{ paddingHorizontal: t.space[4], gap: t.space[5] }}>
        <Prompt
          label="Where was it tight?"
          value={reflection.tight}
          onChange={(v) => setReflection((r) => ({ ...r, tight: v }))}
        />
        <Prompt
          label="Where did it feel flexible?"
          value={reflection.flexible}
          onChange={(v) => setReflection((r) => ({ ...r, flexible: v }))}
        />
        <Prompt
          label="What was intentional?"
          value={reflection.intentional}
          onChange={(v) => setReflection((r) => ({ ...r, intentional: v }))}
        />
      </View>
    </ModalStackShell>
  );
}

function Prompt({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useTokens();
  return (
    <View>
      <Text
        allowFontScaling
        maxFontSizeMultiplier={t.a11y.maxFontScale}
        style={[
          t.type.subhead,
          {
            color: t.color.text.primary,
            fontWeight: t.fontWeight.medium,
            marginBottom: t.space[2],
          },
        ]}
      >
        {label}
      </Text>
      <Input
        value={value}
        onChangeText={onChange}
        placeholder="A few words…"
        multiline
        numberOfLines={3}
        accessibilityLabel={label}
      />
    </View>
  );
}
