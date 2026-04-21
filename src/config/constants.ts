/**
 * Application-wide constants
 * No environment variables here — only static values
 */

export const APP = {
  name: "PSHAD Sentinel iHub",
  version: "1.266.0",
  phase: "001",
  phaseMonth: "April 2026",
  developer: "ATG Development",
  slug: "pshad-sentinel-ihub",

  // South Africa default map view
  defaultRegion: {
    latitude: -30.5595,
    longitude: 22.9375,
    latitudeDelta: 10,
    longitudeDelta: 10,
  },

  // Major SA cities for quick navigation
  cities: {
    johannesburg: { latitude: -26.2041, longitude: 28.0473 },
    capeTown: { latitude: -33.9249, longitude: 18.4241 },
    durban: { latitude: -29.8587, longitude: 31.0218 },
    pretoria: { latitude: -25.7479, longitude: 28.2293 },
    portElizabeth: { latitude: -33.918, longitude: 25.57 },
    bloemfontein: { latitude: -29.0852, longitude: 26.1596 },
  },

  languages: ["en", "af", "zu"] as const,
  defaultLanguage: "en" as const,
} as const;

export const API_KEYS = {
  openWeatherMap: "REDACTED_OPENWEATHER_KEY",
  // EskomSePush - free tier (40 calls/day)
  // Get yours at: https://eskomsepush.gumroad.com/l/api
  eskomSePush: "", // Add when you have one
} as const;

export const API_ENDPOINTS = {
  openWeatherMap: {
    base: "https://api.openweathermap.org/data/2.5",
    oneCall: "https://api.openweathermap.org/data/3.0/onecall",
    weather: "https://api.openweathermap.org/data/2.5/weather",
    alerts: "https://api.openweathermap.org/data/2.5/onecall",
  },
  eskomSePush: {
    base: "https://developer.sepush.co.za/business/2.0",
    status: "/status",
    areaSearch: "/areas_search",
    areasNearby: "/areas_nearby",
    areaInfo: "/area",
  },
} as const;

export const LIMITS = {
  tip: {
    maxLength: 2000,
    minLength: 20,
    maxImages: 3,
    maxImageSizeMB: 5,
  },
  news: {
    refreshIntervalMs: 5 * 60 * 1000, // 5 minutes
    maxCachedItems: 200,
    pageSize: 20,
  },
  map: {
    maxPins: 200,
    clusterRadius: 50,
    minZoomForPins: 8,
  },
  notifications: {
    cooldownMs: 30 * 1000, // 30 seconds between alerts
    maxPerHour: 10,
  },
  weather: {
    refreshIntervalMs: 30 * 60 * 1000, // 30 minutes
    alertCacheMs: 15 * 60 * 1000, // 15 minutes
  },
  infrastructure: {
    refreshIntervalMs: 15 * 60 * 1000, // 15 minutes
  },
} as const;

export const STORAGE_KEYS = {
  language: "pshad_language",
  theme: "pshad_theme",
  onboardingComplete: "pshad_onboarding_done",
  notificationPrefs: "pshad_notif_prefs",
  lastNewsSync: "pshad_last_news_sync",
  weatherCache: "pshad_weather_cache",
  infrastructureCache: "pshad_infrastructure_cache",
  dismissedAlerts: "pshad_dismissed_alerts",
} as const;

// South African provinces for weather mapping
export const SA_PROVINCES = {
  GP: { name: "Gauteng", code: "GP" },
  WC: { name: "Western Cape", code: "WC" },
  KZN: { name: "KwaZulu-Natal", code: "KZN" },
  EC: { name: "Eastern Cape", code: "EC" },
  FS: { name: "Free State", code: "FS" },
  LP: { name: "Limpopo", code: "LP" },
  MP: { name: "Mpumalanga", code: "MP" },
  NC: { name: "Northern Cape", code: "NC" },
  NW: { name: "North West", code: "NW" },
} as const;