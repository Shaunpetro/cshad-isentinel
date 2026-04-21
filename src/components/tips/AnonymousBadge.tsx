// v1.263_001/src/components/tips/AnonymousBadge.tsx
/**
 * Privacy badge showing users their tip is anonymous
 * Builds trust and encourages reporting (Rule 1)
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Typography, Spacing, BorderRadius } from "@/config/theme";

interface AnonymousBadgeProps {
  variant?: "large" | "compact";
}

export function AnonymousBadge({ variant = "large" }: AnonymousBadgeProps) {
  const isLarge = variant === "large";

  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      {/* Main Badge */}
      <View style={[styles.badge, isLarge && styles.badgeLarge]}>
        <Text style={styles.icon}>🔒</Text>
        <View style={styles.textWrap}>
          <Text style={[styles.title, isLarge && styles.titleLarge]}>
            100% Anonymous
          </Text>
          {isLarge && (
            <Text style={styles.subtitle}>
              Your identity is never collected or stored
            </Text>
          )}
        </View>
      </View>

      {/* Feature List (large variant only) */}
      {isLarge && (
        <View style={styles.features}>
          <FeatureItem text="No account required" />
          <FeatureItem text="No IP address logging" />
          <FeatureItem text="Location rounded for privacy" />
          <FeatureItem text="Photo metadata removed" />
        </View>
      )}
    </View>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.checkmark}>✓</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  containerLarge: {
    marginBottom: Spacing.lg,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.special.anonymous + "20",
    borderWidth: 1,
    borderColor: Colors.special.anonymous,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  badgeLarge: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  icon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: Colors.special.anonymous,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  titleLarge: {
    fontSize: Typography.sizes.heading,
  },
  subtitle: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
  features: {
    marginTop: Spacing.md,
    paddingLeft: Spacing.sm,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  checkmark: {
    color: Colors.semantic.success,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginRight: Spacing.sm,
    width: 20,
  },
  featureText: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
  },
});