// app/(stack)/news.tsx
// Phase 3 revised – General News & Local Alerts with location-aware weather card

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Typography, Spacing } from '../../src/config/theme';
import {
  NewsList,
  LocationHeader,
  CityPickerModal,
  ScopeSelector,
  BreakingNewsCarousel,
  NewsStats,
  TimeFilterBar,
  LocationBanner,
  LocationPermissionModal,
} from '../../src/components/news';
import WeatherCard from '../../src/components/news/WeatherCard';
import LocalAlertCard from '../../src/components/local/LocalAlertCard';
import { useLocation } from '../../src/hooks/useLocation';
import { useCurrentWeather } from '../../src/hooks/useCurrentWeather';
import { useNews } from '../../src/hooks/useNews';
import { useLocalAlerts } from '../../src/hooks/useLocalAlerts';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useTheme } from '../../src/contexts';
import type { NewsItem, NewsCategory } from '../../src/types';
import type { TimeFilter } from '../../src/services/news';
import type { LocalReport } from '../../src/types/news';

// Categories that belong to local alerts – filtered OUT of General News
const LOCATION_UPDATE_CATEGORIES = new Set([
  'weather',
  'water',
  'electricity',
  'infrastructure',
  'road',
  'community',
]);

type ActiveTab = 'general' | 'local';

export default function NewsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { preferences } = usePreferences();

  // – Tabs –
  const [activeTab, setActiveTab] = useState<ActiveTab>('general');

  // – Location state –
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const {
    currentCity,
    isDetecting,
    setCity,
    detectLocation,
    scope,
    setScope,
    permissionStatus,
    requestPermission,
  } = useLocation();

  // – Weather (current only) –
  const { weather: currentWeather } = useCurrentWeather();

  // – General News (time filter only – no category bar) –
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');

  const newsScope = useMemo(() => {
    if (scope === 'local') return 'local';
    if (scope === 'national') return 'national';
    return 'national';
  }, [scope]);

  const radiusKm = useMemo(() => preferences.newsRadius || 25, [preferences.newsRadius]);

  const {
    news: allNews,
    breakingNews,
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

  // Filter out location‑update articles
  const news = useMemo(
    () => allNews.filter((article: NewsItem) => !LOCATION_UPDATE_CATEGORIES.has(article.category)),
    [allNews]
  );

  // – Local Alerts –
  const {
    alerts: localAlerts,
    isLoading: alertsLoading,
    isRefreshing: alertsRefreshing,
    refresh: refreshAlerts,
  } = useLocalAlerts();

  // – Handlers –
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

  // – List header (shared for both tabs) –
  const ListHeader = useMemo(
    () => (
      <View>
        {/* Simple weather widget (visible on both tabs if data exists) */}
        {currentWeather && currentCity && (
          <WeatherCard
            cityName={currentCity.name}
            temperature={currentWeather.temp}
            description={currentWeather.description}
            icon={currentWeather.icon}
          />
        )}

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
            <View style={[styles.locationHeaderWrapper, { backgroundColor: colors.surface }]}>
              <LocationHeader
                city={currentCity}
                onChangeCity={() => setCityPickerVisible(true)}
                isLoading={isDetecting}
              />
            </View>
            {scope === 'local' && permissionStatus !== 'granted' && (
              <LocationBanner
                status={permissionStatus}
                onEnablePress={handleEnableLocation}
                cityName={currentCity?.name}
              />
            )}
            {breakingNews.length > 0 && (
              <BreakingNewsCarousel
                articles={breakingNews}
                onArticlePress={handleArticlePress}
              />
            )}
            <ScopeSelector activeScope={scope} onScopeChange={setScope} />
            <TimeFilterBar activeFilter={timeFilter} onFilterChange={setTimeFilter} lastUpdated={lastUpdated} />
            <NewsStats articles={allNews} />
            <View style={styles.resultsBar}>
              <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
                {news.length} {news.length === 1 ? t('news.article') : t('news.articles')}
                {scope === 'local' && currentCity && ` ${t('news.within')} ${radiusKm}km ${t('news.of')} ${currentCity.name}`}
                {scope === 'national' && ` ${t('news.inSouthAfrica')}`}
                {timeFilter !== 'all' && timeFilter !== 'today' && ` • ${getTimeFilterName(timeFilter)}`}
              </Text>
            </View>
          </>
        )}

        {/* Local tab header (no weather forecast, just permission banner if needed) */}
        {activeTab === 'local' && (
          <LocationBanner
            status={permissionStatus}
            onEnablePress={handleEnableLocation}
            cityName={currentCity?.name}
          />
        )}
      </View>
    ),
    [
      activeTab, currentWeather, currentCity, colors, isDetecting,
      scope, permissionStatus, breakingNews, handleArticlePress, timeFilter,
      lastUpdated, radiusKm, handleEnableLocation, t, getTimeFilterName, news.length,
      allNews, setScope,
    ]
  );

  // – Render –
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
        onDetectLocation={detectLocation}
        isDetecting={isDetecting}
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
  tabBar: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
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
  locationHeaderWrapper: {
    paddingTop: 0,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  resultsBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  resultsText: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
});