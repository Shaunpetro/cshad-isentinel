// src/services/location/geocodingService.ts
/**
 * Geocoding Service - Search for SA locations using OpenStreetMap Nominatim
 * Free API, no key required
 * https://nominatim.org/release-docs/develop/api/Search/
 */

import { createCustomCity, type SACity } from './saCities';

// Nominatim API base URL
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

// Rate limit: Max 1 request per second (Nominatim policy)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000;

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Search for locations in South Africa
 */
export async function searchLocations(query: string): Promise<SACity[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) => 
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }
  lastRequestTime = Date.now();

  try {
    const params = new URLSearchParams({
      q: query,
      countrycodes: 'za', // South Africa only
      format: 'json',
      addressdetails: '1',
      limit: '10',
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}?${params}`, {
      headers: {
        'User-Agent': 'PSHAD-iSentinel/1.0 (community-safety-app)',
      },
    });

    if (!response.ok) {
      console.error('[GeocodingService] API error:', response.status);
      return [];
    }

    const results: NominatimResult[] = await response.json();
    console.log('[GeocodingService] Found', results.length, 'results for:', query);

    // Convert to SACity format
    return results
      .filter((r) => isValidLocationType(r.type))
      .map((r) => convertToCity(r))
      .filter((city): city is SACity => city !== null);

  } catch (error) {
    console.error('[GeocodingService] Search error:', error);
    return [];
  }
}

/**
 * Filter for valid location types
 */
function isValidLocationType(type: string): boolean {
  const validTypes = [
    'city',
    'town',
    'village',
    'suburb',
    'municipality',
    'administrative',
    'residential',
    'locality',
  ];
  return validTypes.includes(type);
}

/**
 * Convert Nominatim result to SACity
 */
function convertToCity(result: NominatimResult): SACity | null {
  const address = result.address;
  
  // Get the best name for this location
  const name = address?.city 
    || address?.town 
    || address?.village 
    || address?.suburb
    || address?.municipality
    || extractNameFromDisplay(result.display_name);

  if (!name) {
    return null;
  }

  const province = address?.state || 'Unknown';
  const latitude = parseFloat(result.lat);
  const longitude = parseFloat(result.lon);

  return createCustomCity(name, province, latitude, longitude);
}

/**
 * Extract first part of display name as location name
 */
function extractNameFromDisplay(displayName: string): string | null {
  const parts = displayName.split(',');
  return parts.length > 0 ? parts[0].trim() : null;
}

/**
 * Debounce helper for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}