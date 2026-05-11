// src/services/location/ipGeolocationService.ts
/**
 * IP‑based geolocation fallback for when GPS is unavailable
 * Uses ipapi.co (free, no key required, 45k requests/month)
 * Client‑side only – we never store or log the IP
 */

export interface IPLocationResult {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

/**
 * Fetch approximate location based on device IP
 * Returns null if the service is unreachable or returns invalid data
 */
export async function fetchIPLocation(): Promise<IPLocationResult | null> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      headers: { 'Accept': 'application/json' },
      // No auth, no cookies, no user‑specific data sent
    });

    if (!response.ok) {
      console.warn('[IPGeolocation] Service returned', response.status);
      return null;
    }

    const data = await response.json();

    // Validate essential fields
    if (!data.city || !data.latitude || !data.longitude) {
      console.warn('[IPGeolocation] Incomplete response', data);
      return null;
    }

    return {
      city: data.city,
      region: data.region || data.region_code || '',
      country: data.country_name || data.country || '',
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.warn('[IPGeolocation] Fetch error:', error);
    return null;
  }
}

/**
 * Try to match an IP‑derived location to a known city in our database.
 * Returns the matched city, or a custom city if no match found.
 */
export function matchIPLocationToCity(
  ipLocation: IPLocationResult
): { id: string; name: string; province: string; latitude: number; longitude: number } {
  // We'll import SA_CITIES dynamically later to avoid circular deps
  // For now, return a generic city object
  return {
    id: `ip_${ipLocation.city.toLowerCase().replace(/\s+/g, '_')}`,
    name: ipLocation.city,
    province: ipLocation.region || 'Unknown',
    latitude: ipLocation.latitude,
    longitude: ipLocation.longitude,
  };
}