// src/components/news/SafetyMap.web.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing } from "@/config/theme";
import type { NewsItem } from "@/types";

interface Props {
  articles: NewsItem[];
  selectedId: string | null;
  onMarkerPress: (article: NewsItem) => void;
  onCalloutPress: (article: NewsItem) => void;
  onMapPress: () => void;
  onMapReady: () => void;
  mapRef: React.RefObject<any>;
}

export function SafetyMapWeb({ articles, onMapReady }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  useEffect(() => {
    // Trigger map ready after mount
    onMapReady();
  }, [onMapReady]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={styles.icon}>🗺️</Text>
      <Text style={[styles.title, { color: colors.text }]}>
        {t("map.title")}
      </Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {t("map.zoomIn")}
      </Text>
      <Text style={[styles.count, { color: colors.primary }]}>
        {articles.length} {t("map.markers")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  count: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.mono,
  },
});