/**
 * Web preview entry — renders the mobile HomeScreen design inside a phone
 * frame so the design intent reads correctly in the browser.
 *
 * The real mobile app lives in `apps/mobile/` (Expo + React Native). This
 * file exists so design iterations can be previewed without spinning up the
 * mobile simulator.
 *
 * Prior to the budget tracker rebuild, `src/app/App.tsx` was a weather app —
 * it's preserved as `WeatherApp.tsx` for reference and is currently unused.
 */

import { BudgetHomeScreen } from './budget/HomeScreen';
import { SYSTEM_FONT, tokens } from './budget/tokens';

export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, #ECECE8 0%, #DFDED8 50%, #D4D3CC 100%)',
        fontFamily: SYSTEM_FONT,
        padding: '32px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
      }}
    >
      {/* Caption above the device frame */}
      <div style={{ maxWidth: 412, width: '100%', color: '#5A5A60' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          Budget Tracker · v1 design preview
        </div>
        <div style={{ fontSize: 13, marginTop: 4, color: '#7A7A80' }}>
          Mobile HomeScreen (`apps/mobile/src/screens/HomeScreen.tsx`) ported for browser preview.
          Mock month — May 2026. Reference date: May 17.
        </div>
      </div>

      {/* Phone frame */}
      <div
        style={{
          width: '100%',
          maxWidth: 412,
          aspectRatio: '9 / 19.5',
          minHeight: 800,
          borderRadius: 44,
          backgroundColor: tokens.color.bg.base,
          border: '10px solid #1B1B1F',
          boxShadow: '0 30px 60px rgba(0,0,0,0.18), 0 6px 14px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Status-bar simulation */}
        <div
          style={{
            height: 44,
            paddingTop: 12,
            paddingLeft: 24,
            paddingRight: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: tokens.color.bg.base,
            fontSize: 13,
            fontWeight: 600,
            color: tokens.color.text.primary,
            position: 'relative',
          }}
        >
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>9:41</span>
          {/* Dynamic-island stand-in */}
          <span
            style={{
              position: 'absolute',
              left: '50%',
              top: 6,
              transform: 'translateX(-50%)',
              width: 90,
              height: 26,
              background: '#0A0A0E',
              borderRadius: 16,
            }}
          />
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <SignalDots />
            <BatteryIcon />
          </span>
        </div>

        {/* Actual content */}
        <div style={{ position: 'absolute', inset: 44 + 0 + 'px 0 0 0', overflowY: 'auto' }}>
          <BudgetHomeScreen />
        </div>

        {/* Home indicator */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 8,
            width: 134,
            height: 5,
            borderRadius: 3,
            background: '#15151A',
            opacity: 0.65,
          }}
        />
      </div>

      {/* Small legend below */}
      <div style={{ maxWidth: 412, width: '100%', fontSize: 11, color: '#7A7A80', lineHeight: 1.6 }}>
        <strong style={{ color: '#5A5A60' }}>What's wired:</strong>{' '}
        plan-vs-actual math, days-left calc, today's-spent subtraction, category
        bar fill ratios, recent activity. Buttons are visual-only in this
        preview — FastLogSheet, Settings modal, CategoryDetail are upcoming Phase 6 tasks.
      </div>
    </div>
  );
}

// Tiny SF-style status bar icons
function SignalDots() {
  return (
    <svg width={18} height={10} viewBox="0 0 18 10" fill="currentColor">
      <rect x={0} y={6} width={3} height={4} rx={0.5} />
      <rect x={5} y={4} width={3} height={6} rx={0.5} />
      <rect x={10} y={2} width={3} height={8} rx={0.5} />
      <rect x={15} y={0} width={3} height={10} rx={0.5} />
    </svg>
  );
}
function BatteryIcon() {
  return (
    <svg width={26} height={12} viewBox="0 0 26 12" fill="none">
      <rect x={0.5} y={0.5} width={22} height={11} rx={3} stroke="currentColor" />
      <rect x={2} y={2} width={17} height={8} rx={1.5} fill="currentColor" />
      <rect x={23.5} y={3.5} width={1.5} height={5} rx={0.5} fill="currentColor" />
    </svg>
  );
}
