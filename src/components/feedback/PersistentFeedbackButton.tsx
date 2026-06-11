// src/components/feedback/PersistentFeedbackButton.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts';
import { Typography, Spacing, BorderRadius } from '@/config/theme';

type TicketCategory = 'bug' | 'feature' | 'beta' | 'problem' | 'other';

const CATEGORY_OPTIONS: TicketCategory[] = ['bug', 'feature', 'beta', 'problem', 'other'];

export function PersistentFeedbackButton() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // Basic fields (always visible)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<TicketCategory>('bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Bug‑specific fields (only visible when category === 'bug')
  const [steps, setSteps] = useState(`Screen: ${pathname}`);
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');

  // Auto‑populated environment
  const deviceInfo = `${Device.brand || ''} ${Device.modelName || ''} (${Device.osName || ''} ${Device.osVersion || ''})`;
  const appVersion = Constants.expoConfig?.version || '1.264.0';
  const environment = `${deviceInfo} — App v${appVersion}`;

  const handleSubmit = () => {
    const params = new URLSearchParams({
      name: name.trim(),
      email: email.trim(),
      category,
      subject: `${category.charAt(0).toUpperCase() + category.slice(1)}: ${subject.trim()}`,
      message: message.trim(),
      steps_to_reproduce: steps.trim(),
      expected_behavior: expected.trim(),
      actual_behavior: actual.trim(),
      environment,
      source: 'mobile',
    }).toString();

    Linking.openURL(`https://cshad-isentinel-md.vercel.app/feedback?${params}`);
    setVisible(false);
  };

  const bottomPosition = 60 + insets.bottom + 12;

  return (
    <>
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary, bottom: bottomPosition }]}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
      </Pressable>

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Send Feedback</Text>
              <Pressable onPress={() => setVisible(false)} hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Name (optional)"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Email (optional)"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              <Text style={[styles.label, { color: colors.text }]}>Category</Text>
              <View style={styles.categoryRow}>
                {CATEGORY_OPTIONS.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: category === cat ? colors.primary : colors.surface,
                        borderColor: category === cat ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.categoryText, { color: category === cat ? '#FFFFFF' : colors.text }]}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Subject"
                placeholderTextColor={colors.textSecondary}
                value={subject}
                onChangeText={setSubject}
              />
              <TextInput
                style={[styles.inputMultiline, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Describe the issue or suggestion..."
                placeholderTextColor={colors.textSecondary}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Bug‑specific fields — only when category is 'bug' */}
              {category === 'bug' && (
                <>
                  <Text style={[styles.label, { color: colors.text, marginTop: Spacing.sm }]}>
                    Steps to Reproduce
                  </Text>
                  <TextInput
                    style={[styles.inputMultiline, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="Steps to reproduce..."
                    placeholderTextColor={colors.textSecondary}
                    value={steps}
                    onChangeText={setSteps}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  <Text style={[styles.label, { color: colors.text }]}>Expected Behavior</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="What did you expect to happen?"
                    placeholderTextColor={colors.textSecondary}
                    value={expected}
                    onChangeText={setExpected}
                  />
                  <Text style={[styles.label, { color: colors.text }]}>Actual Behavior</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="What actually happened?"
                    placeholderTextColor={colors.textSecondary}
                    value={actual}
                    onChangeText={setActual}
                  />
                </>
              )}

              {/* Environment field (always visible, auto‑populated) */}
              <Text style={[styles.label, { color: colors.text, marginTop: Spacing.sm }]}>Environment (auto‑detected)</Text>
              <Text style={[styles.envText, { color: colors.textSecondary }]}>{environment}</Text>

              <Pressable
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitText}>Submit Feedback</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modal: {
    borderRadius: BorderRadius.xl,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: Typography.sizes.title,
    fontFamily: 'DMSans-Bold',
  },
  content: {
    padding: Spacing.lg,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Regular',
    marginBottom: Spacing.md,
  },
  inputMultiline: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Regular',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.caption,
    fontFamily: 'DMSans-Bold',
    marginBottom: Spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: Typography.sizes.label,
    fontFamily: 'DMSans-Medium',
  },
  envText: {
    fontSize: Typography.sizes.label,
    fontFamily: 'DMSans-Regular',
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.md,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Bold',
  },
});