// src/components/news/NewsCard.tsx
// Beta 4 – News card with red "Breaking News" fallback

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing, BorderRadius, Shadows } from "@/config/theme";
import { SeverityBadge } from "./SeverityBadge";
import { SourceBadge } from "./SourceBadge";
import { VerifiedBadge } from "./VerifiedBadge";
import { stripHtml, truncate, extractFirstImage } from "@/utils/formatters";
import type { NewsItem } from "@/types";

interface Props {
  article: NewsItem;
  onPress: (article: NewsItem) => void;
}

export function NewsCard({ article, onPress }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const getCategoryLabel = (category: string): string => {
    const key = `news.categories.${category}`;
    const translated = t(key);
    return translated !== key ? translated.toUpperCase() : category.toUpperCase();
  };

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

  const cleanTitle = stripHtml(article.title);
  const cleanSummary = stripHtml(article.summary);

  // ---- media fallback chain ----
  const imageUrl =
    article.imageUrl ||
    extractFirstImage(article.body) ||
    extractFirstImage(article.summary) ||
    null;

  const logoSrc = require("../../../assets/brand/cshad-isentinel-logo-main.png");

  return (
    <Pressable
      onPress={() => onPress(article)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface },
        pressed && styles.cardPressed,
      ]}
    >
      {/* Image or designed fallback */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.fallbackContainer, { backgroundColor: colors.surface }]}>
          <Image source={logoSrc} style={styles.fallbackLogo} resizeMode="contain" />
          <Text style={styles.fallbackText}>Breaking News</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Category + Severity */}
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

        {/* Source + Verified */}
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

        {/* Location + Time */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            {article.locationName && (
              <Text style={[styles.location, { color: colors.textSecondary }]} numberOfLines={1}>
                📍 {article.locationName}
              </Text>
            )}
          </View>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
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
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardPressed: { opacity: 0.95 },
  image: {
    width: '100%',
    height: 180,
  },
  fallbackContainer: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  fallbackLogo: {
    width: 80,
    height: 53,
    opacity: 0.7,
  },
  fallbackText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#FF4757',   // red
  },
  content: {
    padding: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  category: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.mono,
    letterSpacing: 1,
  },
  title: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    lineHeight: Typography.sizes.body * 1.2,
    marginBottom: Spacing.sm,
  },
  summary: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    lineHeight: Typography.sizes.caption * 1.4,
    marginBottom: Spacing.sm,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: { flex: 1 },
  location: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
  time: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.mono,
  },
});