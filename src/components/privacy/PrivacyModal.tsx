// src/components/privacy/PrivacyModal.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Colors, Typography, Spacing } from '@/config/theme';
import {
  getAnonymousId,
  getAnonymousIdCreatedDate,
  generateNewAnonymousId,
  getDataCollectionInfo,
  getPrivacyTips,
  clearAllLocalData,
} from '@/services/privacy';
import { AnonymousIdCard } from './AnonymousIdCard';
import { DataCollectionList } from './DataCollectionList';
import { DataControlButton } from './DataControlButton';
import { PrivacyTipCard } from './PrivacyTipCard';

interface PrivacyModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PrivacyModal({ visible, onClose }: PrivacyModalProps) {
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [createdDate, setCreatedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const dataCollectionInfo = getDataCollectionInfo();
  const privacyTips = getPrivacyTips();

  // Load anonymous ID when modal opens
  useEffect(() => {
    if (visible) {
      loadAnonymousId();
    }
  }, [visible]);

  const loadAnonymousId = async () => {
    setIsLoading(true);
    try {
      const id = await getAnonymousId();
      const date = await getAnonymousIdCreatedDate();
      setAnonymousId(id);
      setCreatedDate(date);
    } catch (error) {
      console.error('[PrivacyModal] Error loading anonymous ID:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyId = useCallback(async () => {
    if (anonymousId) {
      await Clipboard.setStringAsync(anonymousId);
      Alert.alert('Copied', 'Anonymous ID copied to clipboard');
    }
  }, [anonymousId]);

  const handleRegenerateId = useCallback(() => {
    Alert.alert(
      'Generate New ID?',
      'This will create a new anonymous ID. Your old ID will be permanently deleted. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate New ID',
          style: 'destructive',
          onPress: async () => {
            setIsRegenerating(true);
            try {
              const newId = await generateNewAnonymousId();
              const date = await getAnonymousIdCreatedDate();
              setAnonymousId(newId);
              setCreatedDate(date);
              Alert.alert('Success', 'New anonymous ID generated');
            } catch (error) {
              Alert.alert('Error', 'Failed to generate new ID');
            } finally {
              setIsRegenerating(false);
            }
          },
        },
      ]
    );
  }, []);

  const handleClearData = useCallback(() => {
    Alert.alert(
      'Clear All Local Data?',
      'This will delete:\n\n• Your anonymous ID\n• Notification settings\n• All cached data\n\nA new anonymous ID will be created automatically. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await clearAllLocalData();
              // Regenerate new ID immediately
              await loadAnonymousId();
              Alert.alert('Success', 'All local data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  }, []);

  const handleExportData = useCallback(() => {
    Alert.alert(
      'Export Data',
      'Data export feature coming soon. Since we collect minimal data, there is very little to export!',
      [{ text: 'OK' }]
    );
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={28} color={Colors.carbon.white} />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={Colors.semantic.success}
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>Privacy Dashboard</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Anonymous ID Card */}
          <AnonymousIdCard
            anonymousId={anonymousId}
            createdDate={createdDate}
            isLoading={isLoading}
            onCopyId={handleCopyId}
          />

          {/* Data Collection Info */}
          <DataCollectionList items={dataCollectionInfo} />

          {/* Data Controls */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DATA CONTROLS</Text>

            <DataControlButton
              icon="refresh-outline"
              label="New ID"
              description="Generate new anonymous ID"
              onPress={handleRegenerateId}
              isLoading={isRegenerating}
            />

            <DataControlButton
              icon="download-outline"
              label="Export"
              description="Download your data"
              onPress={handleExportData}
            />

            <DataControlButton
              icon="trash-outline"
              label="Clear"
              description="Delete all local data"
              onPress={handleClearData}
              variant="danger"
              isLoading={isClearing}
            />
          </View>

          {/* Privacy Tips */}
          <PrivacyTipCard tips={privacyTips} />

          {/* POPIA Badge */}
          <View style={styles.popiaBadge}>
            <Ionicons name="ribbon" size={20} color={Colors.semantic.primary} />
            <Text style={styles.popiaText}>POPIA Compliant</Text>
          </View>
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
    backgroundColor: Colors.carbon.charcoal,
    borderBottomWidth: 1,
    borderBottomColor: Colors.carbon.steel,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: Spacing.xs,
  },
  headerTitle: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.medium,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  popiaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  popiaText: {
    color: Colors.semantic.primary,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
    marginLeft: Spacing.xs,
  },
});