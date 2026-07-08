// src/components/location/RadiusPickerModal.tsx
// Beta 4 – compact radius picker modal (matches city picker style)

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts';
import { Typography, Spacing } from '@/config/theme';

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

interface Props {
  visible: boolean;
  selected: number;
  onSelect: (radius: number) => void;
  onClose: () => void;
}

export default function RadiusPickerModal({ visible, selected, onSelect, onClose }: Props) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.title, { color: colors.text }]}>Search Radius</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {RADIUS_OPTIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.option, { borderBottomColor: colors.divider }]}
              onPress={() => { onSelect(r); onClose(); }}
            >
              <Ionicons
                name="radio-outline"
                size={20}
                color={r === selected ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.optionText,
                  { color: r === selected ? colors.primary : colors.text },
                ]}
              >
                {r} km
              </Text>
              {r === selected && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  closeBtn: { padding: 4 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    flex: 1,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
  },
});