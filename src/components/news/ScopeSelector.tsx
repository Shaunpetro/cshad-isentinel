// src/components/news/ScopeSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing } from '@/config/theme';
import type { NewsScope } from '@/services/location';

interface ScopeSelectorProps {
  activeScope: NewsScope;
  onScopeChange: (scope: NewsScope) => void;
}

interface ScopeOption {
  id: NewsScope;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const SCOPE_OPTIONS: ScopeOption[] = [
  { id: 'local', label: 'Local', icon: 'location' },
  { id: 'national', label: 'National', icon: 'flag' },
  { id: 'international', label: 'International', icon: 'globe' },
];

export function ScopeSelector({ activeScope, onScopeChange }: ScopeSelectorProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {SCOPE_OPTIONS.map((option) => {
        const isActive = activeScope === option.id;
        // Active state: primary background with dark text
        // Inactive state: transparent with secondary text
        const iconColor = isActive
          ? (isDark ? '#000000' : '#000000')
          : colors.textSecondary;
        const textColor = isActive
          ? (isDark ? '#000000' : '#000000')
          : colors.textSecondary;

        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.option,
              isActive && [styles.optionActive, { backgroundColor: colors.primary }],
            ]}
            onPress={() => onScopeChange(option.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={option.icon}
              size={16}
              color={iconColor}
              style={styles.icon}
            />
            <Text
              style={[
                styles.label,
                { color: textColor },
                isActive && styles.labelActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: 10,
  },
  optionActive: {
    // backgroundColor set dynamically
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
  },
  labelActive: {
    fontFamily: Typography.fonts.bold,
  },
});