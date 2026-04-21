// v1.263_001/src/components/news/MapLegend.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "@/config/theme";

const SEVERITY_ITEMS = [
  { label: "Critical", color: Colors.severity.critical },
  { label: "High", color: Colors.severity.high },
  { label: "Medium", color: Colors.severity.medium },
  { label: "Low", color: Colors.severity.low },
];

export function MapLegend() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Severity</Text>
      <View style={styles.items}>
        {SEVERITY_ITEMS.map((item) => (
          <View key={item.label} style={styles.item}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.label}>{item.label}</Text>
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
    backgroundColor: Colors.carbon.charcoal + "E6",
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    ...Shadows.sm,
  },
  title: {
    color: Colors.carbon.white,
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
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
});
