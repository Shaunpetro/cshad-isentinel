// src/components/news/MapLegend.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing, BorderRadius } from "@/config/theme";

export function MapLegend() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const SEVERITY_ITEMS = [
    { labelKey: "news.severity.critical", color: colors.danger },
    { labelKey: "news.severity.high", color: colors.warning },
    { labelKey: "news.severity.medium", color: colors.info },
    { labelKey: "news.severity.low", color: colors.success },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface + "E6" },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t("map.filters")}
      </Text>
      <View style={styles.items}>
        {SEVERITY_ITEMS.map((item) => (
          <View key={item.labelKey} style={styles.item}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t(item.labelKey)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 12,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  items: {
    gap: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
});