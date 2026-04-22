// src/components/news/LocationPermissionModal.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing } from "@/config/theme";

interface LocationPermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onRequestPermission: () => void;
  permissionDenied?: boolean;
}

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

function Step({ number, title, description, icon }: StepProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.step}>
      <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <Ionicons name={icon} size={20} color={colors.primary} />
          <Text style={[styles.stepTitle, { color: colors.text }]}>{title}</Text>
        </View>
        <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

export function LocationPermissionModal({
  visible,
  onClose,
  onRequestPermission,
  permissionDenied = false,
}: LocationPermissionModalProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const openSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  const handleAction = () => {
    if (permissionDenied) {
      openSettings();
    } else {
      onRequestPermission();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons name="location" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {t("location.currentLocation")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t("alerts.loadshedding.willNotify")}
            </Text>
          </View>

          {/* Benefits */}
          <View
            style={[
              styles.benefitsContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.benefit}>
              <Ionicons
                name="newspaper-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                {t("news.local")} {t("news.articles")}
              </Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                {t("alerts.title")}
              </Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="map-outline" size={20} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                {t("map.subtitle")}
              </Text>
            </View>
          </View>

          {/* Steps (shown when permission denied) */}
          {permissionDenied && (
            <ScrollView style={styles.stepsContainer}>
              <Text style={[styles.stepsTitle, { color: colors.text }]}>
                {t("settings.title")}:
              </Text>

              <Step
                number={1}
                icon="settings-outline"
                title={t("settings.title")}
                description={t("common.ok")}
              />

              <Step
                number={2}
                icon="apps-outline"
                title="iSentinel"
                description={t("common.search")}
              />

              <Step
                number={3}
                icon="location-outline"
                title={t("location.currentLocation")}
                description={t("privacy.granted")}
              />

              <Step
                number={4}
                icon="arrow-back-outline"
                title={t("common.done")}
                description={t("common.ok")}
              />
            </ScrollView>
          )}

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <Ionicons name="shield-checkmark" size={16} color={colors.success} />
            <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
              {t("tip.privacyNote")}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: colors.textSecondary },
                ]}
              >
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleAction}
            >
              <Ionicons
                name={permissionDenied ? "settings-outline" : "location"}
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.primaryButtonText}>
                {permissionDenied ? t("settings.title") : t("common.ok")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl + 20,
    maxHeight: "90%",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.title,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    textAlign: "center",
  },
  benefitsContainer: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  benefit: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  benefitText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
  },
  stepsContainer: {
    paddingHorizontal: Spacing.lg,
    maxHeight: 250,
  },
  stepsTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.md,
  },
  step: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.bold,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  stepDescription: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
    lineHeight: 18,
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  privacyText: {
    flex: 1,
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
    lineHeight: 16,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  primaryButton: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
});