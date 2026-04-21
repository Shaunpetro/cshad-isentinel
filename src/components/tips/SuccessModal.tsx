// src/components/tips/SuccessModal.tsx
/**
 * Modern success modal for tip submission
 * Matches the app's dark theme with semantic colors
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
import { Colors, Typography, Spacing } from "@/config/theme";

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  tipId?: string;
}

const { width } = Dimensions.get("window");

// Use semantic primary color (#00D4AA)
const ACCENT_COLOR = Colors.semantic.primary;
const ACCENT_DARK = "#00B894";

export function SuccessModal({ visible, onClose, tipId }: SuccessModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

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
            <View style={styles.iconGlow} />
            <Animated.View
              style={[
                styles.iconCircle,
                {
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
              <Ionicons name="shield-checkmark" size={48} color={Colors.carbon.white} />
            </Animated.View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Tip Submitted!</Text>

          {/* Message */}
          <Text style={styles.message}>
            Thank you for helping keep your community safe.
          </Text>

          {/* Anonymous Badge */}
          <View style={styles.anonymousBadge}>
            <Ionicons name="eye-off" size={16} color={ACCENT_COLOR} />
            <Text style={styles.anonymousText}>
              Your identity remains completely anonymous
            </Text>
          </View>

          {/* Tip Reference (optional display) */}
          {tipId && (
            <View style={styles.referenceContainer}>
              <Text style={styles.referenceLabel}>Reference</Text>
              <Text style={styles.referenceId}>{tipId.substring(0, 8)}...</Text>
            </View>
          )}

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>

          {/* Decorative Elements */}
          <View style={styles.decorTop} />
          <View style={styles.decorBottom} />
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
    backgroundColor: Colors.carbon.charcoal,
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: ACCENT_DARK,
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
    backgroundColor: ACCENT_COLOR,
    opacity: 0.15,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: ACCENT_COLOR,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: ACCENT_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
    color: Colors.carbon.white,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    color: Colors.carbon.silver,
    textAlign: "center",
    lineHeight: Typography.sizes.body * 1.5,
    marginBottom: Spacing.lg,
  },
  anonymousBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 212, 170, 0.1)",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  anonymousText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
    color: ACCENT_COLOR,
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
    color: Colors.carbon.silver,
  },
  referenceId: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.mono,
    color: Colors.carbon.steel,
  },
  closeButton: {
    width: "100%",
    backgroundColor: ACCENT_COLOR,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: ACCENT_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButtonText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    color: Colors.carbon.white,
  },
  decorTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: ACCENT_COLOR,
  },
  decorBottom: {
    position: "absolute",
    bottom: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: ACCENT_COLOR,
    opacity: 0.03,
  },
});