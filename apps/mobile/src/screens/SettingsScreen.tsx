/**
 * SettingsScreen — the gear-icon modal from Home.
 *
 * Three sections, top-to-bottom:
 *   1. Currency — tap → pushes CurrencyPickerScreen in edit mode
 *   2. Reset    — Reset current month / Reset everything (destructive)
 *   3. About    — version, app description, attributions
 *
 * Per the IA: Settings is presented as a modal sheet, not a tab. The X in
 * the top-right dismisses the whole modal.
 */

import React, { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, X } from 'lucide-react-native';
import { getCurrency } from '@budgetplanner/core';

import { useTokens } from '../theme/ThemeProvider';
import { HeaderIconButton } from '../components/ScreenHeader';
import { BottomSheet } from '../components/BottomSheet';
import { Button } from '../components/ui/Button';
import { useBudget } from '../state/BudgetContext';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const APP_VERSION = '1.0.0';
const APP_TAGLINE = "A calm budget that learns your month.";

export function SettingsScreen() {
  const t = useTokens();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { blob, resetAll, resetCurrentMonth } = useBudget();
  const [confirmAction, setConfirmAction] = useState<null | 'all' | 'month'>(null);

  const currentCurrency = getCurrency(blob.currency);

  const onResetAll = async () => {
    await resetAll();
    setConfirmAction(null);
    // Send the user back to FirstRun to re-pick a currency + run setup.
    nav.reset({ index: 0, routes: [{ name: 'FirstRun' }] });
  };

  const onResetMonth = () => {
    resetCurrentMonth();
    setConfirmAction(null);
    nav.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.color.bg.base, paddingTop: insets.top }}>
      {/* Custom header — centered title + close X.
          (Native modal header is disabled in App.tsx to avoid double bars.) */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: t.space[4],
          paddingTop: t.space[2],
          paddingBottom: t.space[2],
          minHeight: t.layout.minTapTarget,
        }}
      >
        <View style={{ width: t.layout.minTapTarget }} />
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          accessibilityRole="header"
          style={[
            t.type.headline,
            { color: t.color.text.primary, flex: 1, textAlign: 'center' },
          ]}
        >
          Settings
        </Text>
        <HeaderIconButton onPress={nav.goBack} accessibilityLabel="Close settings">
          <X size={22} color={t.color.text.primary} strokeWidth={1.75} />
        </HeaderIconButton>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + t.space[8],
        }}
      >
        {/* ─── Currency ─────────────────────────────────────────────────── */}
        <SectionLabel>Currency</SectionLabel>
        <Card>
          <Row
            label="Currency"
            value={`${currentCurrency.symbol}  ${currentCurrency.name}`}
            onPress={() => nav.navigate('FirstRun', { mode: 'edit' })}
          />
        </Card>

        {/* ─── Reset ────────────────────────────────────────────────────── */}
        <SectionLabel>Reset</SectionLabel>
        <Card>
          <Row
            label="Reset current month"
            sublabel="Clears transactions; keeps your plan."
            onPress={() => setConfirmAction('month')}
            destructive
          />
          <Divider />
          <Row
            label="Reset everything"
            sublabel="Wipes plan, currency, and transactions."
            onPress={() => setConfirmAction('all')}
            destructive
          />
        </Card>

        {/* ─── About ────────────────────────────────────────────────────── */}
        <SectionLabel>About</SectionLabel>
        <Card>
          <Row label="Version" value={APP_VERSION} />
          <Divider />
          <Row label="What this is" sublabel={APP_TAGLINE} />
        </Card>

        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.caption1,
            {
              color: t.color.text.tertiary,
              textAlign: 'center',
              paddingHorizontal: t.space[6],
              paddingTop: t.space[6],
              lineHeight: 18,
            },
          ]}
        >
          Your data lives only on this device.{'\n'}
          Built with React Native + Expo. Icons by{' '}
          <Text
            onPress={() => Linking.openURL('https://lucide.dev').catch(() => {})}
            style={{ color: t.color.text.secondary }}
          >
            Lucide
          </Text>
          .
        </Text>
      </ScrollView>

      {/* Reset-current-month confirmation */}
      <BottomSheet
        visible={confirmAction === 'month'}
        onDismiss={() => setConfirmAction(null)}
      >
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          accessibilityRole="header"
          style={[t.type.title2, { color: t.color.text.primary, marginBottom: t.space[2] }]}
        >
          Reset this month?
        </Text>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[t.type.body, { color: t.color.text.secondary, marginBottom: t.space[6] }]}
        >
          All transactions logged this month will be deleted. Your plan (income,
          priorities, savings, split) stays as-is.
        </Text>
        <View style={{ flexDirection: 'row', gap: t.space[3], marginBottom: t.space[2] }}>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" onPress={() => setConfirmAction(null)} fullWidth>
              Cancel
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button variant="destructive" onPress={onResetMonth} fullWidth>
              Reset
            </Button>
          </View>
        </View>
      </BottomSheet>

      {/* Reset-everything confirmation */}
      <BottomSheet
        visible={confirmAction === 'all'}
        onDismiss={() => setConfirmAction(null)}
      >
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          accessibilityRole="header"
          style={[t.type.title2, { color: t.color.text.primary, marginBottom: t.space[2] }]}
        >
          Reset everything?
        </Text>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[t.type.body, { color: t.color.text.secondary, marginBottom: t.space[6] }]}
        >
          This wipes the entire budget — currency, plan, every transaction.
          You'll start fresh with the currency picker. This can't be undone.
        </Text>
        <View style={{ flexDirection: 'row', gap: t.space[3], marginBottom: t.space[2] }}>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" onPress={() => setConfirmAction(null)} fullWidth>
              Cancel
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button variant="destructive" onPress={onResetAll} fullWidth>
              Reset all
            </Button>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

