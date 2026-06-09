// app/(tabs)/index.tsx
import React, { useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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

  // Fetch ALL news first (without category filter) to get available categories
  const {
    news: allNews,
    breakingNews,
    isLoading,
    isRefreshing,
    error,
    refresh,
    lastUpdated,
    totalCount: allNewsCount,
  } = useNews({
    scope: newsScope,
    latitude: currentCity?.latitude,
    longitude: currentCity?.longitude,
    cityName: scope === "local" ? currentCity?.name : undefined,
    radiusKm: scope === "local" ? radiusKm : undefined,
    timeFilter,
    realtime: true,
    autoRefresh: true,
  });

  // Filter news by selected category client-side
  const news = useMemo(() => {
    if (activeCategory === "all") return allNews;
    return allNews.filter((article: NewsItem) => article.category === activeCategory);
  }, [allNews, activeCategory]);

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
      console.log("[NewsScreen] Location permission granted");
    }
  }, [requestPermission]);

  // Get translated category name
  const getCategoryName = useCallback(
    (category: string) => {
      const key = `news.categories.${category}`;
      const translated = t(key);
      return translated !== key ? translated : category;
    },
    [t]
  );

  // Get translated time filter name
  const getTimeFilterName = useCallback(
    (filter: TimeFilter) => {
      switch (filter) {
        case "today":
          return t("news.today");
        case "week":
          return t("news.week");
        case "month":
          return t("news.month");
        case "all":
          return t("news.all");
        default:
          return filter;
      }
    },
    [t]
  );

  // Header component with all filters
  const ListHeader = useMemo(
    () => (
      <View>
        {/* Location Header */}
        <View
          style={[
            styles.locationHeaderWrapper,
            { backgroundColor: colors.surface },
          ]}
        >
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

        {/* News Stats - Collapsible (uses all news for accurate counts) */}
        <NewsStats articles={allNews} />

        {/* Category Filter - Dynamic based on available categories */}
        <CategoryFilter
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          articles={allNews}
        />

        {/* Results count */}
        <View style={styles.resultsBar}>
          <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
            {news.length}{" "}
            {news.length === 1 ? t("news.article") : t("news.articles")}
            {activeCategory !== "all" &&
              ` ${t("common.in")} ${getCategoryName(activeCategory)}`}
            {scope === "local" &&
              currentCity &&
              ` ${t("news.within")} ${radiusKm}km ${t("news.of")} ${currentCity.name}`}
            {scope === "national" && ` ${t("news.inSouthAfrica")}`}
            {timeFilter !== "all" &&
              timeFilter !== "today" &&
              ` • ${getTimeFilterName(timeFilter)}`}
          </Text>
        </View>
      </View>
    ),
    [
      activeCategory,
      news.length,
      allNews,
      currentCity,
      isDetecting,
      scope,
      setScope,
      breakingNews,
      handleArticlePress,
      colors,
      timeFilter,
      lastUpdated,
      radiusKm,
      permissionStatus,
      handleEnableLocation,
      t,
      getCategoryName,
      getTimeFilterName,
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
        currentCityId={currentCity?.id || ""}
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