// src/components/opportunities/OpportunityDetailModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTheme } from '@/contexts';
import { Typography, Spacing, BorderRadius } from '@/config/theme';
import { SubscriptionModal } from './SubscriptionModal';
import type { Opportunity } from '@/services/opportunities';

interface Props {
  visible: boolean;
  opportunity: Opportunity | null;
  isSubscribed: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function OpportunityDetailModal({ visible, opportunity, isSubscribed, onClose }: Props) {
  const { colors, isDark } = useTheme();
  const [subscriptionVisible, setSubscriptionVisible] = useState(false);

  if (!opportunity) return null;

  const isPremiumLocked = opportunity.is_premium && !isSubscribed;
  const docs = opportunity.tender_docs || [];

  // Clean raw newline escapes from API text
  const formatText = (input?: string) => (input || '').replace(/\\n/g, '\n');

  const handleApply = () => {
    if (opportunity.apply_url) {
      const url = opportunity.apply_url;
      if (url.startsWith('mailto:')) {
        Linking.openURL(url).catch(() => Alert.alert('Error', 'No email app found'));
      } else {
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open link'));
      }
    }
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const fileUri = (FileSystem as any).documentDirectory + fileName;
      const downloadResumable = FileSystem.createDownloadResumable(url, fileUri);
      const { uri } = await downloadResumable.downloadAsync();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Download complete', `File saved to ${uri}`);
      }
    } catch (error: any) {
      Alert.alert('Download failed', error.message || 'An error occurred');
    }
  };

  const handleSelectPlan = (plan: any) => {
    Alert.alert(
      'Demo Subscription',
      `You selected the ${plan.name} plan (${plan.price} ${plan.period}).\n\nIn the live app, this would start a payment flow.`,
      [{ text: 'OK', onPress: () => setSubscriptionVisible(false) }]
    );
  };

  const blurIntensity = 90;
  const tint = isDark ? 'dark' : 'light';
  const glassBackground = isDark ? 'rgba(20, 20, 20, 0.92)' : 'rgba(255, 255, 255, 0.92)';

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderBriefing = () => {
    const hasBriefing = (opportunity as any).briefing_required;
    if (hasBriefing === undefined || hasBriefing === null) return null;
    if (!hasBriefing) {
      return (
        <View style={styles.row}>
          <Ionicons name="people" size={14} color={colors.success} />
          <Text style={[styles.metaText, { color: colors.success }]}>No briefing required</Text>
        </View>
      );
    }
    const mandatory = (opportunity as any).briefing_mandatory;
    const details = formatText((opportunity as any).briefing_details || '');
    return (
      <View style={styles.briefingContainer}>
        <View style={styles.row}>
          <Ionicons name="people" size={14} color={colors.warning} />
          <Text style={[styles.metaText, { color: colors.warning }]}>
            Briefing: {mandatory ? 'Mandatory' : 'Optional'}
          </Text>
        </View>
        {details ? (
          <Text style={[styles.briefingDetails, { color: colors.textSecondary }]}>
            {details}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={onClose}
      >
        {/* Backdrop with stronger scrim */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <BlurView intensity={blurIntensity} tint={tint} style={StyleSheet.absoluteFill} />
        </Pressable>

        <View style={styles.centeredContainer}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: glassBackground,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 15,
                elevation: 15,
              },
            ]}
          >
            <View style={styles.dragHandleArea}>
              <View style={[styles.dragHandle, { backgroundColor: colors.divider }]} />
            </View>

            <Pressable
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.surface + '80' }]}
              hitSlop={12}
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              key={opportunity.id}
            >
              <Text style={[styles.title, { color: colors.text }]}>
                {opportunity.title}
              </Text>

              {opportunity.company_name && (
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {opportunity.company_name}
                </Text>
              )}
              {opportunity.location_name && (
                <View style={styles.row}>
                  <Ionicons name="location" size={14} color={colors.primary} />
                  <Text style={[styles.metaText, { color: colors.primary }]}>
                    {opportunity.location_name}
                  </Text>
                </View>
              )}
              {opportunity.province && (
                <View style={styles.row}>
                  <Ionicons name="map" size={14} color={colors.primary} />
                  <Text style={[styles.metaText, { color: colors.primary }]}>
                    {opportunity.province}
                  </Text>
                </View>
              )}

              {opportunity.date_advertised && (
                <View style={styles.row}>
                  <Ionicons name="calendar" size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    Advertised: {formatDateTime(opportunity.date_advertised)}
                  </Text>
                </View>
              )}
              <View style={styles.row}>
                <Ionicons name="timer" size={14} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  Closing: {formatDateTime(opportunity.closing_date)}
                </Text>
              </View>
              {opportunity.submission_type && (
                <View style={styles.row}>
                  <Ionicons name="send" size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {opportunity.submission_type}
                  </Text>
                </View>
              )}

              {renderBriefing()}

              {/* Body – premium locked shows preview + banner, else full text */}
              {isPremiumLocked ? (
                <View style={styles.premiumContainer}>
                  <Text
                    style={[styles.body, { color: colors.text }]}
                    numberOfLines={4}
                  >
                    {formatText(opportunity.body)}
                  </Text>
                  <View style={styles.upgradeBanner}>
                    <View style={styles.upgradeBannerContent}>
                      <Ionicons name="lock-closed" size={20} color={colors.warning} />
                      <Text style={[styles.upgradeBannerText, { color: colors.warning }]}>
                        Subscribe to Premium to view full details and download documents.
                      </Text>
                    </View>
                    <Pressable
                      style={[styles.upgradeButton, { backgroundColor: colors.warning }]}
                      onPress={() => setSubscriptionVisible(true)}
                    >
                      <Text style={styles.upgradeButtonText}>Upgrade</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Text style={[styles.body, { color: colors.text }]}>
                  {formatText(opportunity.body)}
                </Text>
              )}

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
                        if (!isPremiumLocked) handleDownload(doc.url, doc.name);
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
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SubscriptionModal
        visible={subscriptionVisible}
        onClose={() => setSubscriptionVisible(false)}
        onSelectPlan={handleSelectPlan}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  card: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.88,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  dragHandleArea: {
    alignItems: 'center',
    paddingTop: 10,
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl + 20,
  },
  title: {
    fontSize: Typography.sizes.title,
    fontFamily: 'DMSans-Bold',
    marginTop: Spacing.md,
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
  metaText: {
    fontSize: Typography.sizes.caption,
    fontFamily: 'DMSans-Regular',
  },
  briefingContainer: {
    marginBottom: Spacing.md,
  },
  briefingDetails: {
    fontSize: Typography.sizes.caption,
    fontFamily: 'DMSans-Regular',
    lineHeight: 18,
    marginTop: Spacing.xs,
    marginLeft: 18,
  },
  body: {
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Regular',
    lineHeight: 22,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  premiumContainer: {
    marginBottom: Spacing.lg,
  },
  upgradeBanner: {
    marginTop: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    alignItems: 'center',
    gap: 12,
  },
  upgradeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upgradeBannerText: {
    flex: 1,
    fontSize: Typography.sizes.caption,
    fontFamily: 'DMSans-Medium',
  },
  upgradeButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.sizes.body,
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