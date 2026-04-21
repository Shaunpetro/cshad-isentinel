// src/components/news/VerifiedBadge.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "@/config/theme";

interface VerifiedBadgeProps {
  isVerified: boolean;
  showLabel?: boolean;
  size?: "small" | "medium";
}

export function VerifiedBadge({
  isVerified,
  showLabel = false,
  size = "small",
}: VerifiedBadgeProps) {
  const isSmall = size === "small";
  const iconSize = isSmall ? 12 : 16;

  if (isVerified) {
    return (
      <View style={[styles.container, styles.verified]}>
        <Ionicons
          name="checkmark-circle"
          size={iconSize}
          color={Colors.semantic.success}
        />
        {showLabel && (
          <Text style={[styles.label, styles.verifiedText, { fontSize: isSmall ? 10 : 12 }]}>
            Verified
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.unverified]}>
      <Ionicons
        name="help-circle"
        size={iconSize}
        color={Colors.carbon.silver}
      />
      {showLabel && (
        <Text style={[styles.label, styles.unverifiedText, { fontSize: isSmall ? 10 : 12 }]}>
          Unverified
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  verified: {
    backgroundColor: `${Colors.semantic.success}20`,
  },
  unverified: {
    backgroundColor: `${Colors.carbon.steel}40`,
  },
  label: {
    fontFamily: Typography.fonts.medium,
  },
  verifiedText: {
    color: Colors.semantic.success,
  },
  unverifiedText: {
    color: Colors.carbon.silver,
  },
});