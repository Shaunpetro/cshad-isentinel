// src/components/settings/PreferenceToggle.tsx
/**
 * iOS-style toggle switch preference row
 */

import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing } from '@/config/theme';
import { useTheme } from '@/contexts';

interface PreferenceToggleProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function PreferenceToggle({
  icon,
  iconColor,
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false,
}: PreferenceToggleProps) {
  const { colors } = useTheme();
  
  // Use provided iconColor or default to textSecondary
  const resolvedIconColor = iconColor ?? colors.textSecondary;

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={[styles.iconContainer, { backgroundColor: resolvedIconColor + '20' }]}>
        <Ionicons name={icon} size={20} color={resolvedIconColor} />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: colors.border,
          true: colors.primary + '80',
        }}
        thumbColor={value ? colors.primary : colors.textSecondary}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 56,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  textContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
  },
  subtitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
});