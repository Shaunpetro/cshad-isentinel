// src/components/tips/SubmitButton.tsx
/**
 * Submit button with loading state and success feedback
 * Supports light/dark theme
 */

import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing, BorderRadius } from "@/config/theme";

interface SubmitButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  label?: string;
}

export function SubmitButton({
  onPress,
  isLoading = false,
  isDisabled = false,
  label,
}: SubmitButtonProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const disabled = isLoading || isDisabled;

  const buttonLabel = label || t("tip.submitTip");

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled ? colors.border : colors.primary,
        },
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#000000" />
      ) : (
        <Text style={styles.icon}>🛡️</Text>
      )}
      <Text
        style={[
          styles.label,
          {
            color: disabled ? colors.textSecondary : "#000000",
          },
        ]}
      >
        {isLoading ? t("tip.submitting") : buttonLabel}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});