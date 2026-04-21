// v1.263_001/src/components/tips/SubmitButton.tsx
/**
 * Submit button with loading state and success feedback
 */

import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "@/config/theme";

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
  label = "Submit Tip Anonymously",
}: SubmitButtonProps) {
  const disabled = isLoading || isDisabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={Colors.carbon.black} />
      ) : (
        <Text style={styles.icon}>🛡️</Text>
      )}
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {isLoading ? "Submitting..." : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.semantic.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  buttonPressed: {
    backgroundColor: Colors.semantic.primary + "CC",
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    backgroundColor: Colors.carbon.steel,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    color: Colors.carbon.black,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  labelDisabled: {
    color: Colors.carbon.silver,
  },
});