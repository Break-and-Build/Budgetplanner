import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'lg' | 'icon';
  disabled?: boolean;
}

export function Button({
  children,
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
}: ButtonProps) {
  const isIcon = size === 'icon';
  const isLg = size === 'lg';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        variant === 'default' && styles.buttonDefault,
        variant === 'outline' && styles.buttonOutline,
        variant === 'ghost' && styles.buttonGhost,
        isIcon && styles.buttonIcon,
        disabled && styles.disabled,
      ]}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.text,
            variant === 'default' && styles.textDefault,
            variant === 'outline' && styles.textOutline,
            variant === 'ghost' && styles.textGhost,
            isLg && styles.textLg,
          ]}
        >
          {children}
        </Text>
      ) : (
        <View>{children}</View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonDefault: {
    backgroundColor: '#4f46e5',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonIcon: {
    width: 40,
    height: 40,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
  textDefault: {
    color: '#ffffff',
  },
  textOutline: {
    color: '#334155',
  },
  textGhost: {
    color: '#64748b',
  },
  textLg: {
    fontSize: 18,
  },
});
