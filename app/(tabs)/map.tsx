// app/(tabs)/map.tsx
import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Callout, Circle } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "@/hooks/useLocation";
import {
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "@/config/theme";
import { APP } from "@/config/constants";
import { useMapData } from "@/hooks/useMapData";
import type { MapMarker } from "@/services/map";

// Default zoom levels
const ZOOM_LEVELS = {
  city: { latitudeDelta: 0.15, longitudeDelta: 0.15 },
  region: { latitudeDelta: 0.5, longitudeDelta: 0.5 },
  country: { latitudeDelta: 12, longitudeDelta: 12 },
};

// Major cities for the quick-access buttons
const MAJOR_CITIES: {
  key: string;
  label: string;
  fullName: string;
  aliases: string[];
  latitude: number;
  longitude: number;
}[] = [
  { 
    key: 'johannesburg', 
    label: 'JHB', 
    fullName: 'Johannesburg',
    aliases: ['joburg', 'jozi', 'jhb', 'soweto', 'sandton', 'randburg', 'roodepoort', 'midrand'],
    latitude: -26.2041, 
    longitude: 28.0473 
  },
  { 
    key: 'capeTown', 
    label: 'CPT', 
    fullName: 'Cape Town',
    aliases: ['kaapstad', 'cpt', 'bellville', 'stellenbosch', 'paarl', 'table bay'],
    latitude: -33.9249, 
    longitude: 18.4241 
  },
  { 
    key: 'durban', 
    label: 'DBN', 
    fullName: 'Durban',
    aliases: ['ethekwini', 'dbn', 'umhlanga', 'pinetown', 'umlazi'],
    latitude: -29.8587, 
    longitude: 31.0218 
  },
  { 
    key: 'pretoria', 
    label: 'PTA', 
    fullName: 'Pretoria',
    aliases: ['tshwane', 'pta', 'centurion', 'brits', 'hartbeespoort', 'akasia', 'soshanguve'],
    latitude: -25.7479, 
    longitude: 28.2293 
  },
];

// Marker colors by type and severity
const getMarkerColor = (marker: MapMarker): string => {
  if (marker.type === 'tip') {
    return '#9C27B0';
  }
  switch (marker.severity) {
    case 'critical': return '#FF1744';
    case 'high': return '#FF5722';
    case 'medium': return '#FFC107';
    case 'low': 
    default: return '#4CAF50';
  }
};

// Category icons
const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    crime: 'warning',
    accident: 'car',
    fire: 'flame',
    weather: 'cloud',
    infrastructure: 'construct',
    traffic: 'car-sport',
    politics: 'megaphone',
    health: 'medkit',
  };
  return icons[category] || 'alert-circle';
};

/**
 * Find which major city button should be highlighted
 * Based on either direct name match, alias match, or proximity
 */
const findMatchingMajorCity = (
  cityName: string | undefined,
  latitude: number | undefined,
  longitude: number | undefined
): string | null => {
  if (!cityName && (latitude == null || longitude == null)) {
    return null;
  }

  const lowerCityName = cityName?.toLowerCase() || '';

  // 1. Check for direct name match or alias match
  for (const majorCity of MAJOR_CITIES) {
    // Direct name match
    if (majorCity.fullName.toLowerCase() === lowerCityName) {
      return majorCity.key;
    }
    
    // Alias match (e.g., "Brits" → "Pretoria", "Soweto" → "Johannesburg")
    if (majorCity.aliases.some(alias => 
      lowerCityName.includes(alias) || alias.includes(lowerCityName)
    )) {
      return majorCity.key;
    }
  }

  // 2. If we have coordinates, find closest major city
  if (latitude != null && longitude != null) {
    let closestCity: string | null = null;
    let minDistance = Infinity;

    for (const majorCity of MAJOR_CITIES) {
      const distance = Math.sqrt(
        Math.pow(majorCity.latitude - latitude, 2) +
        Math.pow(majorCity.longitude - longitude, 2)
      );
      
      // Only match if within ~150km (roughly 1.5 degrees)
      if (distance < minDistance && distance < 1.5) {
        minDistance = distance;
        closestCity = majorCity.key;
      }
    }

    return closestCity;
  }

  return null;
};

