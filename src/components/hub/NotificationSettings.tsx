// src/components/hub/NotificationSettings.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '@/config/theme';

interface NotificationSetting {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  enabled: boolean;
  color?: string;
}

interface NotificationSettingsProps {
  settings: NotificationSetting[];
  onToggle: (id: string, enabled: boolean) => void;
  onCustomize?: () => void;
}

export function NotificationSettings({
  settings,
  onToggle,
  onCustomize,
}: NotificationSettingsProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="notifications" size={18} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Notification Settings
          </Text>
        </View>
        {onCustomize && (
          <Pressable onPress={onCustomize} style={styles.customizeButton}>
            <Ionicons name="settings-outline" size={18} color={colors.primary} />
          </Pressable>
        )}
      </View>

      {/* Quick toggles */}
      <View style={styles.togglesContainer}>
        {settings.map((setting) => (
          <View key={setting.id} style={styles.toggleItem}>
            <View style={styles.toggleInfo}>
              <Ionicons
                name={setting.icon}
                size={16}
                color={setting.color || colors.textSecondary}
              />
              <Text style={[styles.toggleLabel, { color: colors.text }]}>
                {setting.label}
              </Text>
            </View>
            <Switch
              value={setting.enabled}
              onValueChange={(value) => onToggle(setting.id, value)}
              trackColor={{
                false: colors.border,
                true: colors.primary + '60',
              }}
              thumbColor={setting.enabled ? colors.primary : colors.textDisabled}
              ios_backgroundColor={colors.border}
            />
          </View>
        ))}
      </View>

      {/* Customize link */}
      {onCustomize && (
        <Pressable
          onPress={onCustomize}
          style={({ pressed }) => [
            styles.customizeLink,
            { borderTopColor: colors.divider },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.customizeLinkText, { color: colors.primary }]}>
            Customize notification preferences
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  customizeButton: {
    padding: Spacing.xs,
  },
  togglesContainer: {
    paddingHorizontal: Spacing.md,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleLabel: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
  },
  customizeLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
    marginTop: Spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  customizeLinkText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
  },
});