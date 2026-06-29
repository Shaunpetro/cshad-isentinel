// app/(stack)/map.tsx
// Beta 4 - Phase 1: Map stack screen

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Callout, Circle } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../src/contexts/ThemeContext";
import { useLocation } from "../../src/hooks/useLocation";
import { Typography, Spacing, BorderRadius, Shadows } from "../../src/config/theme";
import { APP } from "../../src/config/constants";
import { useMapData } from "../../src/hooks/useMapData";
import { METRO_QUICK_ACCESS } from "../../src/services/location/saCities";
import { HazardReportModal } from "../../src/components/hub/HazardReportModal";
import {
  fetchHazards,
  voteHazardCleared,
  voteHazardStillThere,
} from "../../src/services/map/mapService";
import type { MapMarker } from "../../src/services/map";

// Hazard SVG icons
import PotholeIcon from '../../assets/hazard-icons/pothole.svg';
import BurstPipeIcon from '../../assets/hazard-icons/burst-pipe.svg';
import PowerLineIcon from '../../assets/hazard-icons/power-line.svg';
import RoadClosureIcon from '../../assets/hazard-icons/road-closure.svg';
import AccidentIcon from '../../assets/hazard-icons/accident.svg';
import OtherIcon from '../../assets/hazard-icons/other.svg';

const HAZARD_ICONS: Record<string, React.FC<{ width: number; height: number }>> = {
  pothole: PotholeIcon,
  burst_pipe: BurstPipeIcon,
  power_line: PowerLineIcon,
  road_closure: RoadClosureIcon,
  accident: AccidentIcon,
  other: OtherIcon,
};

const ZOOM_LEVELS = {
  city: { latitudeDelta: 0.15, longitudeDelta: 0.15 },
  region: { latitudeDelta: 0.5, longitudeDelta: 0.5 },
  country: { latitudeDelta: 12, longitudeDelta: 12 },
};

const MAJOR_CITIES = METRO_QUICK_ACCESS.map((loc) => ({
  key: loc.key,
  label: loc.label,
  fullName: loc.fullName,
  aliases: loc.aliases,
  latitude: loc.latitude,
  longitude: loc.longitude,
}));

const getMarkerColor = (marker: MapMarker): string => {
  if (marker.type === 'tip') return '#9C27B0';
  if (marker.type === 'hazard') return '#FF6D00';
  switch (marker.severity) {
    case 'critical': return '#FF1744';
    case 'high': return '#FF5722';
    case 'medium': return '#FFC107';
    case 'low':
    default: return '#4CAF50';
  }
};

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

const findMatchingMajorCity = (
  cityName: string | undefined,
  latitude: number | undefined,
  longitude: number | undefined
): string | null => {
  if (!cityName && (latitude == null || longitude == null)) return null;
  const lowerCityName = cityName?.toLowerCase() || '';
  for (const majorCity of MAJOR_CITIES) {
    if (majorCity.fullName.toLowerCase() === lowerCityName) return majorCity.key;
    if (majorCity.label.toLowerCase() === lowerCityName) return majorCity.key;
    if (majorCity.aliases.some(alias => {
      const aliasLower = alias.toLowerCase();
      return lowerCityName === aliasLower || (lowerCityName.includes(aliasLower) && aliasLower.length > 4);
    })) return majorCity.key;
  }
  if (latitude != null && longitude != null) {
    let closestCity: string | null = null;
    let minDistance = Infinity;
    for (const majorCity of MAJOR_CITIES) {
      const dLat = majorCity.latitude - latitude;
      const dLon = majorCity.longitude - longitude;
      const distance = Math.sqrt(dLat * dLat + dLon * dLon);
      if (distance < minDistance && distance < 0.5) {
        minDistance = distance;
        closestCity = majorCity.key;
      }
    }
    return closestCity;
  }
  return null;
};

