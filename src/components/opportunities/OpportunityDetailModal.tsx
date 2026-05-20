// src/components/opportunities/OpportunityDetailModal.tsx
import React from 'react';
import { View, Text, Modal, ScrollView, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts';
import { Typography, Spacing, BorderRadius } from '@/config/theme';
import type { Opportunity } from '@/services/opportunities';

interface Props {
  visible: boolean;
  opportunity: Opportunity | null;
  isSubscribed: boolean;
  onClose: () => void;
}

export function OpportunityDetailModal({ visible, opportunity, isSubscribed, onClose }: Props) {
  const { colors } = useTheme();
  if (!opportunity) return null;

  const isPremiumLocked = opportunity.is_premium && !isSubscribed;
  const docs = opportunity.tender_docs || [];

  const handleApply = () => {
    if (opportunity.apply_url) {
      if (opportunity.apply_url.startsWith('mailto:')) {
        Linking.openURL(opportunity.apply_url).catch(() => Alert.alert('Error', 'No email app found'));
      } else {
        Linking.openURL(opportunity.apply_url).catch(() => Alert.alert('Error', 'Could not open link'));
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.divider }]}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Opportunity Details</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{opportunity.title}</Text>

          {/* Company & Location */}
          {opportunity.company_name && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{opportunity.company_name}</Text>
          )}
          {opportunity.location_name && (
            <View style={styles.row}>
              <Ionicons name="location" size={14} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.primary }]}>{opportunity.location_name}</Text>
            </View>
          )}

          {/* Premium Lock */}
          {isPremiumLocked && (
            <View style={[styles.premiumLock, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="lock-closed" size={16} color={colors.warning} />
              <Text style={[styles.premiumLockText, { color: colors.warning }]}>
                Upgrade to Premium to view full tender details and download documents.
              </Text>
            </View>
          )}

          {/* Body */}
          <Text style={[styles.body, { color: isPremiumLocked ? colors.textDisabled : colors.text }]} numberOfLines={isPremiumLocked ? 4 : undefined}>
            {opportunity.body}
          </Text>

          {/* Documents */}
          {docs.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Documents</Text>
              {docs.map((doc, i) => (
                <Pressable
                  key={i}
                  style={[styles.docItem, { backgroundColor: isPremiumLocked ? colors.divider : colors.surface }]}
                  onPress={() => {
                    if (!isPremiumLocked) Linking.openURL(doc.url);
                  }}
                  disabled={isPremiumLocked}
                >
                  <Ionicons name="document-text" size={20} color={isPremiumLocked ? colors.textDisabled : colors.primary} />
                  <Text style={[styles.docName, { color: isPremiumLocked ? colors.textDisabled : colors.text }]}>{doc.name}</Text>
                  {isPremiumLocked ? (
                    <Ionicons name="lock-closed" size={16} color={colors.textDisabled} />
                  ) : (
                    <Ionicons name="download-outline" size={20} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {/* Apply Button */}
          {opportunity.apply_url && (
            <Pressable
              style={({ pressed }) => [
                styles.applyButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={handleApply}
            >
              <Ionicons name="open-outline" size={20} color="#FFFFFF" />
              <Text style={styles.applyText}>Apply Now</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  closeButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: Typography.sizes.body, fontFamily: 'DMSans-Bold' },
  content: { padding: Spacing.lg, paddingBottom: 80 },
  title: { fontSize: Typography.sizes.title, fontFamily: 'DMSans-Bold', marginBottom: Spacing.xs },
  subtitle: { fontSize: Typography.sizes.body, fontFamily: 'DMSans-Medium', marginBottom: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.md },
  locationText: { fontSize: Typography.sizes.caption, fontFamily: 'DMSans-Medium' },
  premiumLock: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  premiumLockText: { fontSize: Typography.sizes.caption, fontFamily: 'DMSans-Medium', flex: 1 },
  body: { fontSize: Typography.sizes.body, fontFamily: 'DMSans-Regular', lineHeight: 22, marginBottom: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: Typography.sizes.body, fontFamily: 'DMSans-Bold', marginBottom: Spacing.sm },
  docItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.md, marginBottom: Spacing.xs, gap: 8 },
  docName: { flex: 1, fontSize: Typography.sizes.caption, fontFamily: 'DMSans-Medium' },
  applyButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: BorderRadius.lg, gap: 8, marginTop: Spacing.md },
  applyText: { color: '#FFFFFF', fontSize: Typography.sizes.body, fontFamily: 'DMSans-Bold' },
});