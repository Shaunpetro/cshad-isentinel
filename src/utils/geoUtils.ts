// src/utils/geoUtils.ts
/**
 * Geographic utility functions
 * Used for location-based filtering and distance calculations
 */

import type { GeoPoint } from '@/types';

/**
 * Calculate distance between two points using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistanceKm(
  point1: GeoPoint,
  point2: GeoPoint
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if a point is within radius of another point
 */
export function isWithinRadius(
  center: GeoPoint,
  point: GeoPoint,
  radiusKm: number
): boolean {
  const distance = calculateDistanceKm(center, point);
  return distance <= radiusKm;
}

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  }
  return `${Math.round(distanceKm)}km`;
}

/**
 * Check if coordinates are within South Africa bounds
 */
export function isInSouthAfrica(point: GeoPoint): boolean {
  const bounds = {
    north: -22.0,
    south: -35.0,
    west: 16.0,
    east: 33.0,
  };

  return (
    point.latitude >= bounds.south &&
    point.latitude <= bounds.north &&
    point.longitude >= bounds.west &&
    point.longitude <= bounds.east
  );
}

/**
 * Get bounding box for a center point and radius
 */
export function getBoundingBox(
  center: GeoPoint,
  radiusKm: number
): {
  north: number;
  south: number;
  east: number;
  west: number;
} {
  // Approximate degrees per km at this latitude
  const kmPerDegreeLat = 111.32;
  const kmPerDegreeLon = 111.32 * Math.cos(toRadians(center.latitude));

  const latDelta = radiusKm / kmPerDegreeLat;
  const lonDelta = radiusKm / kmPerDegreeLon;

  return {
    north: center.latitude + latDelta,
    south: center.latitude - latDelta,
    east: center.longitude + lonDelta,
    west: center.longitude - lonDelta,
  };
}

/**
 * Default radius for local news (in km)
 */
export const DEFAULT_RADIUS_KM = 30;

/**
 * Available radius options for user selection
 */
export const RADIUS_OPTIONS = [
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 30, label: '30 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
];