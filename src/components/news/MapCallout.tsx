// v1.263_001/src/components/news/MapCallout.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "@/config/theme";
import { SeverityBadge } from "./SeverityBadge";
import { timeAgo, truncate } from "@utils/formatters";
import type { NewsItem } from "@typeDefs/index";

interface Props {
  article: NewsItem;
}

export function MapCallout({ article }: Props) {
  return (
    <View style={styles.container}>
      {/* Top row */}
      <View style={styles.topRow}>
        <Text style={styles.category}>
          {article.category.toUpperCase()}
        </Text>
        <SeverityBadge severity={article.severity} />
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {article.title}
      </Text>

      {/* Summary */}
      <Text style={styles.summary} numberOfLines={2}>
        {truncate(article.summary, 100)}
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        {article.locationName && (
          <Text style={styles.location} numberOfLines={1}>
            📍 {article.locationName}
          </Text>
        )}
        <Text style={styles.time}>{timeAgo(article.publishedAt)}</Text>
      </View>

      {/* Tap hint */}
      <Text style={styles.hint}>Tap for full story →</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.carbon.charcoal,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: 260,
    ...Shadows.md,
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
    color: Colors.semantic.primary,
    letterSpacing: 1,
  },
  title: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
    color: Colors.carbon.white,
    lineHeight: Typography.sizes.caption * Typography.lineHeight.tight,
    marginBottom: Spacing.xs,
  },
  summary: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
    color: Colors.carbon.silver,
    lineHeight: Typography.sizes.label * Typography.lineHeight.normal,
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
    color: Colors.carbon.silver,
    flex: 1,
  },
  time: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.mono,
    color: Colors.carbon.steel,
  },
  hint: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.medium,
    color: Colors.semantic.primary,
    textAlign: "right",
    marginTop: Spacing.xs,
  },
});