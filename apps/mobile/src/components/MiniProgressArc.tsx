/**
 * MiniProgressArc — the only chart in the app.
 *
 * Renders two things at once:
 *   1. A circular arc whose fill ratio = spent / allocated.
 *   2. A small radial tick mark at the angle representing today's position
 *      in the month. If the arc fill is *past* the tick, the user is
 *      spending faster than the month is passing.
 *
 * Calibrated for restraint per the brief — single thin stroke, single fill
 * color (category accent), monochrome tick. No labels inside the circle;
 * those live around it in the parent layout.
 */

import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line } from 'react-native-svg';
import { useTokens } from '../theme/ThemeProvider';

interface MiniProgressArcProps {
  /** 0..1 — what fraction of the allocation has been spent. Values > 1 clamp visually. */
  spentRatio: number;
  /** 0..1 — what fraction of the month has elapsed (today / days_in_month). */
  monthRatio: number;
  /** Category fill color (e.g., tokens.color.category.essentials.base). */
  color: string;
  /** Track (background) color. Usually the category tint. */
  trackColor: string;
  /** Whether the category is over budget. Switches the arc to status red. */
  overBudget?: boolean;
  /** Diameter in points. Default 200. */
  size?: number;
  /** Stroke width in points. Default 10. */
  strokeWidth?: number;
}

export function MiniProgressArc({
  spentRatio,
  monthRatio,
  color,
  trackColor,
  overBudget = false,
  size = 200,
  strokeWidth = 10,
}: MiniProgressArcProps) {
  const t = useTokens();

  // Clamp ratios — the arc never shows >100% even if the user is over.
  const fillRatio = Math.max(0, Math.min(1, spentRatio));
  const tickRatio = Math.max(0, Math.min(1, monthRatio));

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Today tick — convert ratio to angle (0 at top, clockwise).
  // Subtract 90° because SVG's 0° points right; we want 12 o'clock as start.
  const angleRad = (tickRatio * 360 - 90) * (Math.PI / 180);
  const tickInner = radius - strokeWidth / 2 - 2;
  const tickOuter = radius + strokeWidth / 2 + 5;
  const tickX1 = center + tickInner * Math.cos(angleRad);
  const tickY1 = center + tickInner * Math.sin(angleRad);
  const tickX2 = center + tickOuter * Math.cos(angleRad);
  const tickY2 = center + tickOuter * Math.sin(angleRad);

  return (
    <View
      accessible
      accessibilityLabel={
        `${Math.round(fillRatio * 100)} percent spent, ` +
        `${Math.round(tickRatio * 100)} percent of the month elapsed.`
      }
      accessibilityRole="image"
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size}>
        {/* Track — full circle, hairline */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Filled arc — starts at top, rotates clockwise.
            Rotated -90° around center so the dash pattern starts at the top. */}
        <G rotation={-90} originX={center} originY={center}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={overBudget ? t.color.status.overBudget : color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference * fillRatio} ${circumference}`}
          />
        </G>

        {/* Today tick — radial line across the stroke band */}
        <Line
          x1={tickX1}
          y1={tickY1}
          x2={tickX2}
          y2={tickY2}
          stroke={t.color.text.primary}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}
