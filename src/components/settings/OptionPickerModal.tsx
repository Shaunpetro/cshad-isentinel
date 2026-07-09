// src/components/settings/OptionPickerModal.tsx
// Beta 4 – iOS-style option picker modal with proper right margin for close button

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts';
import { Typography, Spacing } from '@/config/theme';

export interface PickerOption<T> {
  value: T;
  label: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface OptionPickerModalProps<T> {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: PickerOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

export function OptionPickerModal<T>({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}: OptionPickerModalProps<T>) {
  const { colors } = useTheme();

  const handleSelect = (value: T) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.divider }]}>
          <View style={styles.headerSpacer} />
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Options List */}
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {options.map((option, index) => {
            const isSelected = option.value === selectedValue;

            return (
              <Pressable
                key={String(option.value)}
                style={({ pressed }) => [
                  styles.option,
                  { backgroundColor: colors.surface, borderBottomColor: colors.divider },
                  pressed && { backgroundColor: colors.border },
                  index < options.length - 1 && styles.optionBorder,
                ]}
                onPress={() => handleSelect(option.value)}
              >
                {option.icon && (
                  <View style={styles.optionIcon}>
                    <Ionicons
                      name={option.icon}
                      size={22}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                  </View>
                )}

                <View style={styles.optionText}>
                  <Text style={[
                    styles.optionLabel,
                    { color: isSelected ? colors.primary : colors.text },
                  ]}>
                    {option.label}
                  </Text>
                  {option.subtitle && (
                    <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                      {option.subtitle}
                    </Text>
                  )}
                </View>

                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerSpacer: { width: 28 },
  title: {
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
  },
  closeButton: { padding: Spacing.xs, marginRight: Spacing.md },
  list: { flex: 1 },
  listContent: { padding: Spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 60,
    borderBottomWidth: 1,
  },
  optionIcon: {
    width: 36,
    marginRight: Spacing.sm,
    alignItems: 'center',
  },
  optionText: { flex: 1 },
  optionLabel: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
  },
  optionSubtitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
  optionBorder: {},
});