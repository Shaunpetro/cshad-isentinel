// app/(stack)/index.tsx
// Phase 1 – Home screen with location bar, radius selector, breaking-news carousel, dynamic favorites

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts';
import { useLocation } from '../../src/hooks/useLocation';
import { useNews } from '../../src/hooks/useNews';
import {
  LocationHeader,
  CityPickerModal,
  LocationPermissionModal,
} from '../../src/components/news';
import SectionNavigator from '../../src/components/home/SectionNavigator';
import BreakingNewsCarousel from '../../src/components/home/BreakingNewsCarousel';
import FavoritesFeed from '../../src/components/home/FavoritesFeed';

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

export default function HomeScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  // ── Favorites refresh key ──
  const [favoritesKey, setFavoritesKey] = useState(0);

  // ── Location state ──
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);

  const {
    currentCity,
    isDetecting,
    setCity,
    detectLocation,
    radiusKm,
    setRadius,
    permissionStatus,
    requestPermission,
  } = useLocation();

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
      {/* Compact location bar */}
      <View style={[styles.locationBar, { backgroundColor: theme.colors.surface }]}>
        <LocationHeader
          city={currentCity}
          onChangeCity={() => setCityPickerVisible(true)}
          isLoading={isDetecting}
        />
      </View>

      {/* Radius selector */}
      <View style={styles.radiusRow}>
        <Text style={[styles.radiusLabel, { color: theme.colors.textSecondary }]}>Radius:</Text>
        {RADIUS_OPTIONS.map((r) => {
          const isActive = r === (radiusKm || 25);
          return (
            <TouchableOpacity
              key={r}
              onPress={() => setRadius(r)}
              style={[
                styles.radiusPill,
                {
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
                  borderColor: isActive ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.radiusPillText,
                  { color: isActive ? '#FFFFFF' : theme.colors.text },
                ]}
              >
                {r}km
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Breaking News Carousel */}
      <BreakingNewsCarousel articles={breakingNews} isLoading={newsLoading} />

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
        isDetecting={isDetecting}
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
  content: { padding: 16, gap: 24, alignItems: 'center' },
  locationBar: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    width: '100%',
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  radiusLabel: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
  },
  radiusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  radiusPillText: {
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
  },
});