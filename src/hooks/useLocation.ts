// src/hooks/useLocation.ts
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

  // Actions
  setCity: (city: SACity) => Promise<void>;
  setRadius: (radiusKm: number) => Promise<void>;
  setScope: (scope: NewsScope) => void;
  detectLocation: () => Promise<void>;
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
      // Check permission status first
      await checkPermission();

      // Try to get saved preferences for default city
      const prefs = getPreferences();
      
      const result = await initializeLocation();
      
      // If no city detected and we have a home location in preferences, use it
      if (!result.fromDevice && prefs.homeLocation) {
        // homeLocation might be set in settings as default
        console.log('[useLocation] Using home location from preferences');
      }
      
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

  const handleSetCity = useCallback(async (city: SACity) => {
    try {
      setCurrentCity(city);

      // Save custom cities differently than major cities
      if (city.isCustom) {
        await saveCustomCity(city);
        console.log('[useLocation] Custom city saved:', city.name);
      } else {
        await saveSelectedCity(city.id);
        console.log('[useLocation] City changed to:', city.name);
      }
    } catch (err) {
      console.error('[useLocation] Error saving city:', err);
    }
  }, []);

  const handleSetRadius = useCallback(async (newRadius: number) => {
    try {
      setRadiusKm(newRadius);
      await saveRadius(newRadius);
      console.log('[useLocation] Radius changed to:', newRadius, 'km');
    } catch (err) {
      console.error('[useLocation] Error saving radius:', err);
    }
  }, []);

  const handleSetScope = useCallback((newScope: NewsScope) => {
    setScope(newScope);
    console.log('[useLocation] Scope changed to:', newScope);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await requestLocationPermission();
      
      if (granted) {
        setPermissionStatus('granted');
        // Auto-detect location after permission granted
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

  const detectLocation = useCallback(async () => {
    setIsDetecting(true);
    setError(null);

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setPermissionStatus(status === 'denied' ? 'denied' : 'undetermined');
        setError('Location permission not granted');
        return;
      }

      setPermissionStatus('granted');
      const detectedCity = await detectNearestCity();

      if (detectedCity) {
        setCurrentCity(detectedCity);

        // Save custom cities differently
        if (detectedCity.isCustom) {
          await saveCustomCity(detectedCity);
          console.log('[useLocation] Detected custom location:', detectedCity.name);
        } else {
          await saveSelectedCity(detectedCity.id);
          console.log('[useLocation] Detected major city:', detectedCity.name);
        }
      } else {
        setError('Could not detect location');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Detection failed';
      setError(message);
      console.error('[useLocation] Detection error:', message);
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
    setCity: handleSetCity,
    setRadius: handleSetRadius,
    setScope: handleSetScope,
    detectLocation,
    requestPermission,
    refresh,
    checkPermission,
  };
}