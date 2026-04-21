// v1.263_001/src/utils/mapHelpers.ts
import { Colors } from "@/config/theme";
import type {
  NewsSeverity,
  NewsCategory,
  TipCategory,
  MapPinType,
} from "@typeDefs/index";

/**
 * Get pin color based on severity level
 */
export function getSeverityColor(severity: NewsSeverity): string {
  switch (severity) {
    case "critical":
      return Colors.semantic.danger;
    case "high":
      return Colors.semantic.danger;
    case "medium":
      return Colors.semantic.warning;
    case "low":
      return Colors.semantic.success;
    default:
      return Colors.semantic.info;
  }
}

/**
 * Get pin emoji based on news category
 */
export function getCategoryIcon(category: NewsCategory | TipCategory): string {
  const icons: Record<string, string> = {
    // News categories
    crime: "🚨",
    safety: "🛡️",
    community: "🏘️",
    infrastructure: "🔧",
    weather: "⛈️",
    traffic: "🚗",
    general: "📰",

    // Tip categories
    crime_in_progress: "🚨",
    suspicious_activity: "👁️",
    safety_hazard: "⚠️",
    community_concern: "🏘️",
    positive_report: "✅",
    other: "📌",
  };

  return icons[category] || "📌";
}

/**
 * Get pin color based on map pin type
 */
export function getPinTypeColor(type: MapPinType): string {
  switch (type) {
    case "news":
      return Colors.semantic.info;
    case "tip":
      return Colors.special.anonymous;
    case "alert":
      return Colors.semantic.danger;
    case "safe_zone":
      return Colors.semantic.success;
    default:
      return Colors.carbon.silver;
  }
}

/**
 * Calculate distance between two coordinates in meters
 * Uses Haversine formula
 */
export function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a coordinate is within South Africa bounds (rough bounding box)
 */
export function isInSouthAfrica(lat: number, lon: number): boolean {
  return lat >= -35.0 && lat <= -22.0 && lon >= 16.0 && lon <= 33.0;
}