// app/(stack)/news.tsx
// Beta 4 – News screen with carousel‑style location/radius, permission check, weather & infrastructure widgets

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Typography, Spacing } from '../../src/config/theme';
import {
  NewsList,
  CityPickerModal,
  LocationPermissionModal,
  TimeFilterBar,
} from '../../src/components/news';
import WeatherCard from '../../src/components/news/WeatherCard';
import InfrastructureCard from '../../src/components/hub/InfrastructureCard';
import LocalAlertCard from '../../src/components/local/LocalAlertCard';
import RadiusPickerModal from '../../src/components/location/RadiusPickerModal';
import { useLocationContext } from '@/contexts/LocationContext';
import type { SACity } from '@/services/location';
import { useCurrentWeather } from '../../src/hooks/useCurrentWeather';
import { useInfrastructure } from '../../src/hooks/useInfrastructure';
import { useNews } from '../../src/hooks/useNews';
import { useLocalAlerts } from '../../src/hooks/useLocalAlerts';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useTheme } from '../../src/contexts';
import type { NewsItem } from '../../src/types';
import type { TimeFilter } from '../../src/services/news';

const LOCATION_UPDATE_CATEGORIES = new Set([
  'weather', 'water', 'electricity', 'infrastructure', 'road', 'community',
]);

type ActiveTab = 'general' | 'local';

