// src/components/news/LocationBanner.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts';
import { Colors, Typography, Spacing } from '@/config/theme';

export type LocationStatus = 'granted' | 'denied' | 'undetermined' | 'offline';

interface LocationBannerProps {
  status: LocationStatus;
  onEnablePress: () => void;
  onDismiss?: () => void;
  cityName?: string;
}

export function LocationBanner({
  status,
  onEnablePress,
  onDismiss,
  cityName,
}: LocationBannerProps) {
  const { colors } = useTheme();

  // Don't show banner if permission is granted
  if (status === 'granted') {
    return null;
  }

  const getBannerConfig = () => {
    switch (status) {
      case 'denied':
        return {
          icon: 'location-outline' as const,
          message: 'Location access denied. Enable for local news.',
          actionText: 'Enable',
          backgroundColor: Colors.semantic.warning + '20',
          iconColor: Colors.semantic.warning,
        };
      case 'offline':
        return {
          icon: 'cloud-offline-outline' as const,
          message: `Showing national news. You're offline.`,
          actionText: 'Retry',
          backgroundColor: colors.textSecondary + '20',
          iconColor: colors.textSecondary,
        };
      case 'undetermined':
      default:
        return {
          icon: 'navigate-outline' as const,
          message: 'Enable location for live local news.',
          actionText: 'Enable',
          backgroundColor: colors.primary + '15',
          iconColor: colors.primary,
        };
    }
  };

  const config = getBannerConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      <Ionicons name={config.icon} size={18} color={config.iconColor} />
      
      <Text style={[styles.message, { color: colors.text }]} numberOfLines={1}>
        {config.message}
      </Text>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: config.iconColor }]}
        onPress={onEnablePress}
        activeOpacity={0.7}
      >
        <Text style={styles.actionText}>{config.actionText}</Text>
      </TouchableOpacity>

      {onDismiss && (
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: 8,
    gap: Spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
  },
  actionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.bold,
  },
  dismissButton: {
    padding: Spacing.xs,
  },
});