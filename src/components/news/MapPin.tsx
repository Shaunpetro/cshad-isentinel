// src/components/news/MapPin.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { BorderRadius } from "@/config/theme";
import { getSeverityColor, getCategoryIcon } from "@/utils/mapHelpers";
import type { NewsSeverity, NewsCategory, TipCategory } from "@/types";

interface Props {
  severity: NewsSeverity;
  category: NewsCategory | TipCategory;
  isSelected?: boolean;
}

export function MapPinMarker({ severity, category, isSelected }: Props) {
  const { colors } = useTheme();
  const color = getSeverityColor(severity);
  const icon = getCategoryIcon(category);

  return (
    <View style={[styles.container, isSelected && styles.selected]}>
      <View
        style={[
          styles.pin,
          { backgroundColor: color, borderColor: colors.background },
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={[styles.arrow, { borderTopColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  selected: {
    transform: [{ scale: 1.2 }],
  },
  pin: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  icon: {
    fontSize: 16,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -2,
  },
});