// src/services/location/locationService.ts
/**
 * Location Service - Manages user location and city selection
 * Rule 1: Privacy First - Location is optional and user-controlled
 *
 * Hybrid approach:
 * - 8 metros + provincial capitals + regional cities for quick selection
 * - Reverse geocoding for actual GPS location (Brits, not Pretoria)
 * - API search for any SA location
 * - IP geolocation fallback when GPS is unavailable (no server logging)
 */

import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import {
  SA_CITIES,
  findNearestCity,
  findCityByName,
  createCustomCity,
  getCityById,
  type SACity,
} from './saCities';
import { fetchIPLocation, matchIPLocationToCity } from './ipGeolocationService';
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

// Default city (Johannesburg)
export const DEFAULT_CITY: SACity = SA_CITIES.find((c) => c.id === 'johannesburg') || {
  id: 'johannesburg',
  name: 'Johannesburg',
  province: 'Gauteng',
  provinceCode: 'GP',
  latitude: -26.2041,
  longitude: 28.0473,
  population: 5635000,
  aliases: ['joburg', 'jozi', 'jhb'],
};

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

    const name = result.city || result.subregion || result.district || result.name;
    const province = result.region || 'Unknown';

    if (!name) {
      console.log('[LocationService] Could not extract location name');
      return null;
    }

    const matchedCity = findMatchingCity(name, latitude, longitude);
    if (matchedCity) {
      console.log('[LocationService] Matched to known city:', matchedCity.name);
      return matchedCity;
    }

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
 */
function findMatchingCity(
  name: string,
  latitude: number,
  longitude: number
): SACity | null {
  const nameLower = name.toLowerCase();

  for (const city of SA_CITIES) {
    const cityNameLower = city.name.toLowerCase();

    let nameMatches = nameLower.includes(cityNameLower) || cityNameLower.includes(nameLower);

    if (!nameMatches && city.aliases) {
      nameMatches = city.aliases.some(alias => {
        const aliasLower = alias.toLowerCase();
        return nameLower.includes(aliasLower) || aliasLower.includes(nameLower);
      });
    }

    if (nameMatches) {
      const distance = calculateDistanceSimple(latitude, longitude, city.latitude, city.longitude);
      if (distance < 15) {
        return city;
      }
    }
  }

  return null;
}

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

export async function detectActualLocation(): Promise<SACity | null> {
  const location = await getCurrentLocation();

  if (!location) {
    return null;
  }

  const actualCity = await reverseGeocodeLocation(location.latitude, location.longitude);

  if (actualCity) {
    return actualCity;
  }

  console.log('[LocationService] Falling back to nearest major city');
  return findNearestCity(location.latitude, location.longitude);
}

export async function detectNearestCity(): Promise<SACity | null> {
  return detectActualLocation();
}

export async function saveSelectedCity(cityId: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(SELECTED_CITY_KEY, cityId);
    console.log('[LocationService] City ID saved:', cityId);
  } catch (error) {
    console.error('[LocationService] Error saving city:', error);
  }
}

export async function saveCustomCity(city: SACity): Promise<void> {
  try {
    await SecureStore.setItemAsync(CUSTOM_CITY_KEY, JSON.stringify(city));
    await SecureStore.setItemAsync(SELECTED_CITY_KEY, city.id);
    console.log('[LocationService] Custom city saved:', city.name);
  } catch (error) {
    console.error('[LocationService] Error saving custom city:', error);
  }
}

export async function getSavedCity(): Promise<SACity | null> {
  try {
    const cityId = await SecureStore.getItemAsync(SELECTED_CITY_KEY);

    if (!cityId) {
      return null;
    }

    const knownCity = getCityById(cityId);
    if (knownCity) {
      return knownCity;
    }

    if (cityId.startsWith('custom_')) {
      const customCityJson = await SecureStore.getItemAsync(CUSTOM_CITY_KEY);
      if (customCityJson) {
        return JSON.parse(customCityJson) as SACity;
      }
    }

    const legacyMapping: Record<string, string> = {
      'jhb': 'johannesburg',
      'pta': 'tshwane',
      'cpt': 'capeTown',
      'dbn': 'ethekwini',
      'eku': 'ekurhuleni',
      'pe': 'nelsonMandelaBay',
      'el': 'buffaloCity',
      'bfn': 'mangaung',
    };

    const mappedId = legacyMapping[cityId.toLowerCase()];
    if (mappedId) {
      const mappedCity = getCityById(mappedId);
      if (mappedCity) {
        await saveSelectedCity(mappedId);
        return mappedCity;
      }
    }

    return null;
  } catch (error) {
    console.error('[LocationService] Error getting saved city:', error);
    return null;
  }
}

export async function saveRadius(radiusKm: number): Promise<void> {
  try {
    await SecureStore.setItemAsync(LOCATION_RADIUS_KEY, radiusKm.toString());
  } catch (error) {
    console.error('[LocationService] Error saving radius:', error);
  }
}

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
 * Initialize location – enhanced with IP fallback
 * Order: saved city → GPS → IP geolocation → default (Johannesburg)
 */
export async function initializeLocation(): Promise<{
  city: SACity;
  radius: number;
  fromDevice: boolean;
}> {
  // 1. Saved city (user preference)
  const savedCity = await getSavedCity();
  const savedRadius = await getSavedRadius();

  if (savedCity) {
    return {
      city: savedCity,
      radius: savedRadius,
      fromDevice: false,
    };
  }

  // 2. GPS detection
  const detectedCity = await detectActualLocation();

  if (detectedCity) {
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

  // 3. IP geolocation fallback (new)
  console.log('[LocationService] GPS unavailable, trying IP geolocation...');
  try {
    const ipLocation = await fetchIPLocation();
    if (ipLocation) {
      // Try to match to a known city
      const ipCityName = ipLocation.city.toLowerCase();
      const matched = SA_CITIES.find(
        (c) =>
          c.name.toLowerCase().includes(ipCityName) ||
          ipCityName.includes(c.name.toLowerCase()) ||
          c.aliases?.some((a) => a.toLowerCase() === ipCityName)
      );

      if (matched) {
        console.log('[LocationService] IP matched to known city:', matched.name);
        await saveSelectedCity(matched.id);
        return {
          city: matched,
          radius: savedRadius,
          fromDevice: true, // treat as detected for UX purposes
        };
      }

      // No exact match – create a custom city from IP data
      const customCity = createCustomCity(
        ipLocation.city,
        ipLocation.region || 'Unknown',
        ipLocation.latitude,
        ipLocation.longitude
      );
      console.log('[LocationService] IP created custom city:', customCity.name);
      await saveCustomCity(customCity);
      return {
        city: customCity,
        radius: savedRadius,
        fromDevice: true,
      };
    }
  } catch (error) {
    console.warn('[LocationService] IP fallback error:', error);
  }

  // 4. Ultimate default – Johannesburg
  return {
    city: DEFAULT_CITY,
    radius: savedRadius,
    fromDevice: false,
  };
}

export function getAllCities(): SACity[] {
  return SA_CITIES;
}

export function getPopularCities(limit: number = 10): SACity[] {
  return [...SA_CITIES]
    .sort((a, b) => b.population - a.population)
    .slice(0, limit);
}