export default function NewsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { preferences } = usePreferences();

  const [activeTab, setActiveTab] = useState<ActiveTab>('general');
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [radiusVisible, setRadiusVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);

  const {
    currentCity,
    setCity,
    detectLocation,
    scope,
    setScope,
    radiusKm,
    setRadius,
    permissionStatus,
    requestPermission,
  } = useLocationContext();

  const { weather: currentWeather } = useCurrentWeather();
  const { loadshedding } = useInfrastructure();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');

  const newsScope = useMemo(() => {
    if (scope === 'local') return 'local';
    return 'national';
  }, [scope]);

  const {
    news: allNews,
    isLoading: newsLoading,
    isRefreshing: newsRefreshing,
    error: newsError,
    refresh: refreshNews,
    lastUpdated,
  } = useNews({
    scope: newsScope,
    latitude: currentCity?.latitude,
    longitude: currentCity?.longitude,
    cityName: scope === 'local' ? currentCity?.name : undefined,
    radiusKm: scope === 'local' ? radiusKm : undefined,
    timeFilter,
    realtime: true,
    autoRefresh: true,
  });

  const news = useMemo(
    () => allNews.filter((article: NewsItem) => !LOCATION_UPDATE_CATEGORIES.has(article.category)),
    [allNews]
  );

  const {
    alerts: localAlerts,
    isRefreshing: alertsRefreshing,
    refresh: refreshAlerts,
  } = useLocalAlerts();

  const handleArticlePress = useCallback(
    (article: NewsItem) => {
      router.push({ pathname: '/(stack)/article/[id]', params: { id: article.id } });
    },
    [router]
  );

  const handleEnableLocation = useCallback(() => setPermissionModalVisible(true), []);
  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) console.log('[NewsScreen] Location permission granted');
  }, [requestPermission]);

  const handleDetectLocation = useCallback(async (): Promise<SACity | null> => {
    if (permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return null;
    }
    return await detectLocation();
  }, [permissionStatus, requestPermission, detectLocation]);

  const getTimeFilterName = useCallback(
    (filter: TimeFilter) => {
      switch (filter) {
        case 'today': return t('news.today');
        case 'week': return t('news.week');
        case 'month': return t('news.month');
        case 'all': return t('news.all');
        default: return filter;
      }
    },
    [t]
  );

  const ListHeader = useMemo(
    () => (
      <View>
        {/* Location + radius bar (matching carousel style) */}
        <View style={styles.locationBarWrapper}>
          <View style={[styles.controlsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* City pill */}
            <TouchableOpacity
              style={[styles.cityPill, { borderColor: colors.border }]}
              onPress={() => setCityPickerVisible(true)}
            >
              <Ionicons name="location" size={14} color={colors.primary} />
              <Text style={[styles.pillText, { color: colors.text }]} numberOfLines={1}>
                {currentCity?.name || 'Select city'}
              </Text>
              <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Radius dropdown */}
            <TouchableOpacity
              style={[styles.radiusPill, { borderColor: colors.border }]}
              onPress={() => setRadiusVisible(true)}
            >
              <Ionicons name="radio-outline" size={14} color={colors.primary} />
              <Text style={[styles.pillText, { color: colors.text }]}>{radiusKm} km</Text>
              <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab bar */}
        <View style={[styles.tabBar, { borderBottomColor: colors.divider }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'general' && styles.activeTab]}
            onPress={() => setActiveTab('general')}
          >
            <Text style={[styles.tabText, activeTab === 'general' && { color: colors.primary }]}>
              General
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'local' && styles.activeTab]}
            onPress={() => setActiveTab('local')}
          >
            <Text style={[styles.tabText, activeTab === 'local' && { color: colors.primary }]}>
              Local Alerts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Controls for General tab */}
        {activeTab === 'general' && (
          <>
            {/* Weather widget */}
            {currentWeather && currentCity && (
              <WeatherCard
                cityName={currentCity.name}
                temperature={currentWeather.temp}
                description={currentWeather.description}
                icon={currentWeather.icon}
              />
            )}

            {scope === 'local' && permissionStatus !== 'granted' && (
              <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm }}>
                <LocationPermissionModal
                  visible={permissionModalVisible}
                  onClose={() => setPermissionModalVisible(false)}
                  onRequestPermission={handleRequestPermission}
                  permissionDenied={permissionStatus === 'denied'}
                />
              </View>
            )}
            <TimeFilterBar activeFilter={timeFilter} onFilterChange={setTimeFilter} lastUpdated={lastUpdated} />
          </>
        )}

        {/* Local Alerts tab header */}
        {activeTab === 'local' && (
          <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm }}>
            {permissionStatus !== 'granted' || !currentCity ? (
              <Text style={{ color: colors.textSecondary, marginBottom: Spacing.sm }}>
                Location permission required for local alerts.
              </Text>
            ) : (
              <>
                {currentWeather && (
                  <WeatherCard
                    cityName={currentCity.name}
                    temperature={currentWeather.temp}
                    description={currentWeather.description}
                    icon={currentWeather.icon}
                  />
                )}
                {loadshedding && (
                  <InfrastructureCard loadshedding={loadshedding} compact />
                )}
              </>
            )}
          </View>
        )}
      </View>
    ),
    [
      activeTab, currentWeather, currentCity, colors, scope,
      permissionStatus, timeFilter, lastUpdated, handleEnableLocation, t,
      getTimeFilterName, permissionModalVisible, handleRequestPermission,
      loadshedding,
    ]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {activeTab === 'general' ? (
        <NewsList
          articles={news}
          isLoading={newsLoading}
          isRefreshing={newsRefreshing}
          error={newsError}
          lastSynced={lastUpdated?.toISOString() ?? null}
          onRefresh={refreshNews}
          onArticlePress={handleArticlePress}
          ListHeaderComponent={ListHeader}
        />
      ) : (
        <FlatList
          data={localAlerts}
          renderItem={({ item }) => <LocalAlertCard report={item} />}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ color: colors.textSecondary }}>No local alerts at the moment.</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={alertsRefreshing}
              onRefresh={refreshAlerts}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <CityPickerModal
        visible={cityPickerVisible}
        currentCityId={currentCity?.id || ''}
        onSelectCity={(city) => { setCity(city); setCityPickerVisible(false); }}
        onClose={() => setCityPickerVisible(false)}
        onDetectLocation={handleDetectLocation}
      />

      <RadiusPickerModal
        visible={radiusVisible}
        selected={radiusKm}
        onSelect={(r) => { setRadius(r); setRadiusVisible(false); }}
        onClose={() => setRadiusVisible(false)}
      />

      <LocationPermissionModal
        visible={permissionModalVisible}
        onClose={() => setPermissionModalVisible(false)}
        onRequestPermission={handleRequestPermission}
        permissionDenied={permissionStatus === 'denied'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  locationBarWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    flex: 1,
  },
  radiusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  pillText: {
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
  },
  tabBar: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    marginHorizontal: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: '#888',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
});