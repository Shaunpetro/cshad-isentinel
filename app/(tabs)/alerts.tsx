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
  type HubFilter,
  type FeedItem,
  type Journalist,
  type NationalAlert,
} from '@/components/hub';

// Notification settings state
interface NotificationSetting {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  enabled: boolean;
  color?: string;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSetting[] = [
  { id: 'breaking', label: 'Breaking Alerts', icon: 'flash', enabled: true, color: '#FF1744' },
  { id: 'local', label: 'Local Tips', icon: 'location', enabled: true, color: '#2196F3' },
  { id: 'weather', label: 'Weather Alerts', icon: 'cloudy', enabled: true, color: '#FF9800' },
  { id: 'loadshedding', label: 'Load Shedding', icon: 'flash-outline', enabled: true, color: '#9C27B0' },
];

export default function AlertsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  // Get user location
  const { currentCity, radiusKm } = useLocation();

  // Get hub data
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

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>(
    DEFAULT_NOTIFICATION_SETTINGS
  );

  // Filter counts for badges
  const filterCounts: Partial<Record<HubFilter, number>> = {
    tips: feedItems.filter((item) => item.type === 'tip').length,
    live: feedItems.filter((item) => item.isBreaking || item.severity === 'critical').length,
    weather: weather?.alerts.length || 0,
    infrastructure: infrastructureAlerts.length,
    national: nationalAlerts.length,
    all: feedItems.length,
  };

