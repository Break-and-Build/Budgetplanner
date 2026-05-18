import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { useTokens } from '../../theme/ThemeProvider';

interface SelectItem {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  items: SelectItem[];
  placeholder?: string;
  accessibilityLabel?: string;
}

/**
 * Inline picker. Tap → centered modal with a scrollable list. The selected
 * row gets a check mark (not a fill color) — keeps the Apple-Wallet vibe.
 */
export function Select({
  value,
  onValueChange,
  items,
  placeholder = 'Select…',
  accessibilityLabel,
}: SelectProps) {
  const t = useTokens();
  const [open, setOpen] = useState(false);
  const selected = items.find((item) => item.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? placeholder}
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [
          {
            minHeight: 48,
            backgroundColor: pressed ? t.color.bg.sunken : t.color.bg.elevated,
            borderRadius: t.radii.md,
            paddingHorizontal: t.space[4],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: t.color.border.hairline,
          },
        ]}
      >
        <Text
          allowFontScaling
          maxFontSizeMultiplier={t.a11y.maxFontScale}
          style={[
            t.type.body,
            { color: selected ? t.color.text.primary : t.color.text.tertiary },
          ]}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={20} color={t.color.text.secondary} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          accessibilityLabel="Close menu"
          style={[styles.backdrop, { backgroundColor: t.color.bg.overlay }]}
          onPress={() => setOpen(false)}
        >
          <View
            style={[
              styles.panel,
              {
                backgroundColor: t.color.bg.elevated,
                borderRadius: t.radii.lg,
                ...t.shadow.lg,
              },
            ]}
          >
            <ScrollView bounces={false}>
              {items.map((item) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => {
                      onValueChange(item.value);
                      setOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={({ pressed }) => [
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: t.space[4],
                        paddingVertical: t.space[3],
                        backgroundColor: pressed ? t.color.bg.sunken : 'transparent',
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: t.color.border.hairline,
                      },
                    ]}
                  >
                    <Text
                      allowFontScaling
                      maxFontSizeMultiplier={t.a11y.maxFontScale}
                      style={[
                        t.type.body,
                        {
                          color: t.color.text.primary,
                          fontWeight: isSelected ? t.fontWeight.semibold : t.fontWeight.regular,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected ? (
                      <Check size={18} color={t.color.text.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  panel: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '70%',
    overflow: 'hidden',
  },
});
