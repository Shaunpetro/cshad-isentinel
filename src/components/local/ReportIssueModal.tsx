// src/components/local/ReportIssueModal.tsx
// Phase 3B – Modal for submitting a new local report

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts';
import { submitReport } from '../../services/localReports';
import { useLocation } from '../../hooks/useLocation';
import type { LocationUpdateCategory } from '../../types/news';

const CATEGORIES: { key: LocationUpdateCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'road', label: 'Road', icon: 'car-outline' },
  { key: 'water', label: 'Water', icon: 'water-outline' },
  { key: 'electricity', label: 'Electricity', icon: 'flash-outline' },
  { key: 'infrastructure', label: 'Infrastructure', icon: 'construct-outline' },
  { key: 'community', label: 'Community', icon: 'people-outline' },
];

// Simple device‑ID replacement (anonymous tracking)
function getDeviceId(): string {
  return `device-${Platform.OS}-${Date.now()}`;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ReportIssueModal({ visible, onClose }: Props) {
  const theme = useTheme();
  const { currentCity } = useLocation();
  const [category, setCategory] = useState<LocationUpdateCategory>('road');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Missing info', 'Please describe the issue.');
      return;
    }
    if (!currentCity) {
      Alert.alert('Location needed', 'Please enable location services.');
      return;
    }
    setSubmitting(true);
    const success = await submitReport({
      category,
      description: description.trim(),
      latitude: currentCity.latitude,
      longitude: currentCity.longitude,
      locationName: currentCity.name,
      reportedBy: getDeviceId(),
      votesConfirm: 0,
      votesDeny: 0,
    } as any);
    setSubmitting(false);
    if (success) {
      Alert.alert('Reported!', 'Thank you for helping your community.');
      setDescription('');
      onClose();
    } else {
      Alert.alert('Error', 'Could not submit report. Please try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Report an Issue</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryChip,
                  {
                    borderColor: category === cat.key ? theme.colors.primary : theme.colors.border,
                    backgroundColor: category === cat.key ? theme.colors.primary + '20' : 'transparent',
                  },
                ]}
                onPress={() => setCategory(cat.key)}
              >
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={category === cat.key ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: category === cat.key ? theme.colors.primary : theme.colors.textSecondary },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="What's happening?"
            placeholderTextColor={theme.colors.textDisabled}
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.colors.primary, opacity: submitting ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit Report'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  container: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 13, marginBottom: 8, marginTop: 12 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  categoryChipText: { fontSize: 13 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 80, textAlignVertical: 'top' },
  submitButton: { marginTop: 20, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});