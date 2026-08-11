// app/(stack)/index.tsx
// Beta 4 – Home screen with separate Favorites and Explore CSHAD cards

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/contexts';
import { useLocationContext } from '@/contexts/LocationContext';
import { useNews } from '../../src/hooks/useNews';
import { CityPickerModal, LocationPermissionModal } from '../../src/components/news';
import BreakingNewsCarousel from '../../src/components/home/BreakingNewsCarousel';
import SectionNavigator from '../../src/components/home/SectionNavigator';
import FavoritesFeed from '../../src/components/home/FavoritesFeed';

export default function HomeScreen() {
  const theme = useTheme();

  const [favoritesKey, setFavoritesKey] = useState(0);
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

  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) console.log('[HomeScreen] Location permission granted');
  }, [requestPermission]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Integrated breaking news carousel */}
      <BreakingNewsCarousel
        articles={breakingNews}
        isLoading={newsLoading}
        currentCity={currentCity}
        radiusKm={radiusKm || 25}
        onCityPress={() => setCityPickerVisible(true)}
        onRadiusChange={setRadius}
      />

      {/* Your Favorites – separate card */}
      <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          ⭐ Your Favorites
        </Text>
        <FavoritesFeed refreshKey={favoritesKey} />
      </View>

      {/* Explore CSHAD – separate card */}
      <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          Explore CSHAD
        </Text>
        <SectionNavigator onSectionPress={() => setFavoritesKey((prev) => prev + 1)} />
      </View>

      <CityPickerModal
        visible={cityPickerVisible}
        currentCityId={currentCity?.id || ''}
        onSelectCity={(city) => { setCity(city); setCityPickerVisible(false); }}
        onClose={() => setCityPickerVisible(false)}
        onDetectLocation={detectLocation}
      />

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
  content: { padding: 16, gap: 20, alignItems: 'center' },
  sectionCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
  },
});