import React from 'react';
import { View, useWindowDimensions, type ViewStyle, type StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../theme/ThemeProvider';

interface TabShellProps {
  children: React.ReactNode;
  /** Render the floating "+" FAB anchored bottom-right (above tab bar). */
  fab?: React.ReactNode;
  /** Skip the default screen edge padding for fully-bleed screens. */
  bleed?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Wraps a tab screen's content. Responsibilities:
 *   • Safe-area top inset (the bottom inset is handled by the tab bar)
 *   • Default horizontal screen padding (`tokens.layout.screenPaddingX`)
 *   • Centered max-width column on wide breakpoints (≥600)
 *   • FAB anchor — positioned above the tab bar, aligned to content column
 *
 * No header rendered here; screens own their `ScreenHeader` so a sticky
 * header could be added later without ripping the shell.
 */
export function TabShell({ children, fab, bleed = false, style }: TabShellProps) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= t.layout.breakpoint.wide;
  const maxWidth = wide ? t.layout.maxContentWidth : '100%';

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: t.color.bg.base,
          paddingTop: insets.top,
        },
        style,
      ]}
    >
      <View
        style={{
          flex: 1,
          alignSelf: 'center',
          width: '100%',
          maxWidth,
          paddingHorizontal: bleed ? 0 : 0, // children own internal padding via ScreenHeader
        }}
      >
        {children}
      </View>

      {fab ? (
        <View
          // The tab screen content area already ends at the top of the tab
          // bar — we DON'T add tabBarHeight or insets.bottom here, that would
          // double-count and push the FAB way up the screen. Just sit a
          // small offset above the bottom edge of this view.
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: t.layout.fabOffset,
            alignItems: 'center',
          }}
        >
          <View
            pointerEvents="box-none"
            style={{
              width: '100%',
              maxWidth,
              alignItems: 'flex-end',
              paddingRight: t.layout.fabOffset,
            }}
          >
            {fab}
          </View>
        </View>
      ) : null}
    </View>
  );
}
