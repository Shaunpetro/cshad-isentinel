// src/components/news/NewsCard.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
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
import { timeAgo, truncate } from "@/utils/formatters";
import type { NewsItem } from "@/types";

interface Props {
  article: NewsItem;
  onPress: (article: NewsItem) => void;
}

export function NewsCard({ article, onPress }: Props) {
  const { colors } = useTheme();

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
            {article.category.toUpperCase()}
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
          numberOfLines={3}
        >
          {truncate(article.summary, 150)}
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
            {timeAgo(article.publishedAt)}
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
    lineHeight: Typography.sizes.heading * Typography.lineHeight.tight,
    marginBottom: Spacing.sm,
  },
  summary: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    lineHeight: Typography.sizes.caption * Typography.lineHeight.normal,
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