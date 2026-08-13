// app/(stack)/safety.tsx
// Beta 4 – Safety Hub: location‑aware map with auto‑follow, draggable sheet, city filtering

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  PanResponder,
  Dimensions,
  FlatList,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts";
import { useLocationContext } from "@/contexts/LocationContext";
import { useLocalAlerts } from "@/hooks/useLocalAlerts";
import { Typography, Spacing, Shadows } from "@/config/theme";
import { HazardReportModal } from "@/components/hub/HazardReportModal";
import {
  fetchHazards,
  voteHazardCleared,
  voteHazardStillThere,
} from "@/services/map/mapService";
import type { MapMarker } from "@/services/map";

// ---------- constants ----------
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_MIN_HEIGHT = 70;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.45;
const REPORT_FAB_MARGIN = 16;

// ---------- custom CSHAD user marker ----------
function UserLocationMarker({ speed }: { speed: number | null }) {
  const isWalking = speed === null || speed < 5;
  return (
    <View style={userMarkerStyles.wrapper}>
      <View style={userMarkerStyles.outer}>
        <Ionicons name={isWalking ? "shield-checkmark" : "speedometer"} size={18} color="#FFFFFF" />
      </View>
      <View style={userMarkerStyles.arrow} />
    </View>
  );
}

const userMarkerStyles = StyleSheet.create({
  wrapper: { alignItems: "center", justifyContent: "center" },
  outer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1E88E5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#1E88E5",
    marginTop: -1,
  },
});

// ---------- marker color helper ----------
const getMarkerColor = (marker: MapMarker): string => {
  if (marker.type === 'tip') return '#9C27B0';
  if (marker.type === 'hazard') return '#FF6D00';
  if (marker.type === 'nearme') return '#00D4AA';
  switch (marker.severity) {
    case 'critical': return '#FF1744';
    case 'high': return '#FF5722';
    case 'medium': return '#FFC107';
    default: return '#4CAF50';
  }
};

