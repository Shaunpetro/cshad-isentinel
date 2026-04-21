// src/components/settings/OptionPickerModal.tsx
/**
 * iOS-style option picker modal
 * Shows a list of options with checkmark on selected
 */

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
import { Colors, Typography, Spacing } from '@/config/theme';

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
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={28} color={Colors.carbon.silver} />
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
                  pressed && styles.optionPressed,
                  index < options.length - 1 && styles.optionBorder,
                ]}
                onPress={() => handleSelect(option.value)}
              >
                {option.icon && (
                  <View style={styles.optionIcon}>
                    <Ionicons 
                      name={option.icon} 
                      size={22} 
                      color={isSelected ? Colors.semantic.primary : Colors.carbon.silver} 
                    />
                  </View>
                )}
                
                <View style={styles.optionText}>
                  <Text style={[
                    styles.optionLabel,
                    isSelected && styles.optionLabelSelected,
                  ]}>
                    {option.label}
                  </Text>
                  {option.subtitle && (
                    <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                  )}
                </View>
                
                {isSelected && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={24} 
                    color={Colors.semantic.primary} 
                  />
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
  container: {
    flex: 1,
    backgroundColor: Colors.carbon.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.carbon.charcoal,
  },
  headerSpacer: {
    width: 28,
  },
  title: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.carbon.charcoal,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 60,
  },
  optionPressed: {
    backgroundColor: Colors.carbon.steel,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.carbon.steel,
  },
  optionIcon: {
    width: 36,
    marginRight: Spacing.sm,
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
  },
  optionLabelSelected: {
    color: Colors.semantic.primary,
  },
  optionSubtitle: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
});