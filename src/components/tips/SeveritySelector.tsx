// src/components/tips/SeveritySelector.tsx
/**
 * Severity level picker with visual indicators
 * Supports light/dark theme
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing, BorderRadius } from "@/config/theme";
import { SEVERITIES } from "@/config/tipCategories";
import type { NewsSeverity } from "@/types";

interface SeveritySelectorProps {
  value: NewsSeverity | null;
  onChange: (severity: NewsSeverity) => void;
  error?: string;
}

export function SeveritySelector({
  value,
  onChange,
  error,
}: SeveritySelectorProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  // Get translated severity label
  const getSeverityLabel = (severityId: string): string => {
    const key = `news.severity.${severityId}`;
    const translated = t(key);
    return translated !== key ? translated : severityId;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t("tip.severityLevel")} *
      </Text>

      <View style={styles.grid}>
        {SEVERITIES.map((severity) => {
          const isSelected = value === severity.id;

          return (
            <Pressable
              key={severity.id}
              onPress={() => onChange(severity.id)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? severity.color : colors.border,
                },
                isSelected && {
                  backgroundColor: severity.color + "20",
                },
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={styles.optionIcon}>{severity.icon}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  { color: isSelected ? severity.color : colors.text },
                ]}
              >
                {getSeverityLabel(severity.id)}
              </Text>
              {isSelected && (
                <Text
                  style={[styles.optionDesc, { color: colors.textSecondary }]}
                >
                  {severity.description}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  option: {
    width: "48%",
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  optionPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  optionIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  optionLabel: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    textAlign: "center",
  },
  optionDesc: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  error: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.sm,
  },
});