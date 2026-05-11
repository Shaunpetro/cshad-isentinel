// src/components/hub/HazardReportModal.tsx
import React, { useState } from 'react';
import {
  View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '@/config/theme';
import { supabase } from '@/services/supabase/config';

interface HazardReportModalProps {
  visible: boolean;
  onClose: () => void;
  onReported: () => void;
  currentLocation?: { latitude: number; longitude: number };
}

const CATEGORIES = [
  { key: 'pothole', label: 'Pothole', icon: 'alert-circle' },
  { key: 'burst_pipe', label: 'Burst Pipe', icon: 'water' },
  { key: 'power_line', label: 'Downed Power Line', icon: 'flash' },
  { key: 'road_closure', label: 'Road Closure', icon: 'close-circle' },
  { key: 'accident', label: 'Accident', icon: 'car' },
  { key: 'other', label: 'Other', icon: 'warning' },
];

export function HazardReportModal({ visible, onClose, onReported, currentLocation }: HazardReportModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [category, setCategory] = useState('pothole');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert(t('common.error'), 'Please describe the hazard.');
      return;
    }
    if (!currentLocation) {
      Alert.alert(t('common.error'), 'Location not available. Please enable location.');
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from('hazards').insert({
        category,
        description: description.trim(),
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        location_name: 'Current location',
      });
      if (error) throw error;
      Alert.alert('Thank you', 'Hazard reported successfully!');
      setDescription('');
      onReported();
      onClose();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || 'Failed to report hazard.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Report Hazard</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>CATEGORY</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryBtn, { backgroundColor: cat.key === category ? colors.primary : colors.background, borderColor: cat.key === category ? colors.primary : colors.border }]}
                onPress={() => setCategory(cat.key)}
              >
                <Ionicons name={cat.icon as any} size={16} color={cat.key === category ? '#fff' : colors.textSecondary} />
                <Text style={[styles.categoryText, { color: cat.key === category ? '#fff' : colors.textSecondary }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Describe the hazard..."
            placeholderTextColor={colors.textDisabled}
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#FF6D00' }]} onPress={handleSubmit} disabled={sending}>
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.submitText}>{sending ? 'Sending...' : 'Submit Report'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg, paddingBottom: Spacing.xl, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  title: { fontSize: Typography.sizes.heading, fontFamily: Typography.fonts.bold },
  label: { fontSize: Typography.sizes.tiny, fontFamily: Typography.fonts.bold, marginBottom: Spacing.xs, marginTop: Spacing.md },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  categoryBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 1, gap: Spacing.xs },
  categoryText: { fontSize: Typography.sizes.caption, fontFamily: Typography.fonts.medium },
  textInput: { borderRadius: BorderRadius.md, borderWidth: 1, padding: Spacing.md, fontSize: Typography.sizes.body, fontFamily: Typography.fonts.regular, minHeight: 100, marginTop: Spacing.md },
  submitBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, marginTop: Spacing.lg, gap: Spacing.sm },
  submitText: { fontSize: Typography.sizes.body, fontFamily: Typography.fonts.bold, color: '#fff' },
});