// v1.263_001/src/components/tips/CategorySelector.tsx
/**
 * Incident category picker with modal selection
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
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "@/config/theme";
import { TIP_CATEGORIES, getCategoryById } from "@/config/tipCategories";
import type { TipCategory } from "@/types";

interface CategorySelectorProps {
  value: TipCategory | null;
  onChange: (category: TipCategory) => void;
  error?: string;
}

export function CategorySelector({ value, onChange, error }: CategorySelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  
  const selectedCategory = value ? getCategoryById(value) : null;

  const handleSelect = (categoryId: TipCategory) => {
    onChange(categoryId);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Incident Type *</Text>

      {/* Selector Button */}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={({ pressed }) => [
          styles.selector,
          error && styles.selectorError,
          pressed && styles.selectorPressed,
        ]}
      >
        {selectedCategory ? (
          <View style={styles.selectedWrap}>
            <Text style={styles.selectedIcon}>{selectedCategory.icon}</Text>
            <View style={styles.selectedText}>
              <Text style={styles.selectedLabel}>{selectedCategory.label}</Text>
              <Text style={styles.selectedGroup}>{selectedCategory.group}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.placeholder}>Select incident type...</Text>
        )}
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Incident Type</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>✕</Text>
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
                    value === category.id && styles.categoryItemSelected,
                    pressed && styles.categoryItemPressed,
                  ]}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <View style={styles.categoryText}>
                    <Text style={styles.categoryLabel}>{category.label}</Text>
                    <Text style={styles.categoryDesc}>{category.description}</Text>
                  </View>
                  {value === category.id && (
                    <Text style={styles.checkmark}>✓</Text>
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
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.sm,
  },
  selector: {
    backgroundColor: Colors.carbon.charcoal,
    borderWidth: 1,
    borderColor: Colors.carbon.steel,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorError: {
    borderColor: Colors.semantic.danger,
  },
  selectorPressed: {
    backgroundColor: Colors.carbon.steel,
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
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
  },
  selectedGroup: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
  },
  placeholder: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
  },
  chevron: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.caption,
    marginLeft: Spacing.sm,
  },
  error: {
    color: Colors.semantic.danger,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.sm,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay.heavy,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.carbon.charcoal,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "80%",
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.carbon.steel,
  },
  modalTitle: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  closeText: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.heading,
  },
  modalScroll: {
    padding: Spacing.md,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.carbon.steel,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  categoryItemSelected: {
    backgroundColor: Colors.semantic.primary + "30",
    borderWidth: 1,
    borderColor: Colors.semantic.primary,
  },
  categoryItemPressed: {
    opacity: 0.8,
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
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
  },
  categoryDesc: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
  checkmark: {
    color: Colors.semantic.primary,
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
    marginLeft: Spacing.sm,
  },
});