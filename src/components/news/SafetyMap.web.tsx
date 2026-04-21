// v1.263_001/src/components/news/SafetyMap.web.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Typography, Spacing } from "@/config/theme";
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
  useEffect(() => {
    // Trigger map ready after mount
    onMapReady();
  }, [onMapReady]);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🗺️</Text>
      <Text style={styles.title}>Map View</Text>
      <Text style={styles.message}>
        Interactive map is available on mobile devices.
      </Text>
      <Text style={styles.count}>
        {articles.length} incidents tracked
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.carbon.charcoal,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.sm,
  },
  message: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  count: {
    color: Colors.semantic.primary,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.mono,
  },
});
