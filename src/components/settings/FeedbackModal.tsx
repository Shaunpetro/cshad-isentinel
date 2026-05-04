// src/components/settings/FeedbackModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '@/config/theme';
import { APP } from '@/config/constants';

type FeedbackCategory = 'bug' | 'suggestion' | 'question';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES: { key: FeedbackCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'bug', label: 'Bug Report', icon: 'bug' },
  { key: 'suggestion', label: 'Suggestion', icon: 'bulb' },
  { key: 'question', label: 'Question', icon: 'help-circle' },
];

const SUPPORT_EMAIL = 'petrographics.adm@gmail.com';

export function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!description.trim()) {
      Alert.alert(t('common.error'), 'Please describe your feedback.');
      return;
    }

    setSending(true);

    const categoryLabel = CATEGORIES.find(c => c.key === category)?.label || category;
    const subject = `[${categoryLabel}] CSHAD iSentinel Beta Feedback`;
    const body = `Category: ${categoryLabel}\n\nDescription:\n${description}\n\n` +
                 (email ? `Contact: ${email}\n\n` : '') +
                 `App Version: ${APP.version}\nPlatform: ${Platform.OS}\n` +
                 `---\nSubmitted via app feedback form`;

    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const supported = await Linking.canOpenURL(mailto);
      if (supported) {
        await Linking.openURL(mailto);
        setDescription('');
        setEmail('');
        onClose();
      } else {
        Alert.alert(t('common.error'), 'No email app available. Please email us directly at ' + SUPPORT_EMAIL);
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Could not open email app.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Send Feedback</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Category */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>CATEGORY</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: cat.key === category ? colors.primary : colors.background,
                    borderColor: cat.key === category ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setCategory(cat.key)}
              >
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={cat.key === category ? '#fff' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryText,
                    { color: cat.key === category ? '#fff' : colors.textSecondary },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>DESCRIPTION</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Tell us what's happening..."
            placeholderTextColor={colors.textDisabled}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />

          {/* Email (optional) */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>YOUR EMAIL (OPTIONAL)</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="So we can follow up with you"
            placeholderTextColor={colors.textDisabled}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Send */}
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onPress={handleSend}
            disabled={sending}
          >
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.sendText}>{sending ? 'Sending...' : 'Send Feedback'}</Text>
          </TouchableOpacity>

          <Text style={[styles.footerNote, { color: colors.textDisabled }]}>
            Feedback opens your email app. No data is collected inside the app.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
  },
  label: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.bold,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  categoryText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
  },
  textInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    minHeight: 100,
  },
  sendButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  sendText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    color: '#fff',
  },
  footerNote: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});