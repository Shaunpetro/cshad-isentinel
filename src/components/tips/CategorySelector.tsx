// src/components/tips/CategorySelector.tsx
/**
 * Incident category picker with modal selection
 * Supports light/dark theme
 */

import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing, BorderRadius } from "@/config/theme";
import { TIP_CATEGORIES, getCategoryById } from "@/config/tipCategories";
import type { TipCategory } from "@/types";

interface CategorySelectorProps {
  value: TipCategory | null;
  onChange: (category: TipCategory) => void;
  error?: string;
}

export function CategorySelector({
  value,
  onChange,
  error,
}: CategorySelectorProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedCategory = value ? getCategoryById(value) : null;

  const handleSelect = (categoryId: TipCategory) => {
    onChange(categoryId);
    setModalVisible(false);
  };

  // Get translated category label
  const getCategoryLabel = (categoryId: string): string => {
    const key = `tip.categories.${categoryId}`;
    const translated = t(key);
    return translated !== key ? translated : categoryId;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t("tip.incidentType")} *
      </Text>

      {/* Selector Button */}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={({ pressed }) => [
          styles.selector,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
          },
          pressed && { opacity: 0.8 },
        ]}
      >
        {selectedCategory ? (
          <View style={styles.selectedWrap}>
            <Text style={styles.selectedIcon}>{selectedCategory.icon}</Text>
            <View style={styles.selectedText}>
              <Text style={[styles.selectedLabel, { color: colors.text }]}>
                {getCategoryLabel(selectedCategory.id)}
              </Text>
              <Text
                style={[styles.selectedGroup, { color: colors.textSecondary }]}
              >
                {selectedCategory.group}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
            {t("tip.selectIncidentType")}
          </Text>
        )}
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>▼</Text>
      </Pressable>

      {error && (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      )}

      {/* Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            {/* Header */}
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("tip.selectIncidentType")}
              </Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text
                  style={[styles.closeText, { color: colors.textSecondary }]}
                >
                  ✕
                </Text>
              </Pressable>
            </View>

            {/* Category List */}
            <ScrollView style={styles.modalScroll}>
              {TIP_CATEGORIES.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => handleSelect(category.id)}
                  style={({ pressed }) => [
                    styles.categoryItem,
                    { backgroundColor: colors.background },
                    value === category.id && {
                      backgroundColor: colors.primary + "30",
                      borderWidth: 1,
                      borderColor: colors.primary,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <View style={styles.categoryText}>
                    <Text
                      style={[styles.categoryLabel, { color: colors.text }]}
                    >
                      {getCategoryLabel(category.id)}
                    </Text>
                    <Text
                      style={[
                        styles.categoryDesc,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {category.description}
                    </Text>
                  </View>
                  {value === category.id && (
                    <Text style={[styles.checkmark, { color: colors.primary }]}>
                      ✓
                    </Text>
                  )}
                </Pressable>
              ))}
              {/* Bottom padding for scroll */}
              <View style={{ height: Spacing.xl }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  selector: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  selectedText: {
    flex: 1,
  },
  selectedLabel: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
  },
  selectedGroup: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
  },
  placeholder: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
  },
  chevron: {
    fontSize: Typography.sizes.caption,
    marginLeft: Spacing.sm,
  },
  error: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  closeText: {
    fontSize: Typography.sizes.heading,
  },
  modalScroll: {
    padding: Spacing.md,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  categoryIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
    width: 36,
    textAlign: "center",
  },
  categoryText: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
  },
  categoryDesc: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
  checkmark: {
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
    marginLeft: Spacing.sm,
  },
});