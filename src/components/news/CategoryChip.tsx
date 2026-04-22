// src/components/news/CategoryChip.tsx
import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing, BorderRadius } from "@/config/theme";
import type { NewsCategory } from "@/types";

// Icons for all possible categories
const CATEGORY_ICONS: Record<string, string> = {
  all: "📋",
  crime: "🚨",
  safety: "🛡️",
  community: "🏘️",
  infrastructure: "🔧",
  weather: "⛈️",
  traffic: "🚗",
  general: "📰",
  politics: "🏛️",
  health: "🏥",
  accident: "🚧",
  fire: "🔥",
  water: "💧",
  electricity: "⚡",
  other: "📌",
};

interface Props {
  category: NewsCategory | "all";
  isActive: boolean;
  onPress: () => void;
  count?: number; // Optional count badge
}

export function CategoryChip({ category, isActive, onPress, count }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Get icon with fallback
  const icon = CATEGORY_ICONS[category] || "📌";
  
  // Get translated label with fallback
  const labelKey = `news.categories.${category}`;
  const translated = t(labelKey);
  // If translation key not found, capitalize the category name
  const label = translated !== labelKey 
    ? translated 
    : category.charAt(0).toUpperCase() + category.slice(1);

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
      <Text style={styles.icon}>{icon}</Text>
      <Text
        style={[
          styles.label,
          { color: colors.textSecondary },
          isActive && { color: colors.primary },
        ]}
      >
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <Text
          style={[
            styles.count,
            { 
              color: isActive ? colors.primary : colors.textSecondary,
              backgroundColor: isActive ? `${colors.primary}30` : colors.border,
            },
          ]}
        >
          {count > 99 ? "99+" : count}
        </Text>
      )}
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
  count: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.bold,
    marginLeft: Spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
});