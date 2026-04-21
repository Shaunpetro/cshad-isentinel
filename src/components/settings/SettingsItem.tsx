// src/components/settings/SettingsItem.tsx
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing } from '@/config/theme';
import { useTheme } from '@/contexts';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingsItemProps {
  icon: IconName;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  disabled?: boolean;
  rightElement?: React.ReactNode;
}

export function SettingsItem({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  showArrow = true,
  disabled = false,
  rightElement,
}: SettingsItemProps) {
  const { colors } = useTheme();
  
  // Use provided iconColor or default to primary
  const resolvedIconColor = iconColor ?? colors.primary;

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${resolvedIconColor}20` }]}>
        <Ionicons name={icon} size={20} color={resolvedIconColor} />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: disabled ? colors.textDisabled : colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: disabled ? colors.textDisabled : colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {rightElement ? (
        rightElement
      ) : showArrow && onPress ? (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={disabled ? colors.textDisabled : colors.textSecondary}
        />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: Spacing.md,
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