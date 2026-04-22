// src/types/index.ts
/**
 * Core TypeScript definitions for PSHAD Sentinel iHub
 * All shared types live here — imported app-wide
 */

// ---- Geographic ----

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeoRegion extends GeoPoint {
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface SAProvince {
  id: string;
  name: string;
  nameAf: string;
  nameZu: string;
  center: GeoPoint;
}

// ---- News ----

export type NewsSeverity = "low" | "medium" | "high" | "critical";

// All possible news categories from RSS feeds
export type NewsCategory =
  | "crime"
  | "safety"
  | "community"
  | "infrastructure"
  | "weather"
  | "traffic"
  | "general"
  | "politics"
  | "health"
  | "accident"
  | "fire"
  | "water"
  | "electricity"
  | "other";

export type NewsSourceType = "saps" | "metro" | "community" | "media" | "rss";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  body?: string;              // Optional - not all articles have full body
  source: string;
  sourceType: NewsSourceType;
  sourceUrl?: string;         // Optional - not all sources have URLs
  imageUrl?: string;
  category: NewsCategory;
  severity: NewsSeverity;
  location?: GeoPoint;
  locationName?: string;
  province?: string;
  publishedAt: string;        // ISO 8601
  fetchedAt?: string;         // Optional - only set when fetched from API
  isVerified: boolean;
  isBreaking?: boolean;       // For breaking news carousel
}

// ---- Tips ----

export type TipStatus = "pending" | "verified" | "rejected" | "forwarded";
export type TipCategory =
  | "crime_in_progress"
  | "suspicious_activity"
  | "safety_hazard"
  | "infrastructure"
  | "community_concern"
  | "positive_report"
  | "other";

export interface AnonymousTip {
  id: string;
  encryptedContent: string; // Encrypted tip text
  category: TipCategory;
  severity: NewsSeverity;
  location?: GeoPoint;
  locationName?: string;
  province?: string;
  status: TipStatus;
  createdAt: string; // ISO 8601
  moderatedAt?: string;
  // NO user ID, NO device ID, NO IP — zero traceability
}

// ---- Map ----

export type MapPinType = "news" | "tip" | "alert" | "safe_zone";

export interface MapPin {
  id: string;
  type: MapPinType;
  location: GeoPoint;
  title: string;
  severity: NewsSeverity;
  category: NewsCategory | TipCategory;
  timestamp: string;
}

// ---- Notifications ----

export type AlertLevel = "info" | "warning" | "danger" | "critical";

export interface PushAlert {
  id: string;
  title: string;
  body: string;
  level: AlertLevel;
  location?: GeoPoint;
  radius?: number; // km
  category: NewsCategory;
  createdAt: string;
  expiresAt?: string;
}

// ---- User Preferences (stored locally, never on server) ----

export interface UserPreferences {
  language: "en" | "af" | "zu";
  theme: "dark" | "light" | "system";
  notifications: {
    enabled: boolean;
    crimeAlerts: boolean;
    communityUpdates: boolean;
    weatherWarnings: boolean;
    trafficAlerts: boolean;
  };
  map: {
    defaultZoom: number;
    showNewsPins: boolean;
    showTipPins: boolean;
    showAlertPins: boolean;
  };
  privacy: {
    analyticsOptIn: false; // Always false — never changes
    locationSharing: "never" | "tip_only"; // Only used during tip submission
  };
}

// ---- App State ----

export interface AppState {
  isReady: boolean;
  isOnline: boolean;
  currentRegion: GeoRegion;
  selectedProvince?: string;
  newsLastSynced?: string;
}