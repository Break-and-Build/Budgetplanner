import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import type { CategoryId } from '@budgetplanner/core';
import { useTokens } from '../theme/ThemeProvider';

interface CategoryDotProps {
  category: CategoryId;
  /** Diameter in points. Default 8 per design tokens. */
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * The small colored dot used everywhere a category needs a visual marker.
 * Always paired with the category name in copy — never the sole indicator
 * of category (per brief's accessibility rules).
 */
export function CategoryDot({ category, size = 8, style }: CategoryDotProps) {
  const t = useTokens();
  return (
    <View
      // Decorative — the label next to it carries the meaning for screen readers.
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: t.color.category[category].base,
        },
        style,
      ]}
    />
  );
}
