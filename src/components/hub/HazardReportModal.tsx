// src/components/hub/HazardReportModal.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
  Animated, Easing, PanResponder, Platform, Keyboard,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '@/config/theme';
import { supabase } from '@/services/supabase/config';

// Constants
const BOTTOM_PANEL_BASE_HEIGHT = 320;
const MIN_DISTANCE_M = 8;
const STATIONARY_SPEED_MS = 1.0;

function distanceMeters(a: {lat: number, lng: number}, b: {lat: number, lng: number}) {
  const R = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const l1 = a.lat * Math.PI / 180;
  const l2 = b.lat * Math.PI / 180;
  const a1 = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(l1)*Math.cos(l2)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1-a1));
}

interface HazardReportModalProps {
  visible: boolean;
  onClose: () => void;
  onReported: () => void;
  currentLocation?: { latitude: number; longitude: number };
}

const CATEGORIES = [
  { key: 'pothole', label: 'Pothole', icon: 'alert-circle', needsRoad: true },
  { key: 'burst_pipe', label: 'Burst Pipe', icon: 'water', needsRoad: false },
  { key: 'power_line', label: 'Downed Power Line', icon: 'flash', needsRoad: false },
  { key: 'road_closure', label: 'Road Closure', icon: 'close-circle', needsRoad: true },
  { key: 'accident', label: 'Accident', icon: 'car', needsRoad: true },
  { key: 'other', label: 'Other', icon: 'warning', needsRoad: false },
];

