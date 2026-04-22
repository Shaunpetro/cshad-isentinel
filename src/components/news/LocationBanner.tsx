// src/components/news/LocationBanner.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing } from "@/config/theme";

export type LocationStatus = "granted" | "denied" | "undetermined" | "offline";

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
}: LocationBannerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Don't show banner if permission is granted
  if (status === "granted") {
    return null;
  }

  const getBannerConfig = () => {
    switch (status) {
      case "denied":
        return {
          icon: "location-outline" as const,
          messageKey: "location.permissionDenied",
          actionKey: "common.retry",
          backgroundColor: colors.warning + "20",
          iconColor: colors.warning,
        };
      case "offline":
        return {
          icon: "cloud-offline-outline" as const,
          messageKey: "location.unavailable",
          actionKey: "common.retry",
          backgroundColor: colors.textSecondary + "20",
          iconColor: colors.textSecondary,
        };
      case "undetermined":
      default:
        return {
          icon: "navigate-outline" as const,
          messageKey: "location.detecting",
          actionKey: "common.ok",
          backgroundColor: colors.primary + "15",
          iconColor: colors.primary,
        };
    }
  };

  const config = getBannerConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      <Ionicons name={config.icon} size={18} color={config.iconColor} />

      <Text style={[styles.message, { color: colors.text }]} numberOfLines={1}>
        {t(config.messageKey)}
      </Text>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: config.iconColor }]}
        onPress={onEnablePress}
        activeOpacity={0.7}
      >
        <Text style={styles.actionText}>{t(config.actionKey)}</Text>
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
    flexDirection: "row",
    alignItems: "center",
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
    color: "#FFFFFF",
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.bold,
  },
  dismissButton: {
    padding: Spacing.xs,
  },
});