// Voting confirmation modal
function VoteModal({ type, visible, onHide }: { type: 'cleared' | 'still-there' | null; visible: boolean; onHide: () => void }) {
  if (!visible || !type) return null;
  const isCleared = type === 'cleared';
  return (
    <View style={styles.voteModalContainer}>
      <View style={[styles.voteModal, { backgroundColor: isCleared ? '#4CAF50' : '#2196F3' }]}>
        <Ionicons
          name={isCleared ? 'checkmark-circle' : 'shield-checkmark'}
          size={48}
          color="#fff"
        />
        <Text style={styles.voteModalText}>
          {isCleared ? 'Hazard reported cleared' : 'Hazard still there'}
        </Text>
        <Text style={styles.voteModalSubtext}>
          Thank you for your vote!
        </Text>
      </View>
    </View>
  );
}

export default function MapScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showNews, setShowNews] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const [showRadius, setShowRadius] = useState(true);
  const [viewMode, setViewMode] = useState<'myArea' | 'national'>('myArea');
  const [hazardModalVisible, setHazardModalVisible] = useState(false);
  const [hazardMarkers, setHazardMarkers] = useState<MapMarker[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [voteModalType, setVoteModalType] = useState<'cleared' | 'still-there' | null>(null);
  const [voteModalVisible, setVoteModalVisible] = useState(false);
  const hasAnimatedToCity = useRef<string | null>(null);

  const {
    currentCity,
    radiusKm,
    isLoading: locationLoading,
    permissionStatus,
    refresh: refreshLocation,
  } = useLocation();

  useFocusEffect(
    useCallback(() => {
      refreshLocation();
      loadHazards();
    }, [refreshLocation])
  );

  const loadHazards = () => {
    fetchHazards().then((hazards) => {
      if (hazards) {
        setHazardMarkers(hazards.map((h: any) => ({
          id: h.id,
          type: 'hazard' as const,
          title: h.category.replace('_', ' ').toUpperCase(),
          description: h.description,
          latitude: h.latitude,
          longitude: h.longitude,
          category: h.category,
          severity: (h.severity as MapMarker['severity']) || 'medium',
          timestamp: h.created_at,
          matchedLocation: h.location_name || 'Unknown',
          confidence: 'exact' as const,
        })));
      }
    });
  };

  const userLat = currentCity?.latitude;
  const userLng = currentCity?.longitude;
  const cityName = currentCity?.name;
  const cityId = currentCity?.id;

  const activeCity = useMemo(() => findMatchingMajorCity(cityName, userLat, userLng), [cityName, userLat, userLng]);

  const {
    markers: newsTipMarkers,
    newsCount,
    tipsCount,
    isLoading: dataLoading,
    error,
    refresh,
  } = useMapData({ includeNews: showNews, includeTips: showTips, realtime: true });

  const allMarkers = useMemo(() => [...newsTipMarkers, ...hazardMarkers], [newsTipMarkers, hazardMarkers]);

  const initialRegion = useMemo(() => {
    if (userLat && userLng) {
      return { latitude: userLat, longitude: userLng, ...ZOOM_LEVELS.city };
    }
    return { latitude: APP.defaultRegion.latitude, longitude: APP.defaultRegion.longitude, ...ZOOM_LEVELS.country };
  }, [userLat, userLng]);

  useEffect(() => {
    if (mapReady && mapRef.current && userLat && userLng && viewMode === 'myArea') {
      if (hasAnimatedToCity.current !== cityId) {
        hasAnimatedToCity.current = cityId || null;
        const timer = setTimeout(() => {
          mapRef.current?.animateToRegion({ latitude: userLat, longitude: userLng, ...ZOOM_LEVELS.city }, 800);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [mapReady, userLat, userLng, viewMode, cityId, cityName]);

  const visibleMarkers = useMemo(() => {
    if (viewMode === 'national' || !userLat || !userLng) return allMarkers;
    const radiusInDegrees = (radiusKm || 25) / 111;
    return allMarkers.filter(marker => {
      const distance = Math.sqrt(
        Math.pow(marker.latitude - userLat, 2) + Math.pow(marker.longitude - userLng, 2)
      );
      return distance <= radiusInDegrees;
    });
  }, [allMarkers, viewMode, userLat, userLng, radiusKm]);

  const visibleNewsCount = visibleMarkers.filter(m => m.type === 'news').length;
  const visibleTipsCount = visibleMarkers.filter(m => m.type === 'tip').length;
  const visibleHazardCount = visibleMarkers.filter(m => m.type === 'hazard').length;

  const handleMarkerPress = useCallback((marker: MapMarker) => setSelectedId(marker.id), []);
  const handleMyAreaPress = useCallback(() => {
    setViewMode('myArea');
    if (mapRef.current && userLat && userLng) {
      mapRef.current.animateToRegion({ latitude: userLat, longitude: userLng, ...ZOOM_LEVELS.city }, 800);
    }
  }, [userLat, userLng]);
  const handleNationalPress = useCallback(() => {
    setViewMode('national');
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        { latitude: APP.defaultRegion.latitude, longitude: APP.defaultRegion.longitude, ...ZOOM_LEVELS.country },
        800
      );
      setSelectedId(null);
    }
  }, []);
  const handleZoomToCity = useCallback((cityKey: string) => {
    const city = MAJOR_CITIES.find(c => c.key === cityKey);
    if (mapRef.current && city) {
      setViewMode('myArea');
      mapRef.current.animateToRegion({ latitude: city.latitude, longitude: city.longitude, ...ZOOM_LEVELS.city }, 800);
    }
  }, []);
  const handleTipsToggle = useCallback(() => {
    if (!showTips) {
      setShowTips(true);
      if (newsTipMarkers.some(m => m.type === 'tip') && mapRef.current) {
        const tipMarkers = newsTipMarkers.filter(m => m.type === 'tip');
        if (tipMarkers.length > 0) {
          const lats = tipMarkers.map(m => m.latitude);
          const lngs = tipMarkers.map(m => m.longitude);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          mapRef.current.animateToRegion({
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.1),
            longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.1),
          }, 800);
          setViewMode('national');
        }
      }
    } else {
      setShowTips(false);
    }
  }, [showTips, newsTipMarkers]);
  const handleMapReady = useCallback(() => setMapReady(true), []);

  const handleVoteCleared = useCallback(async (hazardId: string) => {
    await voteHazardCleared(hazardId);
    setVoteModalType('cleared');
    setVoteModalVisible(true);
    setTimeout(() => {
      setVoteModalVisible(false);
      setVoteModalType(null);
    }, 10000);
    loadHazards();
  }, []);

  const handleVoteStillThere = useCallback(async (hazardId: string) => {
    await voteHazardStillThere(hazardId);
    setVoteModalType('still-there');
    setVoteModalVisible(true);
    setTimeout(() => {
      setVoteModalVisible(false);
      setVoteModalType(null);
    }, 10000);
    loadHazards();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return t('time.justNow');
    if (diffHours < 24) return t('time.hoursAgo', { count: diffHours });
    return date.toLocaleDateString();
  };
  const getConfidenceText = (confidence: string) => {
    switch (confidence) {
      case 'exact': return t('map.confidence.exact');
      case 'city': return t('map.confidence.city');
      case 'province': return t('map.confidence.province');
      case 'approximate': return t('map.confidence.approximate');
      default: return confidence;
    }
  };

  const isLoading = locationLoading || dataLoading;
  const currentRadiusKm = radiusKm || 25;
  const locationDisplayText = useMemo(() => {
    if (viewMode === 'national') return '🇿🇦 South Africa';
    if (cityName) {
      const province = currentCity?.province;
      if (province && !cityName.includes(province)) {
        return `📍 ${cityName}, ${currentCity?.provinceCode || province}`;
      }
      return `📍 ${cityName}`;
    }
    if (permissionStatus === 'denied') return `📍 ${t('location.permissionDenied')}`;
    return `📍 ${t('location.detecting')}`;
  }, [viewMode, cityName, currentCity, permissionStatus, t]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        {mapReady && showRadius && userLat && userLng && viewMode === 'myArea' && (
          <Circle
            center={{ latitude: userLat, longitude: userLng }}
            radius={currentRadiusKm * 1000}
            strokeWidth={2}
            strokeColor={colors.primary + '80'}
            fillColor={colors.primary + '15'}
          />
        )}

        {mapReady && visibleMarkers.map((marker) => (
          <Marker
            key={`${marker.type}-${marker.id}`}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            onPress={() => handleMarkerPress(marker)}
            tracksViewChanges={false}
          >
            <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(marker) }]}>
              {marker.type === 'hazard' ? (
                React.createElement(HAZARD_ICONS[marker.category] || HAZARD_ICONS.other, {
                  width: 20,
                  height: 20,
                })
              ) : (
                <Ionicons
                  name={marker.type === 'tip' ? 'chatbubble' : getCategoryIcon(marker.category)}
                  size={16}
                  color="#FFFFFF"
                />
              )}
            </View>

            {marker.type === 'hazard' ? (
              <Callout tooltip onPress={() => {}}>
                <View style={[styles.callout, { backgroundColor: colors.surface }]}>
                  <View style={[styles.typeBadge, { backgroundColor: '#FF6D00' }]}>
                    <Text style={styles.typeBadgeText}>⚠️ Hazard</Text>
                  </View>
                  <Text style={[styles.calloutTitle, { color: colors.text }]} numberOfLines={2}>
                    {marker.title}
                  </Text>
                  {marker.description && (
                    <Text style={[styles.calloutDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                      {marker.description}
                    </Text>
                  )}
                  <View style={styles.calloutMeta}>
                    <Text style={[styles.calloutLocation, { color: colors.primary }]}>
                      📍 {marker.matchedLocation}
                    </Text>
                    <Text style={[styles.calloutTime, { color: colors.textSecondary }]}>
                      {formatTimestamp(marker.timestamp)}
                    </Text>
                  </View>
                  <View style={styles.voteRow}>
                    <TouchableOpacity
                      style={styles.voteButton}
                      onPress={() => handleVoteCleared(marker.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle" size={18} color="#FF1744" />
                      <Text style={[styles.voteText, { color: '#FF1744' }]}>Cleared</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.voteButton}
                      onPress={() => handleVoteStillThere(marker.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                      <Text style={[styles.voteText, { color: '#4CAF50' }]}>Still there</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Callout>
            ) : (
              <Callout tooltip>
                <View style={[styles.callout, { backgroundColor: colors.surface }]}>
                  <View style={[styles.typeBadge, { backgroundColor: marker.type === 'tip' ? '#9C27B0' : colors.primary }]}>
                    <Text style={styles.typeBadgeText}>
                      {marker.type === 'tip' ? `🟣 ${t('map.showTips')}` : `📰 ${t('map.showNews')}`}
                    </Text>
                  </View>
                  <Text style={[styles.calloutTitle, { color: colors.text }]} numberOfLines={2}>
                    {marker.title}
                  </Text>
                  {marker.description && (
                    <Text style={[styles.calloutDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                      {marker.description}
                    </Text>
                  )}
                  <View style={styles.calloutMeta}>
                    <Text style={[styles.calloutLocation, { color: colors.primary }]}>
                      📍 {marker.matchedLocation}
                    </Text>
                    <Text style={[styles.calloutTime, { color: colors.textSecondary }]}>
                      {formatTimestamp(marker.timestamp)}
                    </Text>
                  </View>
                  {marker.confidence !== 'exact' && (
                    <Text style={[styles.confidenceText, { color: colors.textSecondary }]}>
                      📌 {getConfidenceText(marker.confidence)}
                    </Text>
                  )}
                </View>
              </Callout>
            )}
          </Marker>
        ))}
      </MapView>

      {(!mapReady || isLoading) && (
        <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {locationLoading ? t('location.detecting') : dataLoading ? t('common.loading') : t('common.loading')}
          </Text>
        </View>
      )}

      {error && (
        <View style={[styles.errorBanner, { backgroundColor: '#FF4757' }]}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={refresh}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      )}

      <VoteModal type={voteModalType} visible={voteModalVisible} onHide={() => { setVoteModalVisible(false); setVoteModalType(null); }} />

      {/* Top bar removed — title shown in stack header */}

      <View style={[styles.viewModeBar, { backgroundColor: colors.surface + 'F0' }]}>
        <Pressable onPress={handleMyAreaPress} style={[styles.viewModeButton, viewMode === 'myArea' && { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="locate" size={18} color={viewMode === 'myArea' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.viewModeText, { color: viewMode === 'myArea' ? colors.primary : colors.textSecondary }]}>
            {t('map.myLocation')}
          </Text>
        </Pressable>
        <Pressable onPress={handleNationalPress} style={[styles.viewModeButton, viewMode === 'national' && { backgroundColor: colors.primary + '20' }]}>
          <Text style={styles.flagEmoji}>🇿🇦</Text>
          <Text style={[styles.viewModeText, { color: viewMode === 'national' ? colors.primary : colors.textSecondary }]}>
            {t('map.showAll')}
          </Text>
        </Pressable>
        <View style={styles.viewModeDivider} />
        <Pressable onPress={refresh} style={styles.iconButton}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </Pressable>
        <Pressable onPress={() => setShowRadius(!showRadius)} style={styles.iconButton}>
          <Ionicons name={showRadius ? 'radio-button-on' : 'radio-button-off'} size={20} color={showRadius ? colors.primary : colors.textSecondary} />
        </Pressable>
        <Pressable onPress={() => setHazardModalVisible(true)} style={[styles.iconButton, { marginLeft: 4 }]}>
          <Ionicons name="add-circle" size={20} color="#FF6D00" />
        </Pressable>
      </View>

      <View style={[styles.filterBar, { backgroundColor: colors.surface + 'F0' }]}>
        <Pressable onPress={() => setShowNews(!showNews)} style={[styles.filterButton, showNews && { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.filterButtonText, { color: showNews ? colors.primary : colors.textSecondary }]}>
            📰 {t('map.showNews')} ({viewMode === 'myArea' ? visibleNewsCount : newsCount})
          </Text>
        </Pressable>
        <Pressable onPress={handleTipsToggle} style={[styles.filterButton, showTips && { backgroundColor: '#9C27B0' + '20' }]}>
          <Text style={[styles.filterButtonText, { color: showTips ? '#9C27B0' : colors.textSecondary }]}>
            🟣 {t('map.showTips')} ({viewMode === 'myArea' ? visibleTipsCount : tipsCount})
          </Text>
        </Pressable>
        <Pressable onPress={() => {}} style={[styles.filterButton, { backgroundColor: '#FF6D00' + '20' }]}>
          <Text style={[styles.filterButtonText, { color: '#FF6D00' }]}>
            ⚠️ Hazards ({visibleHazardCount})
          </Text>
        </Pressable>
      </View>

      <View style={styles.cityBar}>
        {MAJOR_CITIES.slice(0, 4).map((city) => {
          const isActive = activeCity === city.key;
          return (
            <Pressable
              key={city.key}
              onPress={() => handleZoomToCity(city.key)}
              style={({ pressed }) => [
                styles.cityButton,
                { backgroundColor: isActive ? colors.primary : colors.surface, borderColor: isActive ? colors.primary : 'transparent' },
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={[styles.cityLabel, { color: isActive ? '#FFFFFF' : colors.text }]}>{city.label}</Text>
              {isActive && (
                <View style={styles.activeIndicator}>
                  <Ionicons name="location" size={10} color="#FFFFFF" />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.legend, { backgroundColor: colors.surface + 'F0' }]}>
        <Text style={[styles.legendTitle, { color: colors.text }]}>{t('map.filters')}</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF1744' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('news.severity.critical')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF5722' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('news.severity.high')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('news.severity.medium')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('news.severity.low')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#9C27B0' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('tabs.tip')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6D00' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Hazard</Text>
          </View>
        </View>
      </View>

      <HazardReportModal
        visible={hazardModalVisible}
        onClose={() => setHazardModalVisible(false)}
        onReported={() => {
          loadHazards();
          setToast("✅ Hazard reported — thank you!");
        }}
        currentLocation={userLat && userLng ? { latitude: userLat, longitude: userLng } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 20 },
  loadingText: { fontSize: Typography.sizes.body, fontFamily: Typography.fonts.regular, marginTop: Spacing.md },
  errorBanner: { position: 'absolute', top: 100, left: Spacing.md, right: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 15 },
  errorText: { color: '#FFFFFF', fontSize: Typography.sizes.caption, flex: 1 },
  retryText: { color: '#FFFFFF', fontFamily: Typography.fonts.bold, marginLeft: Spacing.md },
  viewModeBar: { position: 'absolute', top: 95, left: Spacing.md, flexDirection: 'row', alignItems: 'center', padding: Spacing.xs, borderRadius: BorderRadius.md, zIndex: 10, gap: Spacing.xs },
  viewModeButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm, gap: 4 },
  viewModeText: { fontSize: Typography.sizes.label, fontFamily: Typography.fonts.medium },
  flagEmoji: { fontSize: 16 },
  viewModeDivider: { width: 1, height: 20, backgroundColor: '#E0E0E0', marginHorizontal: Spacing.xs },
  iconButton: { padding: Spacing.xs },
  filterBar: { position: 'absolute', top: 145, left: Spacing.md, flexDirection: 'row', alignItems: 'center', padding: Spacing.xs, borderRadius: BorderRadius.md, zIndex: 10, gap: Spacing.xs },
  filterButton: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  filterButtonText: { fontSize: Typography.sizes.label, fontFamily: Typography.fonts.medium },
  cityBar: { position: 'absolute', top: 95, right: 12, zIndex: 10, gap: Spacing.xs },
  cityButton: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 2, minWidth: 50, alignItems: 'center', ...Shadows.sm },
  buttonPressed: { opacity: 0.7, transform: [{ scale: 0.95 }] },
  cityLabel: { fontSize: Typography.sizes.label, fontFamily: Typography.fonts.bold, textAlign: 'center' },
  activeIndicator: { position: 'absolute', top: -4, right: -4, backgroundColor: '#FF5722', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  legend: { position: 'absolute', bottom: 20, left: Spacing.md, padding: Spacing.sm, borderRadius: BorderRadius.md, zIndex: 10 },
  legendTitle: { fontSize: Typography.sizes.label, fontFamily: Typography.fonts.bold, marginBottom: Spacing.xs },
  legendItems: { gap: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: Typography.sizes.tiny, fontFamily: Typography.fonts.regular },
  markerContainer: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF', ...Shadows.md },
  markerImage: { width: 20, height: 20 },
  callout: { width: 250, padding: Spacing.md, borderRadius: BorderRadius.md, ...Shadows.lg },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm, marginBottom: Spacing.xs },
  typeBadgeText: { color: '#FFFFFF', fontSize: Typography.sizes.tiny, fontFamily: Typography.fonts.bold },
  calloutTitle: { fontSize: Typography.sizes.caption, fontFamily: Typography.fonts.bold, marginBottom: Spacing.xs },
  calloutDescription: { fontSize: Typography.sizes.tiny, fontFamily: Typography.fonts.regular, marginBottom: Spacing.xs },
  calloutMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calloutLocation: { fontSize: Typography.sizes.tiny, fontFamily: Typography.fonts.medium },
  calloutTime: { fontSize: Typography.sizes.tiny, fontFamily: Typography.fonts.mono },
  confidenceText: { fontSize: 10, fontFamily: Typography.fonts.mono, marginTop: 4, fontStyle: 'italic' },
  voteRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.sm, borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: Spacing.sm },
  voteButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  voteText: { fontSize: Typography.sizes.tiny, fontFamily: Typography.fonts.bold },
  voteModalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  voteModal: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    maxWidth: '80%',
  },
  voteModalText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  voteModalSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});