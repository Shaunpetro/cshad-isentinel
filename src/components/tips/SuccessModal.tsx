// src/components/tips/SuccessModal.tsx
/**
 * Modern success modal for tip submission
 * Supports light/dark theme
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing } from "@/config/theme";

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  tipId?: string;
}

const { width } = Dimensions.get("window");

export function SuccessModal({ visible, onClose, tipId }: SuccessModalProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  // Use theme primary color for accent
  const accentColor = colors.primary;
  const accentDark = colors.primary + "CC";

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      checkmarkAnim.setValue(0);

      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(checkmarkAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.surface,
              borderColor: accentDark,
              transform: [
                { scale: scaleAnim },
                {
                  translateY: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Success Icon with Glow */}
          <View style={styles.iconContainer}>
            <View
              style={[styles.iconGlow, { backgroundColor: accentColor }]}
            />
            <Animated.View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: accentColor,
                  shadowColor: accentColor,
                  transform: [
                    {
                      scale: checkmarkAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.5, 1.2, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="shield-checkmark" size={48} color="#FFFFFF" />
            </Animated.View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {t("tip.success")}
          </Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {t("tip.successMessage")}
          </Text>

          {/* Anonymous Badge */}
          <View
            style={[
              styles.anonymousBadge,
              { backgroundColor: accentColor + "15" },
            ]}
          >
            <Ionicons name="eye-off" size={16} color={accentColor} />
            <Text style={[styles.anonymousText, { color: accentColor }]}>
              {t("tip.anonymous")}
            </Text>
          </View>

          {/* Tip Reference (optional display) */}
          {tipId && (
            <View style={styles.referenceContainer}>
              <Text
                style={[styles.referenceLabel, { color: colors.textSecondary }]}
              >
                Reference
              </Text>
              <Text style={[styles.referenceId, { color: colors.textDisabled }]}>
                {tipId.substring(0, 8)}...
              </Text>
            </View>
          )}

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: accentColor }]}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>{t("common.done")}</Text>
          </TouchableOpacity>

          {/* Decorative Elements */}
          <View style={[styles.decorTop, { backgroundColor: accentColor }]} />
          <View
            style={[styles.decorBottom, { backgroundColor: accentColor }]}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContainer: {
    width: width - Spacing.xl * 2,
    maxWidth: 340,
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  iconContainer: {
    marginBottom: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.15,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    textAlign: "center",
    lineHeight: Typography.sizes.body * 1.5,
    marginBottom: Spacing.lg,
  },
  anonymousBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  anonymousText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
  },
  referenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  referenceLabel: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
  },
  referenceId: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.mono,
  },
  closeButton: {
    width: "100%",
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButtonText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    color: "#FFFFFF",
  },
  decorTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  decorBottom: {
    position: "absolute",
    bottom: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.03,
  },
});