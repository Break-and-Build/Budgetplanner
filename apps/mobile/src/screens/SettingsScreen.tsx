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
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, Trash2, X } from 'lucide-react-native';
import { getCurrency, MAX_REMINDER_TIMES } from '@budgetplanner/core';
import type { ReminderTime } from '@budgetplanner/core';

import { useTokens, useThemePreference, type ThemePreference } from '../theme/ThemeProvider';
import { HeaderIconButton } from '../components/ScreenHeader';
import { BottomSheet } from '../components/BottomSheet';
import { Button } from '../components/ui/Button';
import { Switch } from '../components/ui/Switch';
import { useBudget } from '../state/BudgetContext';
import { useAppLock } from '../state/AppLockContext';
import { biometricAvailable } from '../lib/appLock';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const APP_VERSION = '1.1.1';
const APP_TAGLINE = "A calm budget that learns your month.";

export function SettingsScreen() {
  const t = useTokens();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const {
    blob,
    resetAll,
    resetCurrentMonth,
    reminderTimes,
    setReminderTimes,
    notificationsGranted,
  } = useBudget();
  const [confirmAction, setConfirmAction] = useState<null | 'all' | 'month'>(null);
  // Which reminder-time row has its picker open (index), or null.
  const [editingTime, setEditingTime] = useState<number | null>(null);

  const {
    enabled: lockEnabled,
    biometricEnabled,
    disable: disableLock,
    setBiometric,
  } = useAppLock();
  const [bioAvailable, setBioAvailable] = useState(false);
  React.useEffect(() => {
    biometricAvailable().then(setBioAvailable);
  }, []);

  const { preference: themePref, setPreference: setThemePref } = useThemePreference();

  const currentCurrency = getCurrency(blob.currency);

  const dateForTime = (ti: ReminderTime) => {
    const d = new Date();
    d.setHours(ti.hour, ti.minute, 0, 0);
    return d;
  };
  const labelForTime = (ti: ReminderTime) =>
    dateForTime(ti).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  const updateTimeAt = (index: number, date: Date) => {
    setReminderTimes(
      reminderTimes.map((t, i) =>
        i === index ? { hour: date.getHours(), minute: date.getMinutes() } : t,
      ),
    );
  };
  const removeTimeAt = (index: number) => {
    setEditingTime(null);
    setReminderTimes(reminderTimes.filter((_, i) => i !== index));
  };
  const addTime = () => {
    const next = [...reminderTimes, { hour: 9, minute: 0 }];
    setReminderTimes(next);
    setEditingTime(next.length - 1);
  };

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

        {/* ─── Budget ───────────────────────────────────────────────────── */}
        <SectionLabel>Budget</SectionLabel>
        <Card>
          <Row
            label="Categories"
            sublabel="Rename, recolour and set each share."
            onPress={() => nav.navigate('ManageCategories')}
          />
          <Divider />
          <Row
            label="Recurring"
            sublabel="Subscriptions and monthly bills."
            onPress={() => nav.navigate('RecurringList')}
          />
        </Card>

        {/* ─── Reminders ────────────────────────────────────────────────── */}
        <SectionLabel>Daily reminders</SectionLabel>
        <Card>
          {reminderTimes.map((ti, index) => (
            <View key={index}>
              {index > 0 ? <Divider /> : null}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: t.space[4],
                  paddingVertical: t.space[3],
                  minHeight: 56,
                }}
              >
                <Pressable
                  onPress={() => setEditingTime(editingTime === index ? null : index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Reminder at ${labelForTime(ti)}. Edit time.`}
                  style={{ flex: 1 }}
                >
                  <Text
                    allowFontScaling
                    maxFontSizeMultiplier={t.a11y.maxFontScale}
                    style={[t.type.body, { color: t.color.text.primary }]}
                  >
                    {labelForTime(ti)}
                  </Text>
                </Pressable>
                {reminderTimes.length > 1 ? (
                  <Pressable
                    onPress={() => removeTimeAt(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove reminder at ${labelForTime(ti)}`}
                    hitSlop={8}
                    style={({ pressed }) => ({ padding: t.space[1], opacity: pressed ? 0.5 : 1 })}
                  >
                    <Trash2 size={18} color={t.color.text.tertiary} strokeWidth={1.75} />
                  </Pressable>
                ) : null}
              </View>
              {editingTime === index ? (
                <View style={{ paddingHorizontal: t.space[4], paddingBottom: t.space[3] }}>
                  <DateTimePicker
                    value={dateForTime(ti)}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selected) => {
                      if (Platform.OS === 'android') setEditingTime(null);
                      if (event.type === 'set' && selected) updateTimeAt(index, selected);
                    }}
                    style={{ alignSelf: 'flex-start' }}
                  />
                </View>
              ) : null}
            </View>
          ))}
          {reminderTimes.length < MAX_REMINDER_TIMES ? (
            <>
              <Divider />
              <Row label="Add a time" onPress={addTime} />
            </>
          ) : null}
        </Card>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.caption1,
            {
              color: t.color.text.secondary,
              paddingHorizontal: t.space[5],
              paddingTop: t.space[2],
            },
          ]}
        >
          {notificationsGranted
            ? 'Up to five a day. Plus a nudge on the 28th to close out the month. Turn them off in your device settings.'
            : 'Notifications are turned off. Enable them for Budget Tracker in your device settings.'}
        </Text>

        {/* ─── Privacy & security ───────────────────────────────────────── */}
        <SectionLabel>Privacy &amp; security</SectionLabel>
        <Card>
          {!lockEnabled ? (
            <Row
              label="App lock"
              sublabel="PIN or biometrics to open."
              value="Off"
              onPress={() => nav.navigate('AppLockSetup', { mode: 'enable' })}
            />
          ) : (
            <>
              {bioAvailable ? (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: t.space[4],
                      paddingVertical: t.space[3],
                      minHeight: 56,
                    }}
                  >
                    <View style={{ flex: 1, paddingRight: t.space[3] }}>
                      <Text
                        allowFontScaling
                        maxFontSizeMultiplier={t.a11y.maxFontScale}
                        style={[t.type.body, { color: t.color.text.primary }]}
                      >
                        Unlock with Face ID / Touch ID
                      </Text>
                    </View>
                    <Switch
                      value={biometricEnabled}
                      onValueChange={(v) => setBiometric(v)}
                      accessibilityLabel="Toggle biometric unlock"
                    />
                  </View>
                  <Divider />
                </>
              ) : null}
              <Row label="Change PIN" onPress={() => nav.navigate('AppLockSetup', { mode: 'change' })} />
              <Divider />
              <Row label="Turn off app lock" destructive onPress={() => disableLock()} />
            </>
          )}
        </Card>

        {/* ─── Appearance ───────────────────────────────────────────────── */}
        <SectionLabel>Appearance</SectionLabel>
        <Card>
          <View style={{ paddingHorizontal: t.space[3], paddingVertical: t.space[3] }}>
            <ThemeSegmented value={themePref} onChange={setThemePref} />
          </View>
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

        {/* ─── About footer — no card, no section label; the app speaks for
             itself once you've got this far. */}
        <View style={{ alignItems: 'center', paddingHorizontal: t.space[6], paddingTop: t.space[8] }}>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.subhead,
              { color: t.color.text.primary, fontWeight: t.fontWeight.medium, textAlign: 'center' },
            ]}
          >
            Budget Tracker
          </Text>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.footnote,
              { color: t.color.text.secondary, textAlign: 'center', marginTop: 2 },
            ]}
          >
            {APP_TAGLINE}
          </Text>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={t.a11y.maxFontScale}
            style={[
              t.type.caption1,
              {
                color: t.color.text.tertiary,
                textAlign: 'center',
                marginTop: t.space[3],
                lineHeight: 18,
              },
            ]}
          >
            Version {APP_VERSION} · Your data lives only on this device.{'\n'}
            Icons by{' '}
            <Text
              onPress={() => Linking.openURL('https://lucide.dev').catch(() => {})}
              style={{ color: t.color.text.secondary }}
            >
              Lucide
            </Text>
            .
          </Text>
        </View>
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
  // Quieter than the previous secondary/caption2 treatment — a subdued label
  // that anchors the section without competing with the row content.
  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={t.a11y.maxFontScale}
      style={[
        t.type.caption2,
        {
          color: t.color.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          fontWeight: t.fontWeight.medium,
          paddingHorizontal: t.space[5],
          paddingTop: t.space[6],
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
        borderColor: t.color.border.card,
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

// ─── Theme segmented ─────────────────────────────────────────────────────────
// Three-segment picker: System · Light · Dark. Matches the pill treatment
// used on the ₦/% toggle so the visual language stays consistent.

function ThemeSegmented({
  value,
  onChange,
}: {
  value: ThemePreference;
  onChange: (next: ThemePreference) => void;
}) {
  const t = useTokens();
  const options: Array<{ key: ThemePreference; label: string }> = [
    { key: 'system', label: 'System' },
    { key: 'light', label: 'Light' },
    { key: 'dark', label: 'Dark' },
  ];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'stretch',
        height: 44,
        backgroundColor: t.color.bg.sunken,
        borderRadius: t.radii.md,
        padding: 2,
      }}
    >
      {options.map((opt) => {
        const selected = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            accessibilityRole="button"
            accessibilityLabel={`${opt.label} theme`}
            accessibilityState={{ selected }}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: t.radii.md - 2,
              backgroundColor: selected ? t.color.bg.elevated : 'transparent',
              ...(selected ? t.shadow.xs : {}),
            }}
          >
            <Text
              allowFontScaling
              maxFontSizeMultiplier={t.a11y.maxFontScale}
              style={[
                t.type.subhead,
                {
                  color: selected ? t.color.text.primary : t.color.text.secondary,
                  fontWeight: selected ? t.fontWeight.semibold : t.fontWeight.regular,
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