export function HazardReportModal({ visible, onClose, onReported, currentLocation }: HazardReportModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [category, setCategory] = useState('pothole');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [liveLocation, setLiveLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [pinCoords, setPinCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [liveActive, setLiveActive] = useState(true);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const mapRef = useRef<MapView>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const liveActiveRef = useRef(liveActive);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const previousPosition = useRef<{ lat: number; lng: number; timestamp: number } | null>(null);
  const smoothedPosition = useRef<{ latitude: number; longitude: number } | null>(null);

  // Pulsing animation
  useEffect(() => {
    if (liveActive) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(0);
    }
  }, [liveActive, pulseAnim]);

  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // Draggable floating button (only when paused)
  const pan = useRef(new Animated.ValueXY({ x: 16, y: 100 })).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !liveActive,
      onMoveShouldSetPanResponder: () => !liveActive,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => pan.extractOffset(),
    })
  ).current;

  liveActiveRef.current = liveActive;

  // Motion‑aware smooth location update
  const updateSmoothLocation = useCallback((coords: { latitude: number; longitude: number }) => {
    const now = Date.now();
    if (!previousPosition.current) {
      previousPosition.current = { lat: coords.latitude, lng: coords.longitude, timestamp: now };
      smoothedPosition.current = coords;
      setPinCoords(coords);
      return;
    }

    const prev = previousPosition.current;
    const distance = distanceMeters({ lat: prev.lat, lng: prev.lng }, { lat: coords.latitude, lng: coords.longitude });
    const timeSec = (now - prev.timestamp) / 1000;
    const speed = timeSec > 0 ? distance / timeSec : 0;

    // Ignore drift when stationary
    if (speed < STATIONARY_SPEED_MS && distance < MIN_DISTANCE_M) {
      if (smoothedPosition.current) {
        setPinCoords(smoothedPosition.current);
      } else {
        setPinCoords(coords);
        smoothedPosition.current = coords;
      }
      return;
    }

    // Exponential smoothing when moving
    const alpha = 0.4;
    const smoothLat = smoothedPosition.current
      ? smoothedPosition.current.latitude + alpha * (coords.latitude - smoothedPosition.current.latitude)
      : coords.latitude;
    const smoothLng = smoothedPosition.current
      ? smoothedPosition.current.longitude + alpha * (coords.longitude - smoothedPosition.current.longitude)
      : coords.longitude;
    const smoothed = { latitude: smoothLat, longitude: smoothLng };

    smoothedPosition.current = smoothed;
    previousPosition.current = { lat: coords.latitude, lng: coords.longitude, timestamp: now };
    setPinCoords(smoothed);
  }, []);

  const startWatching = useCallback(async () => {
    if (watchRef.current) watchRef.current.remove();
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location required', 'Enable location to track live hazards.');
      setLiveActive(false);
      return;
    }
    setLocationLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLiveLocation(coords);
      updateSmoothLocation(coords);
      setAccuracy(loc.coords.accuracy ?? null);
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 500);
    } catch {
      Alert.alert('Error', 'Could not get live location.');
      setLiveActive(false);
    } finally {
      setLocationLoading(false);
    }
    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Highest, timeInterval: 1500, distanceInterval: 5 },
      (loc) => {
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setLiveLocation(coords);
        setAccuracy(loc.coords.accuracy ?? null);
        if (liveActiveRef.current) {
          updateSmoothLocation(coords);
        }
      }
    );
  }, [updateSmoothLocation]);

  const stopWatching = useCallback(() => {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
  }, []);

  const toggleLive = useCallback(() => {
    if (liveActive) {
      stopWatching();
      setLiveActive(false);
    } else {
      setLiveActive(true);
      startWatching();
    }
  }, [liveActive, startWatching, stopWatching]);

  const recenter = useCallback(async () => {
    if (!liveActive) return;
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
    mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 500);
  }, [liveActive]);

  const refreshGps = async () => {
    setIsRefreshingGps(true);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLiveLocation(coords);
      updateSmoothLocation(coords);
      setAccuracy(loc.coords.accuracy ?? null);
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 500);
    } catch {
      Alert.alert('Error', 'Could not refresh GPS.');
    } finally {
      setIsRefreshingGps(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setLiveActive(true);
      startWatching();
    } else {
      stopWatching();
      setLiveActive(false);
      setPinCoords(null);
      setLiveLocation(null);
      smoothedPosition.current = null;
      previousPosition.current = null;
    }
    return () => stopWatching();
  }, [visible, startWatching, stopWatching]);

  const handleClose = () => {
    if (description.trim().length > 0) {
      Alert.alert('Discard report?', 'You have unsaved information.', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', onPress: onClose },
      ]);
    } else {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert(t('common.error'), 'Please describe the hazard.');
      return;
    }
    if (!pinCoords) {
      Alert.alert(t('common.error'), 'Invalid location.');
      return;
    }
    const selectedCat = CATEGORIES.find(c => c.key === category);
    if (selectedCat?.needsRoad) {
      Alert.alert('Road hazard', 'Is the pin on the road?', [
        { text: 'No, adjust', style: 'cancel' },
        { text: 'Yes', onPress: () => submitReport() },
      ]);
    } else {
      submitReport();
    }
  };

  const submitReport = async () => {
    setSending(true);
    try {
      const { error } = await supabase.from('hazards').insert({
        category,
        description: description.trim(),
        latitude: pinCoords!.latitude,
        longitude: pinCoords!.longitude,
        location_name: 'User reported',
      });
      if (error) throw error;
      onReported();
      onClose();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || 'Failed to report hazard.');
    } finally {
      setSending(false);
    }
  };

  const markerColor = liveActive ? '#2196F3' : '#FF6D00';

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleClose}>
      <View style={styles.fullScreen}>
        {locationLoading && !liveLocation ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Getting precise location...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: liveLocation?.latitude || currentLocation?.latitude || -26.2041,
              longitude: liveLocation?.longitude || currentLocation?.longitude || 28.0473,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            showsUserLocation={false}
            showsMyLocationButton={false}
            mapPadding={{ top: 0, right: 0, bottom: BOTTOM_PANEL_BASE_HEIGHT - keyboardHeight, left: 0 }}
          >
            {pinCoords && (
              <Marker
                coordinate={pinCoords}
                draggable={!liveActive}
                onDragEnd={(e) => setPinCoords(e.nativeEvent.coordinate)}
                pinColor={markerColor}
              />
            )}
          </MapView>
        )}

        {/* Top bar */}
        <View style={[styles.topBar, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: colors.text }]}>Report Hazard</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {liveActive ? (
              <TouchableOpacity onPress={recenter} style={styles.recenterBtn}>
                <Ionicons name="locate" size={24} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={refreshGps} style={styles.recenterBtn} disabled={isRefreshingGps}>
                <Ionicons name="refresh" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Floating live toggle */}
        <Animated.View
          style={[
            styles.liveToggle,
            {
              backgroundColor: liveActive ? '#FF1744' : colors.surface,
              borderColor: liveActive ? '#FF1744' : colors.border,
              opacity: liveActive ? pulseAnim : 1,
            },
            { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity style={styles.liveToggleInner} onPress={toggleLive} activeOpacity={0.7}>
            <Ionicons name="locate" size={20} color={liveActive ? '#fff' : colors.text} />
            <Text style={[styles.liveToggleText, { color: liveActive ? '#fff' : colors.text }]}>
              {liveActive ? 'LIVE' : 'PAUSED'}
            </Text>
            {liveActive && accuracy !== null && accuracy > 20 && (
              <Text style={styles.accuracyBadge}>Weak GPS</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom panel – dynamically shifted by keyboard */}
        <View style={[styles.bottomPanel, { backgroundColor: colors.surface, bottom: keyboardHeight }]}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CATEGORY</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryBtn,
                  {
                    backgroundColor: cat.key === category ? colors.primary : colors.background,
                    borderColor: cat.key === category ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setCategory(cat.key)}
              >
                <Ionicons name={cat.icon as any} size={16} color={cat.key === category ? '#fff' : colors.textSecondary} />
                <Text style={[styles.categoryText, { color: cat.key === category ? '#fff' : colors.textSecondary }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Describe the hazard (e.g., deep pothole, burst pipe)"
            placeholderTextColor={colors.textDisabled}
            multiline
            value={description}
            onChangeText={setDescription}
          />
          {!liveActive && (
            <Text style={[styles.dragHint, { color: colors.textDisabled }]}>Pin is fixed. Drag it to correct location.</Text>
          )}
          {accuracy !== null && accuracy > 30 && (
            <Text style={[styles.dragHint, { color: colors.warning }]}>GPS accuracy is low. Move to open sky or refresh GPS.</Text>
          )}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: '#FF6D00' }]}
            onPress={handleSubmit}
            disabled={sending || !pinCoords}
          >
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.submitText}>{sending ? 'Sending...' : 'Submit Report'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: Spacing.md, fontSize: Typography.sizes.body },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: 50, paddingBottom: Spacing.sm,
  },
  closeBtn: { padding: Spacing.xs },
  topTitle: { fontSize: Typography.sizes.body, fontFamily: Typography.fonts.bold },
  recenterBtn: { padding: Spacing.xs },
  liveToggle: {
    position: 'absolute', top: 100, left: 16,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs,
    borderRadius: 20, borderWidth: 1, zIndex: 20,
    elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  liveToggleInner: { flexDirection: 'row', alignItems: 'center' },
  liveToggleText: {
    fontSize: Typography.sizes.caption, fontFamily: Typography.fonts.bold, marginLeft: 4,
  },
  accuracyBadge: {
    fontSize: 10, color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 4,
    paddingHorizontal: 4, marginLeft: 6, overflow: 'hidden',
  },
  bottomPanel: {
    position: 'absolute', left: 0, right: 0,
    padding: Spacing.lg, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: Typography.sizes.tiny, fontFamily: Typography.fonts.bold, letterSpacing: 0.5, marginBottom: Spacing.xs,
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  categoryBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md, borderWidth: 1, gap: Spacing.xs,
  },
  categoryText: { fontSize: Typography.sizes.caption, fontFamily: Typography.fonts.medium },
  textInput: {
    borderRadius: BorderRadius.md, borderWidth: 1, padding: Spacing.md,
    fontSize: Typography.sizes.body, fontFamily: Typography.fonts.regular, minHeight: 60, marginBottom: Spacing.md,
  },
  dragHint: { fontSize: Typography.sizes.tiny, fontFamily: Typography.fonts.regular, textAlign: 'center', marginBottom: Spacing.sm },
  submitBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, gap: Spacing.sm,
  },
  submitText: { fontSize: Typography.sizes.body, fontFamily: Typography.fonts.bold, color: '#fff' },
});