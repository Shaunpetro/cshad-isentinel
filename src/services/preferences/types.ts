// src/services/preferences/types.ts
/**
 * Preferences Types
 * User settings stored locally via AsyncStorage
 */

// Appearance options
export type AppearanceMode = 'dark' | 'light' | 'system';

// News scope options (matches existing ScopeSelector)
export type NewsScope = 'local' | 'national' | 'international';

// News radius in kilometers
export type NewsRadius = 5 | 10 | 25 | 50 | 100;

// Text size options
export type TextSize = 'small' | 'medium' | 'large' | 'extraLarge';

// Startup screen options
export type StartupScreen = 'news' | 'map' | 'tip' | 'alerts' | 'settings';

// Home location (simplified city reference)
export interface HomeLocation {
  id: string;
  name: string;
  province: string;
  latitude: number;
  longitude: number;
}

// Complete preferences object
export interface UserPreferences {
  // Display
  appearance: AppearanceMode;
  textSize: TextSize;

  // Location & News
  homeLocation: HomeLocation | null;
  newsRadius: NewsRadius;
  defaultScope: NewsScope;
  defaultCategory: string | null; // null = "All"

  // Feedback
  soundEnabled: boolean;
  vibrationEnabled: boolean;

  // Behavior
  startupScreen: StartupScreen;
  autoRefreshMinutes: number | null; // null = disabled
  dataSaverEnabled: boolean;
}

// Default values
export const DEFAULT_PREFERENCES: UserPreferences = {
  appearance: 'system',
  textSize: 'medium',
  homeLocation: null,
  newsRadius: 25,
  defaultScope: 'local',
  defaultCategory: null,
  soundEnabled: true,
  vibrationEnabled: true,
  startupScreen: 'news',
  autoRefreshMinutes: 15,
  dataSaverEnabled: false,
};

// Storage key
export const PREFERENCES_STORAGE_KEY = 'pshad_user_preferences';