export default function SafetyHubScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const {
    currentCity,
    deviceLocation,
    permissionStatus,
    radiusKm,
    speed,
    refresh: refreshLocation,
  } = useLocationContext();
  const { alerts: nearMeReports, refresh: refreshNearMe } = useLocalAlerts();
  const [hazardMarkers, setHazardMarkers] = useState<MapMarker[]>([]);
  const [hazardModalVisible, setHazardModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  // ---------- draggable sheet (only handle area captures drag) ----------
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 50 || gesture.vy > 0.5) {
          setSheetExpanded(false);
          Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: false }).start();
        } else if (gesture.dy < -50 || gesture.vy < -0.5) {
          setSheetExpanded(true);
          Animated.spring(sheetAnim, {
            toValue: SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const toggleSheet = () => {
    setSheetExpanded(!sheetExpanded);
    Animated.spring(sheetAnim, {
      toValue: sheetExpanded ? 0 : SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT,
      useNativeDriver: false,
    }).start();
  };

  const collapseSheet = () => {
    setSheetExpanded(false);
    Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: false }).start();
  };

  const sheetHeight = sheetAnim.interpolate({
    inputRange: [0, SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT],
    outputRange: [SHEET_MIN_HEIGHT, SHEET_MAX_HEIGHT],
    extrapolate: 'clamp',
  });

  // ---------- load hazards and reports ----------
  const loadHazards = useCallback(async () => {
    const data = await fetchHazards();
    if (!data) return;
    const cityName = currentCity?.name?.toLowerCase();
    let filtered = data.map((h: any) => ({
      id: h.id,
      latitude: h.latitude,
      longitude: h.longitude,
      title: h.category,
      description: h.description,
      type: 'hazard' as const,
      severity: (h.severity as MapMarker['severity']) || 'medium',
      timestamp: h.created_at,
      matchedLocation: h.location_name || 'Unknown',
      confidence: 'exact' as const,
      category: h.category || 'other',
    }));

    // Filter by city name when present, using device location radius as fallback
    if (cityName) {
      filtered = filtered.filter((h) => {
        const loc = h.matchedLocation?.toLowerCase() || '';
        if (loc.includes(cityName)) return true;
        // fallback: within radius of current location
        if (deviceLocation && h.latitude && h.longitude) {
          const R = 6371;
          const dLat = ((h.latitude - deviceLocation.latitude) * Math.PI) / 180;
          const dLon = ((h.longitude - deviceLocation.longitude) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((deviceLocation.latitude * Math.PI) / 180) *
              Math.cos((h.latitude * Math.PI) / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c <= (radiusKm || 25);
        }
        return false;
      });
    }
    setHazardMarkers(filtered);
  }, [currentCity, deviceLocation, radiusKm]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      (async () => {
        await refreshLocation();
        await loadHazards();
        await refreshNearMe();
        setIsLoading(false);
      })();
    }, [refreshLocation, loadHazards, refreshNearMe])
  );

  // Auto‑zoom / follow device location
  useEffect(() => {
    if (deviceLocation && mapRef.current && permissionStatus === 'granted') {
      mapRef.current.animateToRegion(
        {
          latitude: deviceLocation.latitude,
          longitude: deviceLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        600
      );
    }
  }, [deviceLocation?.latitude, deviceLocation?.longitude, permissionStatus]);

  const handleMapReady = useCallback(() => {
    if (deviceLocation) {
      mapRef.current?.animateToRegion(
        {
          latitude: deviceLocation.latitude,
          longitude: deviceLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        600
      );
    }
  }, [deviceLocation]);

  const handleVoteCleared = async (hazardId: string) => {
    await voteHazardCleared(hazardId);
    loadHazards();
  };

  const handleVoteStillThere = async (hazardId: string) => {
    await voteHazardStillThere(hazardId);
    loadHazards();
  };

  const cityNameLower = currentCity?.name?.toLowerCase() || '';
  const incidentMarkers: MapMarker[] = nearMeReports
    .filter((r) => {
      if (!cityNameLower) return true;
      const loc = r.locationName?.toLowerCase() || '';
      return loc.includes(cityNameLower) || !r.locationName;
    })
    .map((r) => ({
      id: r.id,
      latitude: r.latitude,
      longitude: r.longitude,
      title: r.description,
      description: r.description,
      type: 'nearme' as const,
      severity: 'medium' as const,
      timestamp: r.createdAt,
      matchedLocation: r.locationName,
      confidence: 'city' as const,
      category: r.category,
    }));

  const allMarkers = useMemo(() => [...hazardMarkers, ...incidentMarkers], [hazardMarkers, incidentMarkers]);

  const handleSheetItemPress = (item: any) => {
    if (item.latitude && item.longitude && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: item.latitude,
          longitude: item.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        600
      );
      setSelectedId(item.id);
      collapseSheet();
    }
  };

  const handleMapPress = () => {
    setSelectedId(null);
    collapseSheet();
  };

  const userLat = deviceLocation?.latitude;
  const userLng = deviceLocation?.longitude;

  if (isLoading && !userLat) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: userLat || -26.2041,
          longitude: userLng || 28.0473,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onMapReady={handleMapReady}
        showsUserLocation={false}
        followsUserLocation={false}
        showsMyLocationButton={false}
        onPress={handleMapPress}
        mapPadding={{
          top: 0,
          right: 0,
          bottom: sheetExpanded ? SHEET_MAX_HEIGHT : SHEET_MIN_HEIGHT,
          left: 0,
        }}
      >
        {/* Custom user location marker */}
        {userLat && userLng && (
          <Marker
            coordinate={{ latitude: userLat, longitude: userLng }}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={false}
          >
            <UserLocationMarker speed={speed} />
          </Marker>
        )}

        {/* Hazard and incident markers */}
        {allMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            pinColor={getMarkerColor(marker)}
            onPress={() => setSelectedId(marker.id)}
            tracksViewChanges={false}
          >
            {selectedId === marker.id && (
              <Callout tooltip onPress={() => setSelectedId(null)}>
                <View style={[styles.callout, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.calloutTitle, { color: colors.text }]}>{marker.title}</Text>
                  {marker.description ? (
                    <Text style={[styles.calloutDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                      {marker.description}
                    </Text>
                  ) : null}
                  {marker.type === 'hazard' && (
                    <View style={styles.voteRow}>
                      <TouchableOpacity style={styles.voteButton} onPress={() => handleVoteCleared(marker.id)}>
                        <Ionicons name="close-circle" size={18} color="#FF1744" />
                        <Text style={[styles.voteText, { color: '#FF1744' }]}>Cleared</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.voteButton} onPress={() => handleVoteStillThere(marker.id)}>
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                        <Text style={[styles.voteText, { color: '#4CAF50' }]}>Still there</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </Callout>
            )}
          </Marker>
        ))}
      </MapView>

      {/* Report FAB – positioned above sheet */}
      <TouchableOpacity
        style={[
          styles.reportFab,
          {
            backgroundColor: '#FF6D00',
            bottom: sheetExpanded ? SHEET_MAX_HEIGHT + REPORT_FAB_MARGIN : SHEET_MIN_HEIGHT + REPORT_FAB_MARGIN,
          },
        ]}
        onPress={() => setHazardModalVisible(true)}
      >
        <Ionicons name="add-circle" size={24} color="#FFFFFF" />
        <Text style={styles.reportFabText}>+ Report Incident</Text>
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: sheetHeight,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <View style={styles.sheetHeader} {...panResponder.panHandlers}>
          <TouchableOpacity onPress={toggleSheet} style={styles.sheetHandleArea}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.divider }]} />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              Local Incidents ({nearMeReports.length + hazardMarkers.length})
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={[
            ...nearMeReports
              .filter((r) => {
                if (!cityNameLower) return true;
                const loc = r.locationName?.toLowerCase() || '';
                return loc.includes(cityNameLower) || !r.locationName;
              })
              .map((r) => ({
                id: r.id,
                title: r.description,
                description: r.description,
                type: 'nearme',
                latitude: r.latitude,
                longitude: r.longitude,
              })),
            ...hazardMarkers.map((h) => ({
              id: h.id,
              title: h.title,
              description: h.description || '',
              type: 'hazard',
              latitude: h.latitude,
              longitude: h.longitude,
            })),
          ]}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.sheetItem, { borderBottomColor: colors.divider }]}
              onPress={() => handleSheetItemPress(item)}
            >
              <Ionicons
                name={item.type === 'hazard' ? 'warning' : 'information-circle'}
                size={20}
                color={item.type === 'hazard' ? '#FF6D00' : '#00D4AA'}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.sheetItemTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.sheetItemDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </Animated.View>

      <HazardReportModal
        visible={hazardModalVisible}
        onClose={() => setHazardModalVisible(false)}
        onReported={() => { loadHazards(); }}
        currentLocation={userLat && userLng ? { latitude: userLat, longitude: userLng } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  reportFab: {
    position: 'absolute',
    right: REPORT_FAB_MARGIN,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 10,
    gap: 6,
  },
  reportFabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.md,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  sheetHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sheetHandleArea: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
  sheetTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetItemTitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
  },
  sheetItemDesc: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
  callout: {
    padding: 12,
    borderRadius: 12,
    minWidth: 180,
    ...Shadows.md,
  },
  calloutTitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
    marginBottom: 8,
  },
  voteRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.medium,
  },
});