  // Convert national alerts to NationalAlert type
  const nationalAlertItems: NationalAlert[] = nationalAlerts.map((item: FeedItem) => ({
    id: item.id,
    title: item.title,
    summary: item.summary || '',
    severity: item.severity === 'critical' ? 'critical' : item.severity === 'high' ? 'high' : 'medium',
    category: item.category || 'general',
    timestamp: item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp as string),
    source: typeof item.source === 'string' ? item.source : (item.source as { name: string }).name,
  }));

  // Handlers
  const handleFilterChange = useCallback(
    (filter: HubFilter) => {
      setFilter(filter);
    },
    [setFilter]
  );

  const handleFeedItemPress = useCallback(
    (item: FeedItem) => {
      if (item.type === 'news' || item.type === 'tip') {
        router.push({ pathname: '/news/[id]', params: { id: item.id } });
      } else {
        console.log('Open detail:', item.id);
      }
    },
    [router]
  );

  const handleShareItem = useCallback((item: FeedItem) => {
    console.log('Share item:', item.id);
  }, []);

  const handleFollowItem = useCallback((item: FeedItem) => {
    console.log('Follow item:', item.id);
  }, []);

  const handleViewOnMap = useCallback(
    (item: FeedItem) => {
      router.push('/map');
    },
    [router]
  );

  const handleNationalAlertPress = useCallback(
    (alert: NationalAlert) => {
      router.push({ pathname: '/news/[id]', params: { id: alert.id } });
    },
    [router]
  );

  const handleJournalistPress = useCallback((journalist: Journalist) => {
    console.log('Open journalist:', journalist.id);
  }, []);

  const handleFollowJournalist = useCallback((journalist: Journalist) => {
    console.log('Follow journalist:', journalist.id);
  }, []);

  const handleViewAllJournalists = useCallback(() => {
    console.log('View all journalists');
  }, []);

  const handleNotificationToggle = useCallback((id: string, enabled: boolean) => {
    setNotificationSettings((prev) =>
      prev.map((setting) => (setting.id === id ? { ...setting, enabled } : setting))
    );
  }, []);

  const handleCustomizeNotifications = useCallback(() => {
    router.push('/settings');
  }, [router]);

  const handleViewIncidents = useCallback(() => {
    setFilter('live');
  }, [setFilter]);

  const handleViewBreaking = useCallback(() => {
    setFilter('live');
  }, [setFilter]);

  // Render feed item
  const renderFeedItem = useCallback(
    ({ item }: { item: FeedItem }) => (
      <FeedCard
        item={item}
        onPress={() => handleFeedItemPress(item)}
        onShare={() => handleShareItem(item)}
        onFollow={() => handleFollowItem(item)}
        onViewMap={item.location ? () => handleViewOnMap(item) : undefined}
      />
    ),
    [handleFeedItemPress, handleShareItem, handleFollowItem, handleViewOnMap]
  );

  // Render header components
  const renderHeader = useCallback(
    () => (
      <View>
        {/* National Breaking Banner (Top 2, dismissible) */}
        {nationalAlertItems.length > 0 && (
          <NationalBreakingBanner
            alerts={nationalAlertItems}
            maxDisplay={2}
            onAlertPress={handleNationalAlertPress}
            onDismiss={dismissNationalAlert}
          />
        )}

        {/* Weather Alert Card */}
        {(activeWeatherAlert || weather?.current) && (
          <WeatherAlertCard
            alert={activeWeatherAlert || undefined}
            currentWeather={!activeWeatherAlert ? weather?.current : undefined}
            locationName={currentCity?.name}
            onPress={() => setFilter('weather')}
          />
        )}

        {/* Load Shedding Card */}
        {loadshedding && loadshedding.stage > 0 && (
          <InfrastructureCard
            loadshedding={loadshedding}
            onPress={() => setFilter('infrastructure')}
            compact
          />
        )}

        {/* Live Status Banner */}
        <LiveStatusBanner
          activeIncidents={stats.activeIncidents}
          breakingCount={stats.breakingCount}
          onViewIncidents={handleViewIncidents}
          onViewBreaking={handleViewBreaking}
        />

        {/* Filter Bar */}
        <HubFilterBar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          counts={filterCounts}
        />

        {/* Section label */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {activeFilter === 'tips'
              ? 'Community Tips'
              : activeFilter === 'live'
              ? 'Live Incidents'
              : activeFilter === 'weather'
              ? 'Weather Alerts'
              : activeFilter === 'infrastructure'
              ? 'Infrastructure'
              : activeFilter === 'national'
              ? 'National Alerts'
              : 'All Updates'}
          </Text>
          {feedItems.length > 0 && (
            <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
              {feedItems.length} items
            </Text>
          )}
        </View>
      </View>
    ),
    [
      nationalAlertItems,
      activeWeatherAlert,
      weather,
      loadshedding,
      currentCity,
      stats,
      activeFilter,
      filterCounts,
      colors,
      handleNationalAlertPress,
      dismissNationalAlert,
      handleViewIncidents,
      handleViewBreaking,
      handleFilterChange,
      setFilter,
      feedItems.length,
    ]
  );

  // Render footer components
  const renderFooter = useCallback(
    () => (
      <View style={styles.footer}>
        {/* Journalists Row */}
        <JournalistRow
          journalists={journalists}
          onJournalistPress={handleJournalistPress}
          onFollowPress={handleFollowJournalist}
          onViewAllPress={handleViewAllJournalists}
        />

        {/* Notification Settings */}
        <NotificationSettings
          settings={notificationSettings}
          onToggle={handleNotificationToggle}
          onCustomize={handleCustomizeNotifications}
        />

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </View>
    ),
    [
      journalists,
      notificationSettings,
      handleJournalistPress,
      handleFollowJournalist,
      handleViewAllJournalists,
      handleNotificationToggle,
      handleCustomizeNotifications,
    ]
  );

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Loading safety updates...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Failed to load updates</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
        <Text style={[styles.emptyText, { color: colors.text }]}>All clear!</Text>
        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
          No {activeFilter === 'all' ? 'updates' : activeFilter} at the moment
        </Text>
      </View>
    );
  }, [isLoading, error, activeFilter, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.text }]}>Safety Hub</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.primary }]}>
                {currentCity?.name || 'South Africa'}
              </Text>
              {radiusKm && (
                <Text style={[styles.radiusText, { color: colors.textSecondary }]}>
                  • {radiusKm}km
                </Text>
              )}
            </View>
          </View>
          <View style={styles.headerRight}>
            {isRefreshing && <ActivityIndicator size="small" color={colors.primary} />}
          </View>
        </View>
      </SafeAreaView>

      {/* Feed */}
      <FlatList
        data={feedItems}
        renderItem={renderFeedItem}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={feedItems.length > 0 ? renderFooter : null}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.surface}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={feedItems.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: Spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    paddingTop: 4,
  },
  title: {
    fontSize: Typography.sizes.title,
    fontFamily: Typography.fonts.bold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.medium,
  },
  radiusText: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  sectionCount: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
  },
  footer: {
    paddingBottom: Spacing.xl,
  },
  bottomSpacing: {
    height: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
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