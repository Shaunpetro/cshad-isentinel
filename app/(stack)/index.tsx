// app/(stack)/index.tsx
// Phase 4 – Home screen with integrated breaking-news carousel

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts';
import { useLocationContext } from '@/contexts/LocationContext';
import { useNews } from '../../src/hooks/useNews';
import {
  CityPickerModal,
  LocationPermissionModal,
} from '../../src/components/news';
import BreakingNewsCarousel from '../../src/components/home/BreakingNewsCarousel';
import SectionNavigator from '../../src/components/home/SectionNavigator';
import FavoritesFeed from '../../src/components/home/FavoritesFeed';

export default function HomeScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  // ── Favorites refresh key ──
  const [favoritesKey, setFavoritesKey] = useState(0);

  // ── Location state (from context) ──
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);

  const {
    currentCity,
    setCity,
    detectLocation,
    radiusKm,
    setRadius,
    permissionStatus,
    requestPermission,
  } = useLocationContext();

  // ── News (only need breaking news) ──
  const { breakingNews, isLoading: newsLoading } = useNews({
    scope: 'local',
    latitude: currentCity?.latitude,
    longitude: currentCity?.longitude,
    cityName: currentCity?.name,
    radiusKm: radiusKm || 25,
    timeFilter: 'today',
    limit: 10,
    realtime: false,
    autoRefresh: false,
  });

  // ── Permission handlers ──
  const handleEnableLocation = useCallback(() => {
    setPermissionModalVisible(true);
  }, []);

  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      console.log('[HomeScreen] Location permission granted');
    }
  }, [requestPermission]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Integrated breaking news carousel (location + radius + headlines) */}
      <BreakingNewsCarousel
        articles={breakingNews}
        isLoading={newsLoading}
        currentCity={currentCity}
        radiusKm={radiusKm || 25}
        onCityPress={() => setCityPickerVisible(true)}
        onRadiusChange={setRadius}
      />

      {/* Dynamic Favorites Feed */}
      <FavoritesFeed refreshKey={favoritesKey} />

      {/* Section Navigator (with visit tracking) */}
      <SectionNavigator
        onSectionPress={() => setFavoritesKey((prev) => prev + 1)}
      />

      {/* City Picker Modal */}
      <CityPickerModal
        visible={cityPickerVisible}
        currentCityId={currentCity?.id || ''}
        onSelectCity={(city) => {
          setCity(city);
          setCityPickerVisible(false);
        }}
        onClose={() => setCityPickerVisible(false)}
        onDetectLocation={detectLocation}
      />

      {/* Location Permission Modal */}
      <LocationPermissionModal
        visible={permissionModalVisible}
        onClose={() => setPermissionModalVisible(false)}
        onRequestPermission={handleRequestPermission}
        permissionDenied={permissionStatus === 'denied'}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16, alignItems: 'center' },
});