// src/components/privacy/DataControlButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/config/theme';

interface DataControlButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
}

export function DataControlButton({
  icon,
  label,
  description,
  onPress,
  variant = 'default',
  isLoading = false,
  disabled = false,
}: DataControlButtonProps) {
  const iconColor =
    variant === 'danger' ? Colors.semantic.danger : Colors.semantic.primary;

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={22} color={iconColor} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.description}>{description}</Text>
      {isLoading ? (
        <ActivityIndicator
          color={Colors.carbon.silver}
          size="small"
          style={styles.arrow}
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.carbon.silver}
          style={styles.arrow}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.carbon.charcoal,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.carbon.steel,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  label: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
    marginRight: Spacing.xs,
  },
  description: {
    flex: 1,
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
  },
  arrow: {
    marginLeft: Spacing.xs,
  },
});