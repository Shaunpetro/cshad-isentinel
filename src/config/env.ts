// src/config/env.ts
/**
 * Environment Configuration
 * Loads from .env file — works on any machine with correct .env
 * See .env.example for required variables
 */

const REQUIRED_VARS = [
  "EXPO_PUBLIC_APP_ENV",
] as const;

// Supabase vars required in production (primary backend)
const REQUIRED_SUPABASE_VARS = [
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_KEY",
] as const;

// Firebase vars only required in production (backup)
const REQUIRED_FIREBASE_VARS = [
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
] as const;

function getVar(key: string, fallback: string = ""): string {
  return process.env[key] ?? fallback;
}

export const env = {
  // Primary backend
  supabase: {
    url: getVar("EXPO_PUBLIC_SUPABASE_URL"),
    anonKey: getVar("EXPO_PUBLIC_SUPABASE_KEY"),
  },

  // Backup backend
  firebase: {
    apiKey: getVar("EXPO_PUBLIC_FIREBASE_API_KEY"),
    authDomain: getVar("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: getVar("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: getVar("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: getVar("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: getVar("EXPO_PUBLIC_FIREBASE_APP_ID"),
  },

  news: {
    apiKey: getVar("EXPO_PUBLIC_NEWS_API_KEY"),
    baseUrl: getVar("EXPO_PUBLIC_NEWS_API_BASE_URL"),
  },

  map: {
    tileUrl: getVar(
      "EXPO_PUBLIC_MAP_TILE_URL",
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    ),
  },

  app: {
    env: getVar("EXPO_PUBLIC_APP_ENV", "development"),
    version: getVar("EXPO_PUBLIC_APP_VERSION", "1.263.2"),
    get isDev() {
      return this.env === "development";
    },
    get isProd() {
      return this.env === "production";
    },
  },
} as const;

export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) missing.push(key);
  }

  if (env.app.isProd) {
    // Supabase required in production
    for (const key of REQUIRED_SUPABASE_VARS) {
      if (!process.env[key]) missing.push(key);
    }
    // Firebase optional but warn if missing
    for (const key of REQUIRED_FIREBASE_VARS) {
      if (!process.env[key]) missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.warn(
      `⚠️ PSHAD Sentinel — Missing environment variables:\n` +
        missing.map((k) => `  • ${k}`).join("\n") +
        `\n\nCopy .env.example to .env and fill in values.`
    );
  }

  return { valid: missing.length === 0, missing };
}