// src/components/news/CategoryChip.tsx
import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing, BorderRadius } from "@/config/theme";
import type { NewsCategory } from "@/types";

const CATEGORY_CONFIG: Record<
  NewsCategory | "all",
  { label: string; icon: string }
> = {
  all: { label: "All", icon: "📋" },
  crime: { label: "Crime", icon: "🚨" },
  safety: { label: "Safety", icon: "🛡️" },
  community: { label: "Community", icon: "🏘️" },
  infrastructure: { label: "Infrastructure", icon: "🔧" },
  weather: { label: "Weather", icon: "⛈️" },
  traffic: { label: "Traffic", icon: "🚗" },
  general: { label: "General", icon: "📰" },
};

interface Props {
  category: NewsCategory | "all";
  isActive: boolean;
  onPress: () => void;
}

export function CategoryChip({ category, isActive, onPress }: Props) {
  const { colors } = useTheme();
  const config = CATEGORY_CONFIG[category];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        isActive && {
          backgroundColor: `${colors.primary}20`,
          borderColor: colors.primary,
        },
      ]}
    >
      <Text style={styles.icon}>{config.icon}</Text>
      <Text
        style={[
          styles.label,
          { color: colors.textSecondary },
          isActive && { color: colors.primary },
        ]}
      >
        {config.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  icon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  label: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.medium,
  },
});