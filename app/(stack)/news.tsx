// app/(stack)/news.tsx
// Phase 3C – News feed with weather widget at the top

import React, { useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Typography, Spacing } from "../../src/config/theme";
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
} from "../../src/components/news";
import WeatherCard from "../../src/components/news/WeatherCard";
import { useLocation } from "../../src/hooks/useLocation";
import { useCurrentWeather } from "../../src/hooks/useCurrentWeather";
import { useNews } from "../../src/hooks/useNews";
import { usePreferences } from "../../src/hooks/usePreferences";
import { useTheme } from "../../src/contexts";
import type { NewsItem, NewsCategory } from "../../src/types";
import type { TimeFilter } from "../../src/services/news";

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

  // Weather hook
  const { weather: currentWeather, isLoading: weatherLoading } = useCurrentWeather();

  // Filter states
  const [activeCategory, setActiveCategory] = useState<NewsCategory | "all">("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("today");

  const newsScope = useMemo(() => {
    if (scope === "local") return "local";
    if (scope === "national") return "national";
    return "national";
  }, [scope]);

  const radiusKm = useMemo(() => preferences.newsRadius || 25, [preferences.newsRadius]);

  const {
    news: allNews,
    breakingNews,
    isLoading,
    isRefreshing,
    error,
    refresh,
    lastUpdated,
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

  const news = useMemo(() => {
    if (activeCategory === "all") return allNews;
    return allNews.filter((article: NewsItem) => article.category === activeCategory);
  }, [allNews, activeCategory]);

  const handleArticlePress = useCallback(
    (article: NewsItem) => {
      router.push({ pathname: "/(stack)/article/[id]", params: { id: article.id } });
    },
    [router]
  );

  const handleEnableLocation = useCallback(() => {
    setPermissionModalVisible(true);
  }, []);

  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      console.log("[NewsScreen] Location permission granted");
    }
  }, [requestPermission]);

  const getCategoryName = useCallback(
    (category: string) => {
      const key = `news.categories.${category}`;
      const translated = t(key);
      return translated !== key ? translated : category;
    },
    [t]
  );

  const getTimeFilterName = useCallback(
    (filter: TimeFilter) => {
      switch (filter) {
        case "today": return t("news.today");
        case "week": return t("news.week");
        case "month": return t("news.month");
        case "all": return t("news.all");
        default: return filter;
      }
    },
    [t]
  );

  const ListHeader = useMemo(
    () => (
      <View>
        {/* Weather Widget */}
        {currentWeather && currentCity && (
          <WeatherCard
            cityName={currentCity.name}
            temperature={currentWeather.temp}
            description={currentWeather.description}
            icon={currentWeather.icon}
          />
        )}

        {/* Location Header */}
        <View style={[styles.locationHeaderWrapper, { backgroundColor: colors.surface }]}>
          <LocationHeader
            city={currentCity}
            onChangeCity={() => setCityPickerVisible(true)}
            isLoading={isDetecting}
          />
        </View>

        {/* Location Banner */}
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

        <ScopeSelector activeScope={scope} onScopeChange={setScope} />
        <TimeFilterBar activeFilter={timeFilter} onFilterChange={setTimeFilter} lastUpdated={lastUpdated} />
        <NewsStats articles={allNews} />
        <CategoryFilter activeCategory={activeCategory} onSelect={setActiveCategory} articles={allNews} />

        <View style={styles.resultsBar}>
          <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
            {news.length} {news.length === 1 ? t("news.article") : t("news.articles")}
            {activeCategory !== "all" && ` ${t("common.in")} ${getCategoryName(activeCategory)}`}
            {scope === "local" && currentCity && ` ${t("news.within")} ${radiusKm}km ${t("news.of")} ${currentCity.name}`}
            {scope === "national" && ` ${t("news.inSouthAfrica")}`}
            {timeFilter !== "all" && timeFilter !== "today" && ` • ${getTimeFilterName(timeFilter)}`}
          </Text>
        </View>
      </View>
    ),
    [
      activeCategory, news.length, allNews, currentCity, isDetecting,
      scope, setScope, breakingNews, handleArticlePress, colors, timeFilter,
      lastUpdated, radiusKm, permissionStatus, handleEnableLocation, t,
      getCategoryName, getTimeFilterName, currentWeather,
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
  container: { flex: 1 },
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
});