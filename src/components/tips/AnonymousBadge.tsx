// src/components/tips/AnonymousBadge.tsx
/**
 * Privacy badge showing users their tip is anonymous
 * Builds trust and encourages reporting (Rule 1)
 * Supports light/dark theme
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing, BorderRadius } from "@/config/theme";

interface AnonymousBadgeProps {
  variant?: "large" | "compact";
}

export function AnonymousBadge({ variant = "large" }: AnonymousBadgeProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isLarge = variant === "large";

  // Anonymous badge uses a teal/cyan color that works in both themes
  const anonymousColor = "#00BFA5";

  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      {/* Main Badge */}
      <View
        style={[
          styles.badge,
          isLarge && styles.badgeLarge,
          {
            backgroundColor: anonymousColor + "20",
            borderColor: anonymousColor,
          },
        ]}
      >
        <Text style={styles.icon}>🔒</Text>
        <View style={styles.textWrap}>
          <Text
            style={[
              styles.title,
              isLarge && styles.titleLarge,
              { color: anonymousColor },
            ]}
          >
            {t("tip.anonymousBadge.title")}
          </Text>
          {isLarge && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t("tip.anonymousBadge.subtitle")}
            </Text>
          )}
        </View>
      </View>

      {/* Feature List (large variant only) */}
      {isLarge && (
        <View style={styles.features}>
          <FeatureItem
            text={t("tip.anonymousBadge.noAccount")}
            colors={colors}
          />
          <FeatureItem
            text={t("tip.anonymousBadge.noIpLogging")}
            colors={colors}
          />
          <FeatureItem
            text={t("tip.anonymousBadge.locationRounded")}
            colors={colors}
          />
          <FeatureItem
            text={t("tip.anonymousBadge.metadataRemoved")}
            colors={colors}
          />
        </View>
      )}
    </View>
  );
}

interface FeatureItemProps {
  text: string;
  colors: ReturnType<typeof useTheme>["colors"];
}

function FeatureItem({ text, colors }: FeatureItemProps) {
  return (
    <View style={styles.featureRow}>
      <Text style={[styles.checkmark, { color: colors.success }]}>✓</Text>
      <Text style={[styles.featureText, { color: colors.textSecondary }]}>
        {text}
      </Text>
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
    borderWidth: 1,
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
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  titleLarge: {
    fontSize: Typography.sizes.heading,
  },
  subtitle: {
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
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginRight: Spacing.sm,
    width: 20,
  },
  featureText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
  },
});