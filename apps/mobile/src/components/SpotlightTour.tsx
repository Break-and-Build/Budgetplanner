/**
 * SpotlightTour — a first-run coach-mark overlay.
 *
 * Dims the screen, cuts a rounded "hole" around one target rect at a time
 * (built from four dim rectangles so it works without SVG masking), and shows
 * a caption card with an arrow pointing at the highlight. Tap anywhere — or
 * the button — to advance; Skip ends it early.
 *
 * Purely presentational: the caller measures the target elements and passes
 * their window rects in `steps`, and handles the "seen" flag in `onFinish`.
 */

import React, { useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useTokens } from '../theme/ThemeProvider';

export interface SpotlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpotlightStep {
  rect: SpotlightRect;
  title: string;
  body: string;
}

interface SpotlightTourProps {
  steps: SpotlightStep[];
  onFinish: () => void;
}

const DIM = 'rgba(12,12,18,0.76)';
const PAD = 8; // breathing room around the highlighted element
const RADIUS = 16;

export function SpotlightTour({ steps, onFinish }: SpotlightTourProps) {
  const t = useTokens();
  const { width, height } = useWindowDimensions();
  const [i, setI] = useState(0);

  if (steps.length === 0) return null;
  const step = steps[Math.min(i, steps.length - 1)];
  const last = i >= steps.length - 1;

  // The clear "hole" rect, padded and clamped to the screen.
  const hole = {
    x: Math.max(0, step.rect.x - PAD),
    y: Math.max(0, step.rect.y - PAD),
    width: Math.min(width, step.rect.width + PAD * 2),
    height: step.rect.height + PAD * 2,
  };
  const holeRight = hole.x + hole.width;
  const holeBottom = hole.y + hole.height;

  // Place the caption below the hole if it sits in the top ~60% of the screen,
  // otherwise above it.
  const below = holeBottom < height * 0.6;
  const captionTop = below ? holeBottom + 16 : undefined;
  const captionBottom = below ? undefined : height - hole.y + 16;

  const advance = () => (last ? onFinish() : setI(i + 1));

  const dim = { position: 'absolute' as const, backgroundColor: DIM };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
      {/* Four dim panels around the hole (tap any to advance) */}
      <Pressable style={[dim, { top: 0, left: 0, right: 0, height: hole.y }]} onPress={advance} />
      <Pressable
        style={[dim, { top: holeBottom, left: 0, right: 0, bottom: 0 }]}
        onPress={advance}
      />
      <Pressable
        style={[dim, { top: hole.y, left: 0, width: hole.x, height: hole.height }]}
        onPress={advance}
      />
      <Pressable
        style={[dim, { top: hole.y, left: holeRight, right: 0, height: hole.height }]}
        onPress={advance}
      />

      {/* Ring around the highlighted element */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: hole.x,
          top: hole.y,
          width: hole.width,
          height: hole.height,
          borderRadius: RADIUS,
          borderWidth: 2,
          borderColor: t.color.brand.base,
        }}
      />

      {/* Caption card */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: t.space[4],
          right: t.space[4],
          top: captionTop,
          bottom: captionBottom,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            backgroundColor: t.color.bg.elevated,
            borderRadius: t.radii.lg,
            padding: t.space[5],
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}
        >
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[t.type.title3, { color: t.color.text.primary, marginBottom: t.space[1] }]}
          >
            {step.title}
          </Text>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[t.type.subhead, { color: t.color.text.secondary }]}
          >
            {step.body}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: t.space[5],
            }}
          >
            {/* Progress dots */}
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {steps.map((_, idx) => (
                <View
                  key={idx}
                  style={{
                    width: idx === i ? 18 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: idx === i ? t.color.brand.base : t.color.border.divider,
                  }}
                />
              ))}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[4] }}>
              {!last ? (
                <Pressable onPress={onFinish} accessibilityRole="button" accessibilityLabel="Skip tour" hitSlop={8}>
                  <Text style={[t.type.subhead, { color: t.color.text.secondary }]}>Skip</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={advance}
                accessibilityRole="button"
                accessibilityLabel={last ? 'Finish' : 'Next'}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? t.color.brand.pressed : t.color.brand.base,
                  paddingHorizontal: t.space[5],
                  paddingVertical: t.space[2],
                  borderRadius: t.radii.pill,
                })}
              >
                <Text
                  style={[
                    t.type.subhead,
                    { color: '#FFFFFF', fontWeight: t.fontWeight.semibold },
                  ]}
                >
                  {last ? 'Got it' : 'Next'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
