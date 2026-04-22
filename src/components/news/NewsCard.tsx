// src/components/news/NewsCard.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "@/config/theme";
import { SeverityBadge } from "./SeverityBadge";
import { SourceBadge } from "./SourceBadge";
import { VerifiedBadge } from "./VerifiedBadge";
import { stripHtml, truncate } from "@/utils/formatters";
import type { NewsItem } from "@/types";

interface Props {
  article: NewsItem;
  onPress: (article: NewsItem) => void;
}

export function NewsCard({ article, onPress }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Get translated category
  const getCategoryLabel = (category: string): string => {
    const key = `news.categories.${category}`;
    const translated = t(key);
    return translated !== key
      ? translated.toUpperCase()
      : category.toUpperCase();
  };

  // Translated time ago function
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t("time.justNow");
    if (diffMins < 60) return t("time.minutesAgo", { count: diffMins });
    if (diffHours < 24) return t("time.hoursAgo", { count: diffHours });
    return t("time.daysAgo", { count: diffDays });
  };

  // Clean title and summary from HTML tags
  const cleanTitle = stripHtml(article.title);
  const cleanSummary = stripHtml(article.summary);

  return (
    <Pressable
      onPress={() => onPress(article)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface },
        pressed && styles.cardPressed,
      ]}
    >
      {/* Image */}
      {article.imageUrl && (
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      )}

      <View style={styles.content}>
        {/* Top row: Category + Severity */}
        <View style={styles.metaRow}>
          <Text style={[styles.category, { color: colors.primary }]}>
            {getCategoryLabel(article.category)}
          </Text>
          <SeverityBadge severity={article.severity} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {cleanTitle}
        </Text>

        {/* Summary */}
        <Text
          style={[styles.summary, { color: colors.textSecondary }]}
          numberOfLines={3}
        >
          {truncate(cleanSummary, 150)}
        </Text>

        {/* Source row: Source Badge + Verified Badge */}
        <View style={styles.sourceRow}>
          <SourceBadge
            sourceType={article.sourceType}
            sourceName={article.source}
            size="small"
          />
          <VerifiedBadge
            isVerified={article.isVerified}
            showLabel={true}
            size="small"
          />
        </View>

        {/* Bottom row: Location + Time */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            {article.locationName && (
              <Text
                style={[styles.location, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                📍 {article.locationName}
              </Text>
            )}
          </View>
          <Text style={[styles.time, { color: colors.textDisabled }]}>
            {getTimeAgo(article.publishedAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    overflow: "hidden",
    ...Shadows.md,
  },
  cardPressed: {
    opacity: 0.85,
  },
  image: {
    width: "100%",
    height: 180,
  },
  content: {
    padding: Spacing.md,
  },
  metaRow: {
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
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
    lineHeight: Typography.sizes.heading * 1.2,
    marginBottom: Spacing.sm,
  },
  summary: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    lineHeight: Typography.sizes.caption * 1.4,
    marginBottom: Spacing.sm,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  location: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
  },
  time: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.mono,
  },
});