// app/(tabs)/tip.tsx
/**
 * Anonymous Tip Submission Screen
 * Core feature of PSHAD Sentinel (Rule 1: Privacy First)
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Typography, Spacing } from "@/config/theme";
import {
  AnonymousBadge,
  CategorySelector,
  SeveritySelector,
  DescriptionInput,
  LocationPicker,
  SubmitButton,
  SuccessModal,
} from "@/components/tips";
import { submitTip, validateTip, EMPTY_TIP_DRAFT, type TipDraft } from "@/services/tips";
import type { TipCategory, NewsSeverity, GeoPoint } from "@/types";

export default function TipScreen() {
  // Form state
  const [draft, setDraft] = useState<TipDraft>(EMPTY_TIP_DRAFT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedTipId, setSubmittedTipId] = useState<string | undefined>();

  // Form handlers
  const handleCategoryChange = useCallback((category: TipCategory) => {
    setDraft((prev) => ({ ...prev, category }));
    setErrors((prev) => ({ ...prev, category: "" }));
  }, []);

  const handleSeverityChange = useCallback((severity: NewsSeverity) => {
    setDraft((prev) => ({ ...prev, severity }));
    setErrors((prev) => ({ ...prev, severity: "" }));
  }, []);

  const handleDescriptionChange = useCallback((description: string) => {
    setDraft((prev) => ({ ...prev, description }));
    setErrors((prev) => ({ ...prev, description: "" }));
  }, []);

  const handleLocationChange = useCallback((location: GeoPoint | null, locationName: string) => {
    setDraft((prev) => ({ ...prev, location, locationName }));
  }, []);

  // Handle success modal close
  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    setSubmittedTipId(undefined);
    setDraft(EMPTY_TIP_DRAFT);
  }, []);

  // Form submission
  const handleSubmit = useCallback(async () => {
    // Validate
    const validation = validateTip(
      draft.description,
      draft.category,
      draft.severity,
      draft.location
    );

    if (!validation.isValid) {
      // Map errors to fields
      const newErrors: Record<string, string> = {};
      validation.errors.forEach((err) => {
        if (err.toLowerCase().includes("incident type")) {
          newErrors.category = err;
        } else if (err.toLowerCase().includes("severity")) {
          newErrors.severity = err;
        } else if (err.toLowerCase().includes("description")) {
          newErrors.description = err;
        }
      });
      setErrors(newErrors);
      return;
    }

    // Show PII warnings if any
    if (validation.warnings.length > 0) {
      const shouldContinue = await new Promise<boolean>((resolve) => {
        Alert.alert(
          "Privacy Notice",
          `${validation.warnings.join("\n")}\n\nDo you want to continue anyway?`,
          [
            { text: "Edit", onPress: () => resolve(false), style: "cancel" },
            { text: "Submit Anyway", onPress: () => resolve(true) },
          ]
        );
      });

      if (!shouldContinue) return;
    }

    // Submit
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await submitTip(draft);

      if (result.success) {
        // Show custom success modal
        setSubmittedTipId(result.tipId);
        setShowSuccessModal(true);
      } else {
        Alert.alert("Submission Failed", result.error || "Please try again.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [draft]);

  // Check if form has minimum required data
  const canSubmit = draft.category && draft.severity && draft.description.length >= 20;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Report Incident</Text>
            <Text style={styles.subtitle}>
              Help keep your community safe
            </Text>
          </View>

          {/* Anonymous Badge */}
          <AnonymousBadge variant="large" />

          {/* Category Selector */}
          <CategorySelector
            value={draft.category}
            onChange={handleCategoryChange}
            error={errors.category}
          />

          {/* Severity Selector */}
          <SeveritySelector
            value={draft.severity}
            onChange={handleSeverityChange}
            error={errors.severity}
          />

          {/* Description Input */}
          <DescriptionInput
            value={draft.description}
            onChange={handleDescriptionChange}
            error={errors.description}
          />

          {/* Location Picker */}
          <LocationPicker
            value={draft.location}
            locationName={draft.locationName}
            onChange={handleLocationChange}
            error={errors.location}
          />

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <SubmitButton
              onPress={handleSubmit}
              isLoading={isSubmitting}
              isDisabled={!canSubmit}
            />
            
            <Text style={styles.disclaimer}>
              By submitting, you confirm this report is truthful to the best of your knowledge.
              False reports may be removed.
            </Text>
          </View>

          {/* Bottom padding for scroll */}
          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        tipId={submittedTipId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.carbon.black,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.title,
    fontFamily: Typography.fonts.bold,
  },
  subtitle: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.xs,
  },
  submitSection: {
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  disclaimer: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    textAlign: "center",
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    lineHeight: Typography.sizes.caption * 1.5,
  },
});