/**
 * Android home-screen widget — the Jetpack Glance / RemoteViews equivalent
 * of apps/mobile/targets/BudgetWidget/index.swift. Rendered by the OS via
 * react-native-android-widget whenever Android asks for a widget update.
 *
 * Mirrors the iOS widget's language: dark surface, eyebrow, big tabular
 * hero number, pace chip (where the widget is wide enough), days-left
 * subline. We size-branch on width: a Small-equivalent layout below
 * ~2.5 cells wide, a Medium-equivalent (with the chip) above.
 */

import React from 'react';
import {
  FlexWidget,
  TextWidget,
  type WidgetInfo,
} from 'react-native-android-widget';

import type { WidgetPace } from '../../../modules/widget-bridge';

export interface BudgetWidgetProps {
  amount: string;
  daysLeft: number;
  pace: WidgetPace;
  needsReview: boolean;
  info: WidgetInfo;
}

// Matches iOS widget's dark hero surface; the Android widget renderer
// composites over the home-screen wallpaper so we paint a solid ground.
const WIDGET_BG = '#1C1C1E';
const INK_PRIMARY = '#FAFAF7';
const INK_SECONDARY = 'rgba(250, 250, 247, 0.72)';
const INK_DIM = 'rgba(250, 250, 247, 0.55)';

// Pace-chip colour pairs — matches the punchier SwiftUI set from
// commit 8d0f0cc so iOS and Android widgets look like one design.
const PACE_CHIP: Record<
  WidgetPace,
  { bg: string; fg: string; label: string; glyph: string }
> = {
  ahead: {
    bg: 'rgba(92, 186, 120, 0.28)',
    fg: '#9DF2B3',
    label: 'Ahead',
    glyph: '↑',
  },
  onPace: {
    bg: 'rgba(250, 250, 247, 0.18)',
    fg: '#F2F2F4',
    label: 'On pace',
    glyph: '—',
  },
  behind: {
    bg: 'rgba(230, 160, 77, 0.28)',
    fg: '#FACB66',
    label: 'Behind',
    glyph: '↓',
  },
  atLimit: {
    bg: 'rgba(230, 97, 97, 0.28)',
    fg: '#FA8C8C',
    label: 'At limit',
    glyph: '✕',
  },
  needsReview: {
    bg: 'rgba(250, 250, 247, 0.18)',
    fg: '#F2F2F4',
    label: 'Review',
    glyph: '⟳',
  },
};

// Android widgets use dp for sizing. 110dp roughly = one 2x2 Android cell.
// Anything wider than ~180dp we treat as "medium" (chip shown).
const MEDIUM_WIDTH_THRESHOLD = 180;

export function BudgetAndroidWidget({
  amount,
  daysLeft,
  pace,
  info,
}: BudgetWidgetProps): React.JSX.Element {
  const isMedium = info.width >= MEDIUM_WIDTH_THRESHOLD;
  const chip = PACE_CHIP[pace];

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: WIDGET_BG,
        borderRadius: 22,
        padding: isMedium ? 16 : 14,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      }}
      // Tap the widget to open the app's Home.
      clickAction="OPEN_APP"
    >
      {/* Eyebrow row — on medium, pace chip sits on the right */}
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        <TextWidget
          text={isMedium ? 'SAFE TO SPEND TODAY' : 'SAFE TODAY'}
          style={{
            fontSize: 10,
            fontWeight: '500',
            color: INK_DIM,
          }}
        />
        {isMedium ? (
          <FlexWidget
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: chip.bg,
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <TextWidget
              text={chip.glyph}
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: chip.fg,
                marginRight: 4,
              }}
            />
            <TextWidget
              text={chip.label}
              style={{
                fontSize: 10,
                fontWeight: '600',
                color: chip.fg,
              }}
            />
          </FlexWidget>
        ) : null}
      </FlexWidget>

      {/* Hero number */}
      <TextWidget
        text={amount}
        style={{
          fontSize: isMedium ? 36 : 26,
          fontWeight: '600',
          color: INK_PRIMARY,
          marginTop: 2,
        }}
      />

      {/* Subline */}
      <TextWidget
        text={
          isMedium
            ? `${daysLeft} days left this month`
            : `${daysLeft} days left`
        }
        style={{
          fontSize: 12,
          color: INK_SECONDARY,
          marginTop: 4,
        }}
      />
    </FlexWidget>
  );
}
