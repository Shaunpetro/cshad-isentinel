// v1.263_001/src/components/tips/DescriptionInput.tsx
/**
 * Multi-line text input with character counter and PII warnings
 */

import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Colors, Typography, Spacing, BorderRadius } from "@/config/theme";
import { checkForPII } from "@/services/tips";
import { LIMITS } from "@/config/constants";

interface DescriptionInputProps {
  value: string;
  onChange: (text: string) => void;
  error?: string;
}

export function DescriptionInput({ value, onChange, error }: DescriptionInputProps) {
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
      <Text style={styles.label}>Description *</Text>
      
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Describe what you observed. Be specific but avoid including personal information..."
        placeholderTextColor={Colors.carbon.silver}
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
            isUnderMin && styles.charCountWarning,
            isOverMax && styles.charCountError,
          ]}
        >
          {charCount} / {maxChars}
          {isUnderMin && ` (min ${minChars})`}
        </Text>
      </View>
      
      {/* PII Warnings */}
      {piiWarnings.length > 0 && (
        <View style={styles.warningsBox}>
          <Text style={styles.warningTitle}>⚠️ Privacy Notice</Text>
          {piiWarnings.map((warning, index) => (
            <Text key={index} style={styles.warningText}>
              • {warning}
            </Text>
          ))}
          <Text style={styles.warningHint}>
            Consider removing this information to stay anonymous.
          </Text>
        </View>
      )}
      
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
  input: {
    backgroundColor: Colors.carbon.charcoal,
    borderWidth: 1,
    borderColor: Colors.carbon.steel,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    minHeight: 150,
  },
  inputFocused: {
    borderColor: Colors.semantic.primary,
  },
  inputError: {
    borderColor: Colors.semantic.danger,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: Spacing.xs,
  },
  charCount: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.mono,
  },
  charCountWarning: {
    color: Colors.semantic.warning,
  },
  charCountError: {
    color: Colors.semantic.danger,
  },
  warningsBox: {
    backgroundColor: Colors.semantic.warning + "20",
    borderWidth: 1,
    borderColor: Colors.semantic.warning,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  warningTitle: {
    color: Colors.semantic.warning,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.xs,
  },
  warningText: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginLeft: Spacing.sm,
    marginBottom: 2,
  },
  warningHint: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    fontStyle: "italic",
    marginTop: Spacing.xs,
  },
  error: {
    color: Colors.semantic.danger,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.sm,
  },
});