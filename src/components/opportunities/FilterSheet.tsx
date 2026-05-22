// src/components/opportunities/FilterSheet.tsx
import React from 'react';
import { View, Text, Modal, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts';
import { Typography, Spacing, BorderRadius } from '@/config/theme';

interface FilterSheetProps {
  visible: boolean;
  provinces: string[];
  subcategories: string[];
  submissionTypes: string[];
  selectedProvince: string | null;
  selectedSubcategory: string | null;
  selectedSubmissionType: string | null;
  onSelectProvince: (value: string | null) => void;
  onSelectSubcategory: (value: string | null) => void;
  onSelectSubmissionType: (value: string | null) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}

export function FilterSheet({
  visible,
  provinces,
  subcategories,
  submissionTypes,
  selectedProvince,
  selectedSubcategory,
  selectedSubmissionType,
  onSelectProvince,
  onSelectSubcategory,
  onSelectSubmissionType,
  onApply,
  onClear,
  onClose,
}: FilterSheetProps) {
  const { colors } = useTheme();

  const renderChipGroup = (
    title: string,
    options: string[],
    selected: string | null,
    onSelect: (value: string | null) => void
  ) => (
    <View style={styles.filterSection}>
      <Text style={[styles.filterSectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.chipGrid}>
        {options.map((option) => {
          const isActive = selected === option;
          return (
            <Pressable
              key={option}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onSelect(isActive ? null : option)}
            >
              <Text style={[styles.chipText, { color: isActive ? '#FFFFFF' : colors.text }]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Filters</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            {provinces.length > 0 && renderChipGroup('Province', provinces, selectedProvince, onSelectProvince)}
            {subcategories.length > 0 && renderChipGroup('Category', subcategories, selectedSubcategory, onSelectSubcategory)}
            {submissionTypes.length > 0 && renderChipGroup('Submission Type', submissionTypes, selectedSubmissionType, onSelectSubmissionType)}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.divider }]}>
            <Pressable
              style={[styles.clearButton, { borderColor: colors.border }]}
              onPress={onClear}
            >
              <Text style={[styles.clearButtonText, { color: colors.text }]}>Clear All</Text>
            </Pressable>
            <Pressable
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={onApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Typography.sizes.title,
    fontFamily: 'DMSans-Bold',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterSectionTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Bold',
    marginBottom: Spacing.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: Typography.sizes.label,
    fontFamily: 'DMSans-Medium',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Medium',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
  },
});