// src/components/news/SourceBadge.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing } from "@/config/theme";
import type { NewsSourceType } from "@/types";

interface SourceBadgeProps {
  sourceType: NewsSourceType;
  sourceName?: string;
  size?: "small" | "medium";
}

interface SourceConfig {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  labelKey: string;
}

export function SourceBadge({
  sourceType,
  sourceName,
  size = "small",
}: SourceBadgeProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isSmall = size === "small";

  // Get source config with colors
  const getSourceConfig = (type: NewsSourceType): SourceConfig => {
    switch (type) {
      case "saps":
        return {
          icon: "shield-checkmark",
          color: "#4A90D9",
          labelKey: "news.sources.saps",
        };
      case "metro":
        return {
          icon: "car",
          color: colors.primary,
          labelKey: "news.sources.metro",
        };
      case "community":
        return {
          icon: "people",
          color: colors.warning,
          labelKey: "news.sources.community",
        };
      case "media":
        return {
          icon: "newspaper",
          color: "#9B59B6",
          labelKey: "news.sources.media",
        };
      case "rss":
        return {
          icon: "globe-outline",
          color: "#3498DB",
          labelKey: "news.sources.news",
        };
      default:
        return {
          icon: "information-circle-outline",
          color: colors.textSecondary,
          labelKey: "news.sources.source",
        };
    }
  };

  const config = getSourceConfig(sourceType);

  // Get translated label or use sourceName
  const getLabel = (): string => {
    if (sourceName) return sourceName;
    const translated = t(config.labelKey);
    return translated !== config.labelKey ? translated : sourceType;
  };

  return (
    <View style={[styles.container, { backgroundColor: `${config.color}20` }]}>
      <Ionicons
        name={config.icon}
        size={isSmall ? 12 : 16}
        color={config.color}
      />
      <Text
        style={[
          styles.label,
          { color: config.color, fontSize: isSmall ? 10 : 12 },
        ]}
        numberOfLines={1}
      >
        {getLabel()}
      </Text>
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
    maxWidth: 100,
  },
});