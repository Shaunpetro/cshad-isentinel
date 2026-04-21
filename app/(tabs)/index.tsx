// app/(tabs)/index.tsx
import React, { useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Typography, Spacing } from "@/config/theme";
import {
  NewsList,
  CategoryFilter,
  LocationHeader,
  CityPickerModal,
  ScopeSelector,
  BreakingNewsCarousel,
  NewsStats,
  TimeFilterBar,
  LocationBanner,
  LocationPermissionModal,
} from "@/components/news";
import { useLocation } from "@/hooks/useLocation";
import { useNews } from "@/hooks/useNews";
import { usePreferences } from "@/hooks/usePreferences";
import { useTheme } from "@/contexts";
import type { NewsItem, NewsCategory } from "@/types";
import type { TimeFilter } from "@/services/news";

export default function NewsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { preferences } = usePreferences();

  // Location state
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

  // Filter states
  const [activeCategory, setActiveCategory] = useState<NewsCategory | "all">("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("today");

  // Map NewsScope to useNews scope
  const newsScope = useMemo(() => {
    if (scope === "local") return "local";
    if (scope === "national") return "national";
    return "national";
  }, [scope]);

  // Get radius from user preferences
  const radiusKm = useMemo(() => {
    return preferences.newsRadius || 25;
  }, [preferences.newsRadius]);

  // Fetch news from Supabase with all filters
  const {
    news,
    breakingNews,
    isLoading,
    isRefreshing,
    error,
    refresh,
    lastUpdated,
    totalCount,
  } = useNews({
    category: activeCategory === "all" ? undefined : activeCategory,
    scope: newsScope,
    latitude: currentCity?.latitude,
    longitude: currentCity?.longitude,
    cityName: scope === "local" ? currentCity?.name : undefined,
    radiusKm: scope === "local" ? radiusKm : undefined,
    timeFilter,
    realtime: true,
    autoRefresh: true,
  });

  // Handle article press - Navigate to detail screen
  const handleArticlePress = useCallback(
    (article: NewsItem) => {
      console.log("[NewsScreen] Navigating to article:", article.id);
      router.push({ pathname: "/news/[id]", params: { id: article.id } });
    },
    [router]
  );

  // Handle location banner press
  const handleEnableLocation = useCallback(() => {
    setPermissionModalVisible(true);
  }, []);

  // Handle permission request from modal
  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      // Location detected automatically after permission granted
      console.log("[NewsScreen] Location permission granted");
    }
  }, [requestPermission]);

  // Header component with all filters
  const ListHeader = useMemo(
    () => (
      <View>
        {/* Location Header */}
        <View style={[styles.locationHeaderWrapper, { backgroundColor: colors.surface }]}>
          <LocationHeader
            city={currentCity}
            onChangeCity={() => setCityPickerVisible(true)}
            isLoading={isDetecting}
          />
        </View>

        {/* Location Banner - shows when location is not granted */}
        {scope === "local" && permissionStatus !== "granted" && (
          <LocationBanner
            status={permissionStatus}
            onEnablePress={handleEnableLocation}
            cityName={currentCity?.name}
          />
        )}

        {/* Breaking News Carousel */}
        {breakingNews.length > 0 && (
          <BreakingNewsCarousel
            articles={breakingNews}
            onArticlePress={handleArticlePress}
          />
        )}

        {/* Scope Selector */}
        <ScopeSelector activeScope={scope} onScopeChange={setScope} />

        {/* Time Filter Bar */}
        <TimeFilterBar
          activeFilter={timeFilter}
          onFilterChange={setTimeFilter}
          lastUpdated={lastUpdated}
        />

        {/* News Stats - Collapsible */}
        <NewsStats articles={news} />

        {/* Category Filter */}
        <CategoryFilter
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* Results count */}
        <View style={styles.resultsBar}>
          <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
            {totalCount !== null ? totalCount : news.length}{" "}
            {(totalCount ?? news.length) === 1 ? "article" : "articles"}
            {activeCategory !== "all" && ` in ${activeCategory}`}
            {scope === "local" && currentCity && ` within ${radiusKm}km of ${currentCity.name}`}
            {scope === "national" && " in South Africa"}
            {timeFilter !== "all" && timeFilter !== "today" && ` • ${timeFilter}`}
          </Text>
        </View>
      </View>
    ),
    [
      activeCategory,
      news.length,
      totalCount,
      currentCity,
      isDetecting,
      scope,
      setScope,
      breakingNews,
      handleArticlePress,
      news,
      colors,
      timeFilter,
      lastUpdated,
      radiusKm,
      permissionStatus,
      handleEnableLocation,
    ]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <NewsList
        articles={news}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        lastSynced={lastUpdated?.toISOString() ?? null}
        onRefresh={refresh}
        onArticlePress={handleArticlePress}
        ListHeaderComponent={ListHeader}
      />

      {/* City Picker Modal */}
      <CityPickerModal
        visible={cityPickerVisible}
        currentCityId={currentCity.id}
        onSelectCity={(city) => {
          setCity(city);
          setCityPickerVisible(false);
        }}
        onClose={() => setCityPickerVisible(false)}
        onDetectLocation={detectLocation}
        isDetecting={isDetecting}
      />

      {/* Location Permission Modal */}
      <LocationPermissionModal
        visible={permissionModalVisible}
        onClose={() => setPermissionModalVisible(false)}
        onRequestPermission={handleRequestPermission}
        permissionDenied={permissionStatus === "denied"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  locationHeaderWrapper: {
    paddingTop: 60,
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
});