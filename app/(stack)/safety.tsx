// app/(stack)/safety.tsx
// Phase 3B – Near Me Alerts (replaces old Safety Hub)

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts';
import { useLocation } from '@/hooks/useLocation';
import { useLocalAlerts } from '@/hooks/useLocalAlerts';
import { Typography, Spacing } from '@/config/theme';
import LocalAlertCard from '@/components/local/LocalAlertCard';
import ReportIssueModal from '@/components/local/ReportIssueModal';
import type { LocalReport } from '@/types/news';

export default function NearMeScreen() {
  const theme = useTheme();
  const { currentCity } = useLocation();
  const { alerts, isLoading, isRefreshing, refresh } = useLocalAlerts();
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const renderItem = useCallback(
    ({ item }: { item: LocalReport }) => (
      <LocalAlertCard report={item} />
    ),
    []
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            📍 Near Me Alerts
          </Text>
          <TouchableOpacity
            style={[styles.reportButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setReportModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.reportButtonText}>Report</Text>
          </TouchableOpacity>
        </View>
        {currentCity && (
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {currentCity.name} · Updated every 5 minutes
          </Text>
        )}
      </View>
    ),
    [theme, currentCity]
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={alerts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={48} color={theme.colors.success} />
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              All clear in your area
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              No active alerts. Tap "Report" if you notice something.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={alerts.length === 0 ? { flexGrow: 1 } : { paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      <ReportIssueModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: { padding: Spacing.md },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
  },
  subtitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: 4,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});