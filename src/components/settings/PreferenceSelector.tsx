// src/components/settings/PreferenceSelector.tsx
/**
 * iOS-style selector preference row
 * Tappable row that shows current value and opens picker
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing } from '@/config/theme';
import { useTheme } from '@/contexts';

interface PreferenceSelectorProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value: string;
  onPress: () => void;
  disabled?: boolean;
}

export function PreferenceSelector({
  icon,
  iconColor,
  title,
  subtitle,
  value,
  onPress,
  disabled = false,
}: PreferenceSelectorProps) {
  const { colors } = useTheme();
  
  // Use provided iconColor or default to textSecondary
  const resolvedIconColor = iconColor ?? colors.textSecondary;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && { backgroundColor: colors.border + '40' },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
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

      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: colors.textSecondary }]} numberOfLines={1}>
          {value}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.textSecondary}
          style={styles.chevron}
        />
      </View>
    </Pressable>
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
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '40%',
  },
  value: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
  },
  chevron: {
    marginLeft: Spacing.xs,
  },
});