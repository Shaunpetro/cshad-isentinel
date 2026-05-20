// src/components/opportunities/OpportunityDetailModal.tsx
import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
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
  const { colors, isDark } = useTheme();
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

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const fileUri = FileSystem.documentDirectory + fileName;
      const downloadResumable = FileSystem.createDownloadResumable(url, fileUri);
      const { uri } = await downloadResumable.downloadAsync();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Download complete', `File saved to ${uri}`);
      }
    } catch (error: any) {
      Alert.alert('Download failed', error.message);
    }
  };

  const blurIntensity = 80;
  const tint = isDark ? 'dark' : 'light';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Blur background overlay */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <BlurView intensity={blurIntensity} tint={tint} style={StyleSheet.absoluteFill} />
      </Pressable>

      {/* Card container */}
      <View style={styles.cardContainer}>
        <Pressable onPress={onClose} style={styles.dragHandleArea}>
          <View style={[styles.dragHandle, { backgroundColor: colors.divider }]} />
        </Pressable>

        {/* Header with close button */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Opportunity Details</Text>
          <Pressable
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: colors.surface + '80' }]}
            hitSlop={12}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{opportunity.title}</Text>

          {/* Company & Location */}
          {opportunity.company_name && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {opportunity.company_name}
            </Text>
          )}
          {opportunity.location_name && (
            <View style={styles.row}>
              <Ionicons name="location" size={14} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.primary }]}>
                {opportunity.location_name}
              </Text>
            </View>
          )}

          {/* Province */}
          {opportunity.province && (
            <View style={styles.row}>
              <Ionicons name="map" size={14} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.primary }]}>
                {opportunity.province}
              </Text>
            </View>
          )}

          {/* Dates & Submission */}
          {opportunity.date_advertised && (
            <View style={styles.row}>
              <Ionicons name="calendar" size={14} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                Advertised: {new Date(opportunity.date_advertised).toLocaleDateString()}
              </Text>
            </View>
          )}
          <View style={styles.row}>
            <Ionicons name="timer" size={14} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              Closing: {new Date(opportunity.closing_date).toLocaleDateString()}
            </Text>
          </View>
          {opportunity.submission_type && (
            <View style={styles.row}>
              <Ionicons name="send" size={14} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {opportunity.submission_type}
              </Text>
            </View>
          )}

          {/* Premium Lock */}
          {isPremiumLocked && (
            <View style={[styles.premiumLock, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="lock-closed" size={16} color={colors.warning} />
              <Text style={[styles.premiumLockText, { color: colors.warning }]}>
                Subscribe to Premium to view full tender details and download documents.
              </Text>
            </View>
          )}

          {/* Body */}
          <Text
            style={[
              styles.body,
              { color: isPremiumLocked ? colors.textDisabled : colors.text },
            ]}
            numberOfLines={isPremiumLocked ? 4 : undefined}
          >
            {opportunity.body}
          </Text>

          {/* Documents */}
          {docs.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Documents</Text>
              {docs.map((doc, i) => (
                <Pressable
                  key={i}
                  style={[
                    styles.docItem,
                    { backgroundColor: isPremiumLocked ? colors.divider : colors.surface + '80' },
                  ]}
                  onPress={() => {
                    if (!isPremiumLocked) {
                      handleDownload(doc.url, doc.name);
                    }
                  }}
                  disabled={isPremiumLocked}
                >
                  <Ionicons
                    name="document-text"
                    size={20}
                    color={isPremiumLocked ? colors.textDisabled : colors.primary}
                  />
                  <Text
                    style={[
                      styles.docName,
                      { color: isPremiumLocked ? colors.textDisabled : colors.text },
                    ]}
                  >
                    {doc.name}
                  </Text>
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

          {/* Bottom spacer */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '85%',
    backgroundColor: 'transparent',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  dragHandleArea: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes.title,
    fontFamily: 'DMSans-Bold',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Medium',
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: Typography.sizes.caption,
    fontFamily: 'DMSans-Medium',
  },
  detailText: {
    fontSize: Typography.sizes.caption,
    fontFamily: 'DMSans-Regular',
  },
  premiumLock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  premiumLockText: {
    fontSize: Typography.sizes.caption,
    fontFamily: 'DMSans-Medium',
    flex: 1,
  },
  body: {
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Regular',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Bold',
    marginBottom: Spacing.sm,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    gap: 8,
  },
  docName: {
    flex: 1,
    fontSize: Typography.sizes.caption,
    fontFamily: 'DMSans-Medium',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    gap: 8,
    marginTop: Spacing.md,
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Bold',
  },
});