// ─── Row primitives ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  const t = useTokens();
  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={t.a11y.maxFontScale}
      style={[
        t.type.caption2,
        {
          color: t.color.text.secondary,
          textTransform: 'uppercase',
          paddingHorizontal: t.space[4],
          paddingTop: t.space[5],
          paddingBottom: t.space[2],
        },
      ]}
    >
      {children}
    </Text>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const t = useTokens();
  return (
    <View
      style={{
        marginHorizontal: t.space[4],
        backgroundColor: t.color.bg.elevated,
        borderRadius: t.radii.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: t.color.border.hairline,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

function Divider() {
  const t = useTokens();
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: t.color.border.hairline,
        marginLeft: t.space[4],
      }}
    />
  );
}

interface RowProps {
  label: string;
  sublabel?: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}

function Row({ label, sublabel, value, onPress, destructive }: RowProps) {
  const t = useTokens();
  const tappable = !!onPress;
  const Container: React.ComponentType<any> = tappable ? Pressable : View;
  return (
    <Container
      {...(tappable
        ? {
            onPress,
            accessibilityRole: 'button',
            accessibilityLabel: label,
          }
        : { accessible: true, accessibilityLabel: label })}
      style={
        tappable
          ? ({ pressed }: { pressed: boolean }) => ({
              flexDirection: 'row' as const,
              alignItems: 'center' as const,
              paddingHorizontal: t.space[4],
              paddingVertical: t.space[3],
              minHeight: 56,
              backgroundColor: pressed ? t.color.bg.sunken : 'transparent',
            })
          : {
              flexDirection: 'row' as const,
              alignItems: 'center' as const,
              paddingHorizontal: t.space[4],
              paddingVertical: t.space[3],
              minHeight: 56,
            }
      }
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.body,
            {
              color: destructive ? t.color.status.overBudget : t.color.text.primary,
              fontWeight: destructive ? t.fontWeight.medium : t.fontWeight.regular,
            },
          ]}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.footnote,
              { color: t.color.text.secondary, marginTop: 2 },
            ]}
          >
            {sublabel}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.body,
            { color: t.color.text.secondary, marginRight: tappable ? t.space[2] : 0 },
          ]}
        >
          {value}
        </Text>
      ) : null}
      {tappable && !destructive ? (
        <ChevronRight size={18} color={t.color.text.tertiary} strokeWidth={1.75} />
      ) : null}
    </Container>
  );
}
