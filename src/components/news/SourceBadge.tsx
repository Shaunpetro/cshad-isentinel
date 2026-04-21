// src/components/news/SourceBadge.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "@/config/theme";
import type { NewsSourceType } from "@/types";

interface SourceBadgeProps {
  sourceType: NewsSourceType;
  sourceName?: string;
  size?: "small" | "medium";
}

const SOURCE_CONFIG: Record<
  NewsSourceType,
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  saps: {
    icon: "shield-checkmark",
    color: "#4A90D9",
    label: "SAPS",
  },
  metro: {
    icon: "car",
    color: Colors.semantic.primary,
    label: "Metro",
  },
  community: {
    icon: "people",
    color: Colors.semantic.warning,
    label: "Community",
  },
  media: {
    icon: "newspaper",
    color: "#9B59B6",
    label: "Media",
  },
  rss: {
    icon: "globe-outline",
    color: "#3498DB",
    label: "News",
  },
};

// Fallback config for unknown source types
const FALLBACK_CONFIG = {
  icon: "information-circle-outline" as keyof typeof Ionicons.glyphMap,
  color: "#7F8C8D",
  label: "Source",
};

export function SourceBadge({
  sourceType,
  sourceName,
  size = "small",
}: SourceBadgeProps) {
  // Use fallback if source type is unknown
  const config = SOURCE_CONFIG[sourceType] || FALLBACK_CONFIG;
  const isSmall = size === "small";

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
        {sourceName || config.label}
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