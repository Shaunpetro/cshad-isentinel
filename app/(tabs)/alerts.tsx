// app/(tabs)/alerts.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from '@/hooks/useLocation';
import { useHub } from '@/hooks/useHub';
import { Typography, Spacing } from '@/config/theme';
import {
  LiveStatusBanner,
  HubFilterBar,
  FeedCard,
  JournalistRow,
  NotificationSettings,
  WeatherAlertCard,
  NationalBreakingBanner,
  InfrastructureCard,
  SuburbPickerModal,
  type HubFilter,
  type FeedItem,
  type Journalist,
  type NationalAlert,
} from '@/components/hub';
import type { SavedArea } from '@/services/infrastructure';

export default function AlertsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const { currentCity, radiusKm } = useLocation();

  const {
    feedItems,
    journalists,
    stats,
    weather,
    loadshedding,
    nationalAlerts,
    infrastructureAlerts,
    activeWeatherAlert,
    isLoading,
    isRefreshing,
    error,
    refresh,
    setFilter,
    activeFilter,
    dismissNationalAlert,
  } = useHub({
    latitude: currentCity?.latitude,
    longitude: currentCity?.longitude,
    radiusKm: radiusKm || 50,
    realtime: true,
  });

  const [suburbPickerVisible, setSuburbPickerVisible] = useState(false);

  const filterCounts: Partial<Record<HubFilter, number>> = {
    tips: feedItems.filter((item) => item.type === 'tip').length,
    live: feedItems.filter((item) => item.isBreaking || item.severity === 'critical').length,
    weather: weather?.alerts.length || 0,
    infrastructure: infrastructureAlerts.length,
    national: nationalAlerts.length,
    all: feedItems.length,
  };

  const nationalAlertItems: NationalAlert[] = nationalAlerts.map((item: FeedItem) => ({
    id: item.id,
    title: item.title,
    summary: item.summary || '',
    severity: item.severity === 'critical' ? 'critical' : item.severity === 'high' ? 'high' : 'medium',
    category: item.category || 'general',
    timestamp: item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp as string),
    source: typeof item.source === 'string' ? item.source : (item.source as { name: string }).name,
  }));

  const handleFilterChange = useCallback((filter: HubFilter) => setFilter(filter), [setFilter]);

  const handleFeedItemPress = useCallback((item: FeedItem) => {
    if (item.type === 'news' || item.type === 'tip') {
      router.push({ pathname: '/news/[id]', params: { id: item.id } });
    }
  }, [router]);

  const handleNationalAlertPress = useCallback((alert: NationalAlert) => {
    router.push({ pathname: '/news/[id]', params: { id: alert.id } });
  }, [router]);

  const renderFeedItem = useCallback(
    ({ item }: { item: FeedItem }) => (
      <FeedCard
        item={item}
        onPress={() => handleFeedItemPress(item)}
        onViewMap={item.location ? () => router.push('/map') : undefined}
      />
    ),
    [handleFeedItemPress, router]
  );

  const renderHeader = useCallback(
    () => (
      <View>
        {nationalAlertItems.length > 0 && (
          <NationalBreakingBanner
            alerts={nationalAlertItems}
            maxDisplay={2}
            onAlertPress={handleNationalAlertPress}
            onDismiss={dismissNationalAlert}
          />
        )}

        {(activeWeatherAlert || weather?.current) && (
          <WeatherAlertCard
            alert={activeWeatherAlert || undefined}
            currentWeather={!activeWeatherAlert ? weather?.current : undefined}
            locationName={currentCity?.name}
            onPress={() => setFilter('weather')}
          />
        )}

        {loadshedding && (
          <InfrastructureCard
            loadshedding={loadshedding}
            onPress={() => setFilter('infrastructure')}
            onChangeArea={() => setSuburbPickerVisible(true)}
          />
        )}

        <LiveStatusBanner
          activeIncidents={stats.activeIncidents}
          breakingCount={stats.breakingCount}
          onViewIncidents={() => setFilter('live')}
          onViewBreaking={() => setFilter('live')}
        />

        <HubFilterBar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          counts={filterCounts}
        />
      </View>
    ),
    [nationalAlertItems, activeWeatherAlert, weather, loadshedding, stats, activeFilter, filterCounts, colors, handleNationalAlertPress, dismissNationalAlert, handleFilterChange, currentCity, setFilter]
  );

  const renderFooter = useCallback(
    () => (
      <View style={styles.footer}>
        <JournalistRow
          journalists={journalists}
          onJournalistPress={(j) => console.log('Journalist:', j.id)}
          onFollowPress={(j) => console.log('Follow:', j.id)}
          onViewAllPress={() => console.log('View all journalists')}
        />
        <View style={styles.bottomSpacing} />
      </View>
    ),
    [journalists]
  );

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('alerts.title')}</Text>
        </View>
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Safety Hub</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color={colors.primary} />
          <Text style={[styles.locationText, { color: colors.primary }]}>
            {currentCity?.name || 'South Africa'}
          </Text>
          {radiusKm && (
            <Text style={[styles.radiusText, { color: colors.textSecondary }]}>• {radiusKm}km</Text>
          )}
        </View>
      </View>

      <FlatList
        data={feedItems}
        renderItem={renderFeedItem}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={feedItems.length > 0 ? renderFooter : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
            <Text style={[styles.emptyText, { color: colors.text }]}>{t('alerts.allClear')}</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>{t('alerts.noAlerts')}</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={feedItems.length === 0 ? { flexGrow: 1 } : undefined}
      />

      <SuburbPickerModal
        visible={suburbPickerVisible}
        onClose={() => setSuburbPickerVisible(false)}
        onSuburbSelected={(area: SavedArea | null) => {
          console.log('Area selected:', area?.name);
          refresh();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: Typography.sizes.title, fontFamily: Typography.fonts.bold },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  locationText: { fontSize: Typography.sizes.label, fontFamily: Typography.fonts.medium },
  radiusText: { fontSize: Typography.sizes.label, fontFamily: Typography.fonts.regular },
  footer: { paddingBottom: Spacing.xl },
  bottomSpacing: { height: 100 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.xl * 2, paddingHorizontal: Spacing.lg },
  emptyText: { fontSize: Typography.sizes.body, fontFamily: Typography.fonts.bold, marginTop: Spacing.md, textAlign: 'center' },
  emptySubtext: { fontSize: Typography.sizes.caption, fontFamily: Typography.fonts.regular, marginTop: Spacing.xs, textAlign: 'center' },
});