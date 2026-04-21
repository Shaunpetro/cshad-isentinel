// src/services/location/locationService.ts
/**
 * Location Service - Manages user location and city selection
 * Rule 1: Privacy First - Location is optional and user-controlled
 * 
 * Hybrid approach:
 * - 15 major cities for quick selection
 * - Reverse geocoding for actual GPS location (Brits, not Pretoria)
 * - API search for any SA location
 */

import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { SA_CITIES, findNearestCity, createCustomCity, type SACity } from './saCities';
import type { GeoPoint } from '@/types';

// Storage keys
const SELECTED_CITY_KEY = 'pshad_selected_city';
const CUSTOM_CITY_KEY = 'pshad_custom_city';
const LOCATION_RADIUS_KEY = 'pshad_location_radius';

// Types
export type NewsScope = 'local' | 'national' | 'international';

export interface LocationState {
  currentCity: SACity | null;
  deviceLocation: GeoPoint | null;
  radiusKm: number;
  scope: NewsScope;
  permissionStatus: Location.PermissionStatus | null;
  isLoading: boolean;
  error: string | null;
}

// Default state
export const DEFAULT_CITY = SA_CITIES.find((c) => c.id === 'jhb')!;
export const DEFAULT_RADIUS = 30;
export const DEFAULT_SCOPE: NewsScope = 'local';

/**
 * Request location permission
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[LocationService] Permission error:', error);
    return false;
  }
}

/**
 * Get current device location
 */
export async function getCurrentLocation(): Promise<GeoPoint | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.log('[LocationService] Permission not granted');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('[LocationService] Error getting location:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to get actual place name
 */
export async function reverseGeocodeLocation(
  latitude: number,
  longitude: number
): Promise<SACity | null> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (results.length === 0) {
      console.log('[LocationService] No geocode results');
      return null;
    }

    const result = results[0];
    console.log('[LocationService] Geocode result:', result);

    // Extract location name - try city, then subregion, then district
    const name = result.city || result.subregion || result.district || result.name;
    const province = result.region || 'Unknown';

    if (!name) {
      console.log('[LocationService] Could not extract location name');
      return null;
    }

    // Check if this matches a known major city (fuzzy match)
    const matchedCity = findMatchingCity(name, latitude, longitude);
    if (matchedCity) {
      console.log('[LocationService] Matched to known city:', matchedCity.name);
      return matchedCity;
    }

    // Create a custom city entry
    const customCity = createCustomCity(name, province, latitude, longitude);
    console.log('[LocationService] Created custom city:', customCity.name);
    return customCity;

  } catch (error) {
    console.error('[LocationService] Reverse geocode error:', error);
    return null;
  }
}

/**
 * Try to match a location name to a known city
 * Matches if name is similar AND within 10km
 */
function findMatchingCity(
  name: string,
  latitude: number,
  longitude: number
): SACity | null {
  const nameLower = name.toLowerCase();
  
  for (const city of SA_CITIES) {
    const cityNameLower = city.name.toLowerCase();
    
    // Check name similarity
    if (nameLower.includes(cityNameLower) || cityNameLower.includes(nameLower)) {
      // Also check distance - must be within 10km to match
      const distance = calculateDistanceSimple(latitude, longitude, city.latitude, city.longitude);
      if (distance < 10) {
        return city;
      }
    }
  }
  
  return null;
}

/**
 * Simple distance calculation for matching
 */
function calculateDistanceSimple(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Detect location and get actual place name (not just nearest major city)
 */
export async function detectActualLocation(): Promise<SACity | null> {
  const location = await getCurrentLocation();
  
  if (!location) {
    return null;
  }

  // Try to get actual place name via reverse geocoding
  const actualCity = await reverseGeocodeLocation(location.latitude, location.longitude);
  
  if (actualCity) {
    return actualCity;
  }

  // Fallback to nearest major city if geocoding fails
  console.log('[LocationService] Falling back to nearest major city');
  return findNearestCity(location.latitude, location.longitude);
}

/**
 * Legacy function - now uses detectActualLocation
 */
export async function detectNearestCity(): Promise<SACity | null> {
  return detectActualLocation();
}

/**
 * Save selected city to secure storage
 */
export async function saveSelectedCity(cityId: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(SELECTED_CITY_KEY, cityId);
    console.log('[LocationService] City ID saved:', cityId);
  } catch (error) {
    console.error('[LocationService] Error saving city:', error);
  }
}

/**
 * Save custom city data (for non-major cities)
 */
export async function saveCustomCity(city: SACity): Promise<void> {
  try {
    await SecureStore.setItemAsync(CUSTOM_CITY_KEY, JSON.stringify(city));
    await SecureStore.setItemAsync(SELECTED_CITY_KEY, city.id);
    console.log('[LocationService] Custom city saved:', city.name);
  } catch (error) {
    console.error('[LocationService] Error saving custom city:', error);
  }
}

/**
 * Get saved selected city
 */
export async function getSavedCity(): Promise<SACity | null> {
  try {
    const cityId = await SecureStore.getItemAsync(SELECTED_CITY_KEY);

    if (!cityId) {
      return null;
    }

    // Check if it's a known city
    const knownCity = SA_CITIES.find((c) => c.id === cityId);
    if (knownCity) {
      return knownCity;
    }

    // Check if it's a custom city
    if (cityId.startsWith('custom_')) {
      const customCityJson = await SecureStore.getItemAsync(CUSTOM_CITY_KEY);
      if (customCityJson) {
        return JSON.parse(customCityJson) as SACity;
      }
    }

    return null;
  } catch (error) {
    console.error('[LocationService] Error getting saved city:', error);
    return null;
  }
}

/**
 * Save radius preference
 */
export async function saveRadius(radiusKm: number): Promise<void> {
  try {
    await SecureStore.setItemAsync(LOCATION_RADIUS_KEY, radiusKm.toString());
  } catch (error) {
    console.error('[LocationService] Error saving radius:', error);
  }
}

/**
 * Get saved radius preference
 */
export async function getSavedRadius(): Promise<number> {
  try {
    const radius = await SecureStore.getItemAsync(LOCATION_RADIUS_KEY);
    return radius ? parseInt(radius, 10) : DEFAULT_RADIUS;
  } catch (error) {
    console.error('[LocationService] Error getting radius:', error);
    return DEFAULT_RADIUS;
  }
}

/**
 * Initialize location - get saved city or detect actual location
 */
export async function initializeLocation(): Promise<{
  city: SACity;
  radius: number;
  fromDevice: boolean;
}> {
  // Try to get saved city first
  const savedCity = await getSavedCity();
  const savedRadius = await getSavedRadius();

  if (savedCity) {
    return {
      city: savedCity,
      radius: savedRadius,
      fromDevice: false,
    };
  }

  // Try to detect actual location
  const detectedCity = await detectActualLocation();

  if (detectedCity) {
    // Save detected city
    if (detectedCity.isCustom) {
      await saveCustomCity(detectedCity);
    } else {
      await saveSelectedCity(detectedCity.id);
    }
    
    return {
      city: detectedCity,
      radius: savedRadius,
      fromDevice: true,
    };
  }

  // Fallback to default
  return {
    city: DEFAULT_CITY,
    radius: savedRadius,
    fromDevice: false,
  };
}

/**
 * Get all available major cities
 */
export function getAllCities(): SACity[] {
  return SA_CITIES;
}

/**
 * Get cities sorted by population
 */
export function getPopularCities(limit: number = 10): SACity[] {
  return [...SA_CITIES]
    .sort((a, b) => b.population - a.population)
    .slice(0, limit);
}