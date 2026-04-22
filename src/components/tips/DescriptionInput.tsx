// src/components/tips/DescriptionInput.tsx
/**
 * Multi-line text input with character counter and PII warnings
 * Supports light/dark theme
 */

import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing, BorderRadius } from "@/config/theme";
import { checkForPII } from "@/services/tips";
import { LIMITS } from "@/config/constants";

interface DescriptionInputProps {
  value: string;
  onChange: (text: string) => void;
  error?: string;
}

export function DescriptionInput({
  value,
  onChange,
  error,
}: DescriptionInputProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [piiWarnings, setPiiWarnings] = useState<string[]>([]);

  const charCount = value.length;
  const minChars = LIMITS.tip.minLength;
  const maxChars = LIMITS.tip.maxLength;
  const isUnderMin = charCount > 0 && charCount < minChars;
  const isOverMax = charCount > maxChars;

  // Check for PII when user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.length > 10) {
        const warnings = checkForPII(value);
        setPiiWarnings(warnings);
      } else {
        setPiiWarnings([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t("tip.placeholder").split(".")[0]} *
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error
              ? colors.danger
              : isFocused
                ? colors.primary
                : colors.border,
            color: colors.text,
          },
        ]}
        value={value}
        onChangeText={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={t("tip.placeholder")}
        placeholderTextColor={colors.textSecondary}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        maxLength={maxChars + 100} // Allow slight overage for warning
      />

      {/* Character Counter */}
      <View style={styles.footer}>
        <Text
          style={[
            styles.charCount,
            { color: colors.textSecondary },
            isUnderMin && { color: colors.warning },
            isOverMax && { color: colors.danger },
          ]}
        >
          {charCount} / {maxChars}
          {isUnderMin && ` (min ${minChars})`}
        </Text>
      </View>

      {/* PII Warnings */}
      {piiWarnings.length > 0 && (
        <View
          style={[
            styles.warningsBox,
            {
              backgroundColor: colors.warning + "20",
              borderColor: colors.warning,
            },
          ]}
        >
          <Text style={[styles.warningTitle, { color: colors.warning }]}>
            ⚠️ {t("privacy.title")}
          </Text>
          {piiWarnings.map((warning, index) => (
            <Text key={index} style={[styles.warningText, { color: colors.text }]}>
              • {warning}
            </Text>
          ))}
          <Text style={[styles.warningHint, { color: colors.textSecondary }]}>
            Consider removing this information to stay anonymous.
          </Text>
        </View>
      )}

      {error && (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    minHeight: 150,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: Spacing.xs,
  },
  charCount: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.mono,
  },
  warningsBox: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  warningTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.xs,
  },
  warningText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginLeft: Spacing.sm,
    marginBottom: 2,
  },
  warningHint: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    fontStyle: "italic",
    marginTop: Spacing.xs,
  },
  error: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.sm,
  },
});