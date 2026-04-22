// src/components/news/MapCallout.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing, BorderRadius } from "@/config/theme";
import { SeverityBadge } from "./SeverityBadge";
import { timeAgo, truncate } from "@/utils/formatters";
import type { NewsItem } from "@/types";

interface Props {
  article: NewsItem;
}

export function MapCallout({ article }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  // Get translated category
  const getCategoryLabel = (category: string): string => {
    const key = `news.categories.${category}`;
    const translated = t(key);
    return translated !== key ? translated.toUpperCase() : category.toUpperCase();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Top row */}
      <View style={styles.topRow}>
        <Text style={[styles.category, { color: colors.primary }]}>
          {getCategoryLabel(article.category)}
        </Text>
        <SeverityBadge severity={article.severity} />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {article.title}
      </Text>

      {/* Summary */}
      <Text
        style={[styles.summary, { color: colors.textSecondary }]}
        numberOfLines={2}
      >
        {truncate(article.summary, 100)}
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        {article.locationName && (
          <Text
            style={[styles.location, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            📍 {article.locationName}
          </Text>
        )}
        <Text style={[styles.time, { color: colors.textDisabled }]}>
          {timeAgo(article.publishedAt)}
        </Text>
      </View>

      {/* Tap hint */}
      <Text style={[styles.hint, { color: colors.primary }]}>
        {t("news.readMore")} →
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  category: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.mono,
    letterSpacing: 1,
  },
  title: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
    lineHeight: Typography.sizes.caption * 1.3,
    marginBottom: Spacing.xs,
  },
  summary: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
    lineHeight: Typography.sizes.label * 1.4,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  location: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
    flex: 1,
  },
  time: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.mono,
  },
  hint: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.medium,
    textAlign: "right",
    marginTop: Spacing.xs,
  },
});