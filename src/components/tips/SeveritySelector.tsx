// v1.263_001/src/components/tips/SeveritySelector.tsx
/**
 * Severity level picker with visual indicators
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Colors, Typography, Spacing, BorderRadius } from "@/config/theme";
import { SEVERITIES, getSeverityById } from "@/config/tipCategories";
import type { NewsSeverity } from "@/types";

interface SeveritySelectorProps {
  value: NewsSeverity | null;
  onChange: (severity: NewsSeverity) => void;
  error?: string;
}

export function SeveritySelector({ value, onChange, error }: SeveritySelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Severity Level *</Text>
      
      <View style={styles.grid}>
        {SEVERITIES.map((severity) => {
          const isSelected = value === severity.id;
          
          return (
            <Pressable
              key={severity.id}
              onPress={() => onChange(severity.id)}
              style={({ pressed }) => [
                styles.option,
                isSelected && {
                  borderColor: severity.color,
                  backgroundColor: severity.color + "20",
                },
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={styles.optionIcon}>{severity.icon}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && { color: severity.color },
                ]}
              >
                {severity.label}
              </Text>
              {isSelected && (
                <Text style={styles.optionDesc}>{severity.description}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  option: {
    width: "48%",
    backgroundColor: Colors.carbon.charcoal,
    borderWidth: 2,
    borderColor: Colors.carbon.steel,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  optionPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  optionIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  optionLabel: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    textAlign: "center",
  },
  optionDesc: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  error: {
    color: Colors.semantic.danger,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.sm,
  },
});