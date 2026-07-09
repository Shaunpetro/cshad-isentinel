// src/hooks/useLocation.ts
// Beta 4 – returns speed (m/s) from device location for motion‑aware pointer

/**
 * Hook for managing location state in the app
 * Handles city selection, GPS detection, and scope management
 * Supports both major cities and custom locations from GPS/search
 */

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import {
  initializeLocation,
  saveSelectedCity,
  saveCustomCity,
  saveRadius,
  requestLocationPermission,
  detectNearestCity,
  DEFAULT_CITY,
  DEFAULT_RADIUS,
  DEFAULT_SCOPE,
  type SACity,
  type NewsScope,
} from '@/services/location';
import { getPreferences } from '@/services/preferences';
import type { GeoPoint } from '@/types';
import type { LocationStatus } from '@/components/news/LocationBanner';

export interface UseLocationResult {
  // State
  currentCity: SACity;
  deviceLocation: GeoPoint | null;
  radiusKm: number;
  scope: NewsScope;
  isLoading: boolean;
  isDetecting: boolean;
  error: string | null;
  permissionStatus: LocationStatus;
  speed: number | null;  // m/s, null if unavailable

  // Actions
  setCity: (city: SACity) => Promise<void>;
  setRadius: (radiusKm: number) => Promise<void>;
  setScope: (scope: NewsScope) => void;
  detectLocation: () => Promise<SACity | null>;
  requestPermission: () => Promise<boolean>;
  refresh: () => Promise<void>;
  checkPermission: () => Promise<void>;
}

export function useLocation(): UseLocationResult {
  const [currentCity, setCurrentCity] = useState<SACity>(DEFAULT_CITY);
  const [deviceLocation, setDeviceLocation] = useState<GeoPoint | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(DEFAULT_RADIUS);
  const [scope, setScope] = useState<NewsScope>(DEFAULT_SCOPE);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<LocationStatus>('undetermined');
  const [speed, setSpeed] = useState<number | null>(null);

  // Check permission status
  const checkPermission = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionStatus('granted');
      } else if (status === 'denied') {
        setPermissionStatus('denied');
      } else {
        setPermissionStatus('undetermined');
      }
    } catch (err) {
      console.error('[useLocation] Permission check error:', err);
      setPermissionStatus('undetermined');
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await checkPermission();
      const prefs = getPreferences();
      const result = await initializeLocation();
      setCurrentCity(result.city);
      setRadiusKm(result.radius);

      if (result.fromDevice) {
        console.log('[useLocation] City detected from device:', result.city.name);
        setPermissionStatus('granted');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize location';
      setError(message);
      console.error('[useLocation] Init error:', message);
    } finally {
      setIsLoading(false);
    }
  };

  // Watch location for speed updates
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 5 },
        (loc) => {
          if (loc.coords.speed !== undefined && loc.coords.speed !== null) {
            setSpeed(loc.coords.speed);
          }
        }
      );
    };

    startWatching();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [permissionStatus]);

  const handleSetCity = useCallback(async (city: SACity) => {
    try {
      setCurrentCity(city);
      if (city.isCustom) {
        await saveCustomCity(city);
      } else {
        await saveSelectedCity(city.id);
      }
    } catch (err) {
      console.error('[useLocation] Error saving city:', err);
    }
  }, []);

  const handleSetRadius = useCallback(async (newRadius: number) => {
    try {
      setRadiusKm(newRadius);
      await saveRadius(newRadius);
    } catch (err) {
      console.error('[useLocation] Error saving radius:', err);
    }
  }, []);

  const handleSetScope = useCallback((newScope: NewsScope) => {
    setScope(newScope);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await requestLocationPermission();
      if (granted) {
        setPermissionStatus('granted');
        await detectLocation();
      } else {
        setPermissionStatus('denied');
      }
      return granted;
    } catch (err) {
      console.error('[useLocation] Permission request error:', err);
      setPermissionStatus('denied');
      return false;
    }
  }, []);

  const detectLocation = useCallback(async (): Promise<SACity | null> => {
    setIsDetecting(true);
    setError(null);

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionStatus(status === 'denied' ? 'denied' : 'undetermined');
        setError('Location permission not granted');
        return null;
      }

      setPermissionStatus('granted');
      const detectedCity = await detectNearestCity();
      if (detectedCity) {
        setCurrentCity(detectedCity);
        if (detectedCity.isCustom) {
          await saveCustomCity(detectedCity);
        } else {
          await saveSelectedCity(detectedCity.id);
        }
        return detectedCity;
      } else {
        setError('Could not detect location');
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Detection failed';
      setError(message);
      return null;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await initialize();
  }, []);

  return {
    currentCity,
    deviceLocation,
    radiusKm,
    scope,
    isLoading,
    isDetecting,
    error,
    permissionStatus,
    speed,
    setCity: handleSetCity,
    setRadius: handleSetRadius,
    setScope: handleSetScope,
    detectLocation,
    requestPermission,
    refresh,
    checkPermission,
  };
}