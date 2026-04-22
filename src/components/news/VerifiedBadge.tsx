// src/components/news/VerifiedBadge.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing } from "@/config/theme";

interface VerifiedBadgeProps {
  isVerified: boolean;
  showLabel?: boolean;
  size?: "small" | "medium";
}

export function VerifiedBadge({
  isVerified,
  showLabel = false,
  size = "small",
}: VerifiedBadgeProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isSmall = size === "small";
  const iconSize = isSmall ? 12 : 16;
  const fontSize = isSmall ? 10 : 12;

  if (isVerified) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.success + "20" }]}
      >
        <Ionicons
          name="checkmark-circle"
          size={iconSize}
          color={colors.success}
        />
        {showLabel && (
          <Text style={[styles.label, { color: colors.success, fontSize }]}>
            {t("news.verified")}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.textSecondary + "20" }]}
    >
      <Ionicons
        name="help-circle"
        size={iconSize}
        color={colors.textSecondary}
      />
      {showLabel && (
        <Text
          style={[styles.label, { color: colors.textSecondary, fontSize }]}
        >
          {t("news.unverified")}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  label: {
    fontFamily: Typography.fonts.medium,
  },
});