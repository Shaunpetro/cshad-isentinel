// src/components/hub/HazardReportModal.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '@/config/theme';
import { supabase } from '@/services/supabase/config';

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
  const [liveActive, setLiveActive] = useState(true); // live tracking on by default
  const mapRef = useRef<MapView>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  // Start/stop live tracking
  const toggleLive = useCallback(async () => {
    if (liveActive) {
      // Stop tracking
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
      setLiveActive(false);
      return;
    }
    // Start tracking
    setLiveActive(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location required', 'Enable location to track live hazards.');
      setLiveActive(false);
      return;
    }
    // Get immediate location
    setLocationLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLiveLocation(coords);
      setPinCoords(coords);
      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);
    } catch (err) {
      Alert.alert('Error', 'Could not get live location.');
      setLiveActive(false);
    } finally {
      setLocationLoading(false);
    }
    // Start continuous watch
    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Highest, timeInterval: 2000, distanceInterval: 2 },
      (loc) => {
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setLiveLocation(coords);
        if (liveActive) {
          setPinCoords(coords);
          // Smooth follow: only re‑center if user hasn't dragged recently (we don't track drag, but it's acceptable)
          mapRef.current?.animateToRegion({
            ...coords,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }, 500);
        }
      }
    );
  }, [liveActive]);

  // Initialize on modal open
  useEffect(() => {
    if (visible) {
      setLiveActive(true);
      toggleLive(); // start tracking immediately
    } else {
      // Cleanup on close
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
      setLiveActive(false);
      setPinCoords(null);
      setLiveLocation(null);
    }
    return () => {
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
    };
  }, [visible]);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert(t('common.error'), 'Please describe the hazard.');
      return;
    }
    if (!pinCoords) {
      Alert.alert(t('common.error'), 'Invalid location. Please drag the pin to the correct spot.');
      return;
    }
    const selectedCat = CATEGORIES.find(c => c.key === category);
    if (selectedCat?.needsRoad) {
      Alert.alert('Road hazard', 'Make sure the pin is on the road. Is it correctly placed?', [
        { text: 'No, adjust', style: 'cancel' },
        { text: 'Yes, it\'s on the road', onPress: () => submitReport() },
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
      Alert.alert('Thank you', 'Hazard reported successfully!');
      setDescription('');
      onReported();
      onClose();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || 'Failed to report hazard.');
    } finally {
      setSending(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
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
          >
            {pinCoords && (
              <Marker
                coordinate={pinCoords}
                draggable={!liveActive} // only draggable when live is paused
                onDragEnd={(e) => setPinCoords(e.nativeEvent.coordinate)}
                pinColor="#FF6D00"
              />
            )}
          </MapView>
        )}

        {/* Top bar */}
        <View style={[styles.topBar, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: colors.text }]}>Place Pin on Hazard</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Bottom panel */}
        <View style={[styles.bottomPanel, { backgroundColor: colors.surface }]}>
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
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: '#FF6D00' }]}
            onPress={handleSubmit}
            disabled={sending || !pinCoords}
          >
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.submitText}>{sending ? 'Sending...' : 'Submit Report'}</Text>
          </TouchableOpacity>
        </View>

        {/* Floating live toggle button */}
        <TouchableOpacity
          style={[styles.liveToggle, { backgroundColor: liveActive ? '#FF1744' : colors.surface, borderColor: liveActive ? '#FF1744' : colors.border }]}
          onPress={toggleLive}
        >
          <Ionicons name="locate" size={20} color={liveActive ? '#fff' : colors.text} />
          <Text style={[styles.liveToggleText, { color: liveActive ? '#fff' : colors.text }]}>
            {liveActive ? 'LIVE' : 'PAUSED'}
          </Text>
        </TouchableOpacity>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 50,
    paddingBottom: Spacing.sm,
  },
  closeBtn: { padding: Spacing.xs },
  topTitle: { fontSize: Typography.sizes.body, fontFamily: Typography.fonts.bold },
  recenterBtn: { padding: Spacing.xs },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.bold,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  categoryText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
  },
  textInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    minHeight: 60,
    marginBottom: Spacing.md,
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  submitText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    color: '#fff',
  },
  liveToggle: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  liveToggleText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
  },
});