export default function MapScreen() {
  const { colors } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showNews, setShowNews] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const [showRadius, setShowRadius] = useState(true);
  const [viewMode, setViewMode] = useState<'myArea' | 'national'>('myArea');

  // Get user location context - now using the full SACity object
  const {
    currentCity,
    radiusKm,
    isLoading: locationLoading,
    permissionStatus,
  } = useLocation();

  // Extract coordinates and name from currentCity
  const userLat = currentCity?.latitude;
  const userLng = currentCity?.longitude;
  const cityName = currentCity?.name;

  // Determine which major city button to highlight
  const activeCity = useMemo(() => {
    return findMatchingMajorCity(cityName, userLat, userLng);
  }, [cityName, userLat, userLng]);

  // Fetch map data
  const {
    markers,
    newsCount,
    tipsCount,
    isLoading: dataLoading,
    error,
    refresh,
  } = useMapData({
    includeNews: showNews,
    includeTips: showTips,
    realtime: true,
  });

  // Calculate initial region based on user's location
  const initialRegion = useMemo(() => {
    // If we have a current city with coordinates, use it
    if (userLat && userLng) {
      return {
        latitude: userLat,
        longitude: userLng,
        ...ZOOM_LEVELS.city,
      };
    }

    // Fallback to SA center
    return {
      latitude: APP.defaultRegion.latitude,
      longitude: APP.defaultRegion.longitude,
      ...ZOOM_LEVELS.country,
    };
  }, [userLat, userLng]);

  // Animate to user's location when map is ready and we have location
  useEffect(() => {
    if (mapReady && mapRef.current && userLat && userLng && viewMode === 'myArea') {
      // Small delay to ensure map is fully ready
      const timer = setTimeout(() => {
        mapRef.current?.animateToRegion(
          {
            latitude: userLat,
            longitude: userLng,
            ...ZOOM_LEVELS.city,
          },
          1000
        );
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [mapReady, userLat, userLng, viewMode]);

  // Filter markers by proximity if in "My Area" mode
  const visibleMarkers = useMemo(() => {
    if (viewMode === 'national' || !userLat || !userLng) {
      return markers;
    }

    // Filter to markers within radius
    const radiusInDegrees = (radiusKm || 25) / 111; // Rough conversion: 1 degree ≈ 111km
    return markers.filter((marker) => {
      const distance = Math.sqrt(
        Math.pow(marker.latitude - userLat, 2) +
        Math.pow(marker.longitude - userLng, 2)
      );
      return distance <= radiusInDegrees;
    });
  }, [markers, viewMode, userLat, userLng, radiusKm]);

  const handleMarkerPress = useCallback((marker: MapMarker) => {
    setSelectedId(marker.id);
  }, []);

  const handleMyAreaPress = useCallback(() => {
    setViewMode('myArea');
    if (mapRef.current && userLat && userLng) {
      mapRef.current.animateToRegion(
        {
          latitude: userLat,
          longitude: userLng,
          ...ZOOM_LEVELS.city,
        },
        800
      );
    }
  }, [userLat, userLng]);

  const handleNationalPress = useCallback(() => {
    setViewMode('national');
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: APP.defaultRegion.latitude,
          longitude: APP.defaultRegion.longitude,
          ...ZOOM_LEVELS.country,
        },
        800
      );
      setSelectedId(null);
    }
  }, []);

  const handleZoomToCity = useCallback((cityKey: string) => {
    const city = MAJOR_CITIES.find((c) => c.key === cityKey);
    if (mapRef.current && city) {
      setViewMode('myArea');
      mapRef.current.animateToRegion(
        {
          latitude: city.latitude,
          longitude: city.longitude,
          ...ZOOM_LEVELS.city,
        },
        800
      );
    }
  }, []);

  const handleMapReady = useCallback(() => {
    setMapReady(true);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const isLoading = locationLoading || dataLoading;
  const errorColor = '#FF4757';
  const currentRadiusKm = radiusKm || 25;

  // Determine location display text
  const locationDisplayText = useMemo(() => {
    if (viewMode === 'national') {
      return '🇿🇦 South Africa';
    }
    
    if (cityName) {
      // Show city name with province if available
      const province = currentCity?.province;
      if (province && !cityName.includes(province)) {
        return `📍 ${cityName}, ${currentCity?.provinceCode || province}`;
      }
      return `📍 ${cityName}`;
    }
    
    if (permissionStatus === 'denied') {
      return '📍 Location disabled';
    }
    
    return '📍 Detecting...';
  }, [viewMode, cityName, currentCity, permissionStatus]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onMapReady={handleMapReady}
        onPress={() => setSelectedId(null)}
        mapType="standard"
        showsUserLocation={permissionStatus === 'granted'}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        loadingIndicatorColor={colors.primary}
        loadingBackgroundColor={colors.background}
      >
        {/* User location radius circle */}
        {mapReady && showRadius && userLat && userLng && viewMode === 'myArea' && (
          <Circle
            center={{ latitude: userLat, longitude: userLng }}
            radius={currentRadiusKm * 1000}
            strokeWidth={2}
            strokeColor={colors.primary + '80'}
            fillColor={colors.primary + '15'}
          />
        )}

        {/* Markers */}
        {mapReady &&
          visibleMarkers.map((marker) => (
            <Marker
              key={`${marker.type}-${marker.id}`}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              onPress={() => handleMarkerPress(marker)}
              tracksViewChanges={false}
            >
              <View
                style={[
                  styles.markerContainer,
                  { backgroundColor: getMarkerColor(marker) },
                ]}
              >
                <Ionicons
                  name={
                    marker.type === 'tip'
                      ? 'chatbubble'
                      : getCategoryIcon(marker.category)
                  }
                  size={16}
                  color="#FFFFFF"
                />
              </View>

              <Callout tooltip>
                <View style={[styles.callout, { backgroundColor: colors.surface }]}>
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor:
                          marker.type === 'tip' ? '#9C27B0' : colors.primary,
                      },
                    ]}
                  >
                    <Text style={styles.typeBadgeText}>
                      {marker.type === 'tip' ? '🟣 Community Tip' : '📰 News'}
                    </Text>
                  </View>

                  <Text
                    style={[styles.calloutTitle, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {marker.title}
                  </Text>

                  {marker.description && (
                    <Text
                      style={[
                        styles.calloutDescription,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={2}
                    >
                      {marker.description}
                    </Text>
                  )}

                  <View style={styles.calloutMeta}>
                    <Text style={[styles.calloutLocation, { color: colors.primary }]}>
                      📍 {marker.matchedLocation}
                    </Text>
                    <Text
                      style={[styles.calloutTime, { color: colors.textSecondary }]}
                    >
                      {formatTimestamp(marker.timestamp)}
                    </Text>
                  </View>

                  {marker.confidence !== 'exact' && (
                    <Text
                      style={[
                        styles.confidenceText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      📌 Location: {marker.confidence}
                    </Text>
                  )}
                </View>
              </Callout>
            </Marker>
          ))}
      </MapView>

      {/* Loading overlay */}
      {(!mapReady || isLoading) && (
        <View
          style={[styles.loadingOverlay, { backgroundColor: colors.background }]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {locationLoading
              ? 'Getting your location...'
              : dataLoading
              ? 'Loading safety data...'
              : 'Loading map...'}
          </Text>
        </View>
      )}

      {/* Error message */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: errorColor }]}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={refresh}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* Top bar */}
      <SafeAreaView
        style={[styles.topBar, { backgroundColor: colors.surface + 'F0' }]}
        edges={['top']}
      >
        <View style={styles.topBarContent}>
          <View style={styles.topBarLeft}>
            <Text style={[styles.title, { color: colors.text }]}>Safety Map</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {locationDisplayText}
              {viewMode === 'myArea' && cityName && ` • ${currentRadiusKm}km`}
            </Text>
          </View>
          <View style={styles.topBarRight}>
            <Text style={[styles.statText, { color: colors.primary }]}>
              {visibleMarkers.length} pins
            </Text>
            {viewMode === 'myArea' && markers.length !== visibleMarkers.length && (
              <Text style={[styles.statSubtext, { color: colors.textSecondary }]}>
                of {markers.length} total
              </Text>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* View mode toggle */}
      <View style={[styles.viewModeBar, { backgroundColor: colors.surface + 'F0' }]}>
        <Pressable
          onPress={handleMyAreaPress}
          style={[
            styles.viewModeButton,
            viewMode === 'myArea' && { backgroundColor: colors.primary + '20' },
          ]}
        >
          <Ionicons
            name="locate"
            size={18}
            color={viewMode === 'myArea' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.viewModeText,
              { color: viewMode === 'myArea' ? colors.primary : colors.textSecondary },
            ]}
          >
            My Area
          </Text>
        </Pressable>

        <Pressable
          onPress={handleNationalPress}
          style={[
            styles.viewModeButton,
            viewMode === 'national' && { backgroundColor: colors.primary + '20' },
          ]}
        >
          <Text style={styles.flagEmoji}>🇿🇦</Text>
          <Text
            style={[
              styles.viewModeText,
              {
                color:
                  viewMode === 'national' ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            All SA
          </Text>
        </Pressable>

        <View style={styles.viewModeDivider} />

        <Pressable onPress={refresh} style={styles.iconButton}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </Pressable>

        <Pressable
          onPress={() => setShowRadius(!showRadius)}
          style={styles.iconButton}
        >
          <Ionicons
            name={showRadius ? 'radio-button-on' : 'radio-button-off'}
            size={20}
            color={showRadius ? colors.primary : colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* Filter toggles */}
      <View style={[styles.filterBar, { backgroundColor: colors.surface + 'F0' }]}>
        <Pressable
          onPress={() => setShowNews(!showNews)}
          style={[
            styles.filterButton,
            showNews && { backgroundColor: colors.primary + '20' },
          ]}
        >
          <Text
            style={[
              styles.filterButtonText,
              { color: showNews ? colors.primary : colors.textSecondary },
            ]}
          >
            📰 News ({newsCount})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setShowTips(!showTips)}
          style={[
            styles.filterButton,
            showTips && { backgroundColor: '#9C27B0' + '20' },
          ]}
        >
          <Text
            style={[
              styles.filterButtonText,
              { color: showTips ? '#9C27B0' : colors.textSecondary },
            ]}
          >
            🟣 Tips ({tipsCount})
          </Text>
        </Pressable>
      </View>

      {/* Quick city buttons */}
      <View style={styles.cityBar}>
        {MAJOR_CITIES.map((city) => {
          const isActive = activeCity === city.key;
          return (
            <Pressable
              key={city.key}
              onPress={() => handleZoomToCity(city.key)}
              style={({ pressed }) => [
                styles.cityButton,
                { 
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderColor: isActive ? colors.primary : 'transparent',
                },
                pressed && styles.buttonPressed,
              ]}
            >
              <Text
                style={[
                  styles.cityLabel,
                  { color: isActive ? '#FFFFFF' : colors.text },
                ]}
              >
                {city.label}
              </Text>
              {isActive && (
                <View style={styles.activeIndicator}>
                  <Ionicons name="location" size={10} color="#FFFFFF" />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: colors.surface + 'F0' }]}>
        <Text style={[styles.legendTitle, { color: colors.text }]}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF1744' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Critical
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF5722' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              High
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Medium
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Low
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#9C27B0' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Tip
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.md,
  },
  errorBanner: {
    position: 'absolute',
    top: 100,
    left: Spacing.md,
    right: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 15,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.caption,
    flex: 1,
  },
  retryText: {
    color: '#FFFFFF',
    fontFamily: Typography.fonts.bold,
    marginLeft: Spacing.md,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    zIndex: 10,
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  topBarLeft: {
    flex: 1,
  },
  topBarRight: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
  },
  subtitle: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
  statText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
  },
  statSubtext: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
  viewModeBar: {
    position: 'absolute',
    top: 95,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
    zIndex: 10,
    gap: Spacing.xs,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  viewModeText: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.medium,
  },
  flagEmoji: {
    fontSize: 16,
  },
  viewModeDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginHorizontal: Spacing.xs,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  filterBar: {
    position: 'absolute',
    top: 145,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
    zIndex: 10,
    gap: Spacing.xs,
  },
  filterButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  filterButtonText: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.medium,
  },
  cityBar: {
    position: 'absolute',
    top: 95,
    right: 12,
    zIndex: 10,
    gap: Spacing.xs,
  },
  cityButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    minWidth: 50,
    alignItems: 'center',
    ...Shadows.sm,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  cityLabel: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.bold,
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF5722',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    zIndex: 10,
  },
  legendTitle: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.xs,
  },
  legendItems: {
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Shadows.md,
  },
  callout: {
    width: 250,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.lg,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.bold,
  },
  calloutTitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.xs,
  },
  calloutDescription: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
    marginBottom: Spacing.xs,
  },
  calloutMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calloutLocation: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.medium,
  },
  calloutTime: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.mono,
  },
  confidenceText: {
    fontSize: 10,
    fontFamily: Typography.fonts.mono,
    marginTop: 4,
    fontStyle: 'italic',
  },
});