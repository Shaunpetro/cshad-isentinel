// src/components/news/SeverityBadge.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing, BorderRadius } from "@/config/theme";
import type { NewsSeverity } from "@/types";

interface Props {
  severity: NewsSeverity;
}

export function SeverityBadge({ severity }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  // Get severity config with theme colors
  const getSeverityConfig = (sev: NewsSeverity) => {
    switch (sev) {
      case "low":
        return { color: colors.success, bg: colors.success + "20" };
      case "medium":
        return { color: colors.warning, bg: colors.warning + "20" };
      case "high":
        return { color: colors.danger, bg: colors.danger + "20" };
      case "critical":
        return { color: colors.danger, bg: colors.danger + "35" };
      default:
        return { color: colors.textSecondary, bg: colors.border };
    }
  };

  const config = getSeverityConfig(severity);

  // Get translated label
  const getLabel = (): string => {
    const key = `news.severity.${severity}`;
    const translated = t(key);
    return translated !== key ? translated : severity;
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{getLabel()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  text: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.mono,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});