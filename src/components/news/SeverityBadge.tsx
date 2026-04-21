// v1.263_001/src/components/news/SeverityBadge.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Typography, Spacing, BorderRadius } from "@/config/theme";
import type { NewsSeverity } from "@typeDefs/index";

const SEVERITY_CONFIG: Record<
  NewsSeverity,
  { label: string; color: string; bg: string }
> = {
  low: {
    label: "Low",
    color: Colors.semantic.success,
    bg: Colors.semantic.success + "20",
  },
  medium: {
    label: "Medium",
    color: Colors.semantic.warning,
    bg: Colors.semantic.warning + "20",
  },
  high: {
    label: "High",
    color: Colors.semantic.danger,
    bg: Colors.semantic.danger + "20",
  },
  critical: {
    label: "Critical",
    color: Colors.semantic.danger,
    bg: Colors.semantic.danger + "35",
  },
};

interface Props {
  severity: NewsSeverity;
}

export function SeverityBadge({ severity }: Props) {
  const config = SEVERITY_CONFIG[severity];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  text: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.mono,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});